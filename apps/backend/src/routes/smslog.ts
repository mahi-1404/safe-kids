import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { protectChild, ChildAuthRequest } from '../middleware/childAuth';
import SmsLog from '../models/SmsLog';
import Alert from '../models/Alert';
import { getIO } from '../config/socket';

const router = Router();

const DISTRESS_KEYWORDS = [
  'help me', 'please help', 'save me', 'i want to die', 'kill myself',
  'hurt myself', 'meet me alone', 'dont tell your parents', "don't tell",
  'our secret', 'send photos', 'send pictures', 'you are so hot', 'grooming',
  'run away', 'come alone',
];

function detectFlag(body: string): { flagged: boolean; reason?: string } {
  const lower = body.toLowerCase();
  for (const keyword of DISTRESS_KEYWORDS) {
    if (lower.includes(keyword)) {
      return { flagged: true, reason: `Distress keyword detected: "${keyword}"` };
    }
  }
  return { flagged: false };
}

// POST /api/smslog — child app submits batch of SMS logs
router.post('/', protectChild, async (req: ChildAuthRequest, res: Response): Promise<void> => {
  try {
    const { messages } = req.body as {
      messages: Array<{
        contactName?: string;
        phoneNumber: string;
        direction: 'incoming' | 'outgoing';
        body: string;
        timestamp: string;
      }>;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ message: 'messages array required' });
      return;
    }

    const docs = messages.map(m => {
      const { flagged, reason } = detectFlag(m.body);
      return {
        child: req.childId,
        parent: req.parentId,
        contactName: m.contactName,
        phoneNumber: m.phoneNumber,
        direction: m.direction,
        body: m.body,
        timestamp: new Date(m.timestamp),
        isFlagged: flagged,
        flagReason: reason,
      };
    });

    await SmsLog.insertMany(docs, { ordered: false });

    // Alert parent for any flagged messages
    const flagged = docs.filter(d => d.isFlagged);
    for (const msg of flagged) {
      const alert = await Alert.create({
        child: req.childId,
        parent: req.parentId,
        type: 'distress_keyword',
        severity: 'high',
        title: 'Suspicious SMS detected',
        message: `SMS ${msg.direction === 'incoming' ? 'from' : 'to'} ${msg.contactName || msg.phoneNumber}: ${msg.flagReason}`,
        metadata: { phoneNumber: msg.phoneNumber, snippet: msg.body.slice(0, 100) },
      });
      getIO().to(`parent:${req.parentId}`).emit('alert:new', alert);
    }

    res.status(201).json({ message: 'OK', inserted: docs.length, flagged: flagged.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/smslog/:childId — parent fetches SMS logs
router.get('/:childId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50', flaggedOnly, phoneNumber } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));

    const filter: Record<string, unknown> = { child: req.params.childId, parent: req.parentId };
    if (flaggedOnly === 'true') filter.isFlagged = true;
    if (phoneNumber) filter.phoneNumber = phoneNumber;

    const [logs, total] = await Promise.all([
      SmsLog.find(filter)
        .sort({ timestamp: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      SmsLog.countDocuments(filter),
    ]);

    res.json({ logs, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/smslog/:childId/flagged — parent gets only flagged messages
router.get('/:childId/flagged', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await SmsLog.find({ child: req.params.childId, parent: req.parentId, isFlagged: true })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
