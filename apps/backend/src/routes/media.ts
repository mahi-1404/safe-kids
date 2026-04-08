import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { protectChild, ChildAuthRequest } from '../middleware/childAuth';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fetch from 'node-fetch';
import Alert from '../models/Alert';
import { getIO } from '../config/socket';

const router = Router();

// ── S3 Client ──────────────────────────────────────────────────────────────
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.AWS_BUCKET_NAME || '';

function s3Available(): boolean {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_BUCKET_NAME);
}

function visionAvailable(): boolean {
  return !!(process.env.GOOGLE_VISION_API_KEY);
}

// ── Google Vision safe-search ───────────────────────────────────────────────
interface SafeSearchResult {
  adult: string;
  violence: string;
  racy: string;
  medical: string;
  spoof: string;
}

const FLAGGED_LEVELS = new Set(['LIKELY', 'VERY_LIKELY']);

async function analyzeImageWithVision(imageBase64: string): Promise<{ safe: boolean; result: SafeSearchResult }> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY!;
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const body = {
    requests: [{
      image: { content: imageBase64 },
      features: [{ type: 'SAFE_SEARCH_DETECTION' }],
    }],
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await resp.json() as { responses: Array<{ safeSearchAnnotation: SafeSearchResult }> };
  const annotation = data.responses?.[0]?.safeSearchAnnotation;

  if (!annotation) return { safe: true, result: {} as SafeSearchResult };

  const safe = !FLAGGED_LEVELS.has(annotation.adult) &&
               !FLAGGED_LEVELS.has(annotation.violence) &&
               !FLAGGED_LEVELS.has(annotation.racy);

  return { safe, result: annotation };
}

// POST /api/media/screenshot — child uploads a screenshot
// Body: { childId, parentId, base64Image, mimeType, context }
router.post('/screenshot', protectChild, async (req: ChildAuthRequest, res: Response): Promise<void> => {
  try {
    const { base64Image, mimeType = 'image/jpeg', context = '' } = req.body;

    if (!base64Image) {
      res.status(400).json({ message: 'base64Image required' });
      return;
    }

    const timestamp = Date.now();
    const s3Key = `screenshots/${req.childId}/${timestamp}.jpg`;
    let s3Url: string | undefined;
    let visionResult: SafeSearchResult | undefined;
    let isFlagged = false;

    // 1. Analyze with Vision API first (before storing)
    if (visionAvailable()) {
      const { safe, result } = await analyzeImageWithVision(base64Image);
      visionResult = result;
      if (!safe) {
        isFlagged = true;

        const alert = await Alert.create({
          child: req.childId,
          parent: req.parentId,
          type: 'blocked_content',
          severity: 'high',
          title: 'Inappropriate content detected',
          message: `Screenshot flagged: adult=${result.adult}, violence=${result.violence}, racy=${result.racy}`,
          metadata: { context, safeSearch: result },
        });

        getIO().to(`parent:${req.parentId}`).emit('alert:new', alert);
      }
    }

    // 2. Upload to S3
    if (s3Available()) {
      const imageBuffer = Buffer.from(base64Image, 'base64');
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        Body: imageBuffer,
        ContentType: mimeType,
        Metadata: {
          childId: req.childId!,
          parentId: req.parentId!,
          flagged: String(isFlagged),
        },
      }));
      s3Url = `https://${BUCKET}.s3.amazonaws.com/${s3Key}`;
    }

    res.status(201).json({
      message: 'OK',
      s3Key,
      s3Url,
      isFlagged,
      visionResult,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/media/screenshot/:childId — parent lists child screenshots (returns signed URLs)
router.get('/screenshot/:childId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!s3Available()) {
      res.status(503).json({ message: 'S3 not configured' });
      return;
    }

    const { limit = '20' } = req.query;
    const limitNum = Math.min(50, parseInt(limit as string));

    // Generate pre-signed URLs for the last N screenshots
    // We derive keys based on naming convention since we don't store a DB record per screenshot
    // In production you'd store metadata in MongoDB; for now return a helpful message
    res.json({
      message: 'Use /api/media/screenshot/:childId/:timestamp to get a specific screenshot.',
      note: 'Screenshots are stored in S3 under screenshots/{childId}/ prefix.',
      bucketPrefix: `screenshots/${req.params.childId}/`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST /api/media/analyze — parent or child submits an image URL for Vision analysis
router.post('/analyze', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!visionAvailable()) {
      res.status(503).json({ message: 'Google Vision API not configured (GOOGLE_VISION_API_KEY missing)' });
      return;
    }

    const { base64Image } = req.body;
    if (!base64Image) {
      res.status(400).json({ message: 'base64Image required' });
      return;
    }

    const { safe, result } = await analyzeImageWithVision(base64Image);
    res.json({ safe, result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/media/presign — get a pre-signed upload URL (parent dashboard use)
router.get('/presign', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!s3Available()) {
      res.status(503).json({ message: 'S3 not configured' });
      return;
    }

    const { childId, filename } = req.query as { childId: string; filename: string };
    if (!childId || !filename) {
      res.status(400).json({ message: 'childId and filename required' });
      return;
    }

    const key = `uploads/${childId}/${Date.now()}_${filename}`;
    const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 300 });
    res.json({ url, key });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
