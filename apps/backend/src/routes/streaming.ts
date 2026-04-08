import { Router, Response } from 'express';
import crypto from 'crypto';
import { protect, AuthRequest } from '../middleware/auth';
import Child from '../models/Child';
import { getIO } from '../config/socket';

const router = Router();

const AGORA_APP_ID = process.env.AGORA_APP_ID || '';
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';

// ──────────────────────────────────────────────────────────────────────────────
// Agora RTC Token generator (UID-based, no SDK dependency)
// Implements Agora Access Token v2 signing manually so we don't need the
// proprietary agora-token npm package (which has no official types).
// ──────────────────────────────────────────────────────────────────────────────

const PRIVILEGE_JOIN_CHANNEL = 1;
const PRIVILEGE_PUBLISH_AUDIO = 2;
const PRIVILEGE_PUBLISH_VIDEO = 3;
const PRIVILEGE_PUBLISH_DATA  = 4;

function packUint16(v: number): Buffer {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(v, 0);
  return b;
}
function packUint32(v: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(v >>> 0, 0);
  return b;
}
function packString(s: string): Buffer {
  const str = Buffer.from(s, 'utf8');
  return Buffer.concat([packUint16(str.length), str]);
}
function packMapUint32(m: Map<number, number>): Buffer {
  const parts: Buffer[] = [packUint16(m.size)];
  m.forEach((v, k) => {
    parts.push(packUint32(k));
    parts.push(packUint32(v));
  });
  return Buffer.concat(parts);
}

function generateAgoraToken(
  appId: string,
  appCert: string,
  channelName: string,
  uid: number,
  role: 'publisher' | 'subscriber',
  expireSeconds: number
): string {
  const ts = Math.floor(Date.now() / 1000);
  const salt = Math.floor(Math.random() * 0xffffffff);
  const expireTs = ts + expireSeconds;

  const privileges = new Map<number, number>();
  privileges.set(PRIVILEGE_JOIN_CHANNEL, expireTs);
  if (role === 'publisher') {
    privileges.set(PRIVILEGE_PUBLISH_AUDIO, expireTs);
    privileges.set(PRIVILEGE_PUBLISH_VIDEO, expireTs);
    privileges.set(PRIVILEGE_PUBLISH_DATA, expireTs);
  }

  const msg = Buffer.concat([
    packUint32(salt),
    packUint32(ts),
    packMapUint32(privileges),
  ]);

  const toSign = Buffer.concat([
    packString(appId),
    packString(channelName),
    packString(uid.toString()),
    msg,
  ]);

  const sig = crypto.createHmac('sha256', appCert).update(toSign).digest();

  const content = Buffer.concat([
    packString(sig.toString('hex')),
    packUint32(salt),
    packUint32(ts),
    packMapUint32(privileges),
  ]);

  const version = '006';
  return version + appId + Buffer.from(content).toString('base64');
}

// POST /api/streaming/token — parent requests an Agora token to view child camera
router.post('/token', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      res.status(503).json({ message: 'Streaming not configured (AGORA_APP_ID / AGORA_APP_CERTIFICATE missing)' });
      return;
    }

    const { childId, type = 'camera' } = req.body as { childId: string; type?: 'camera' | 'screen' | 'audio' };

    const child = await Child.findOne({ _id: childId, parent: req.parentId });
    if (!child) { res.status(404).json({ message: 'Child not found' }); return; }

    // Channel name encodes childId + type for isolation
    const channelName = `sk_${childId}_${type}`;
    const uid = Math.floor(Math.random() * 100000);
    const expireSeconds = 3600; // 1 hour

    const token = generateAgoraToken(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      'subscriber',
      expireSeconds
    );

    // Notify child device to start broadcasting
    getIO().to(`child:${childId}`).emit('streaming:start', {
      channelName,
      appId: AGORA_APP_ID,
      type,
      requestedBy: req.parentId,
    });

    res.json({
      token,
      channelName,
      appId: AGORA_APP_ID,
      uid,
      expiresAt: new Date(Date.now() + expireSeconds * 1000).toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST /api/streaming/stop — parent stops the stream
router.post('/stop', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { childId, type = 'camera' } = req.body;
    const child = await Child.findOne({ _id: childId, parent: req.parentId });
    if (!child) { res.status(404).json({ message: 'Child not found' }); return; }

    getIO().to(`child:${childId}`).emit('streaming:stop', { type });
    res.json({ message: 'Stop signal sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
