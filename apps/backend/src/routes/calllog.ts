import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { protectChild, ChildAuthRequest } from '../middleware/childAuth';
import CallLog from '../models/CallLog';
import Alert from '../models/Alert';
import { getIO } from '../config/socket';

const router = Router();

// POST /api/calllog — child app submits batch of call logs
router.post('/', protectChild, async (req: ChildAuthRequest, res: Response): Promise<void> => {
  try {
    const { calls } = req.body as {
      calls: Array<{
        contactName?: string;
        phoneNumber: string;
        direction: 'incoming' | 'outgoing' | 'missed';
        durationSeconds: number;
        timestamp: string;
      }>;
    };

    if (!Array.isArray(calls) || calls.length === 0) {
      res.status(400).json({ message: 'calls array required' });
      return;
    }

    const docs = calls.map(c => ({
      child: req.childId,
      parent: req.parentId,
      contactName: c.contactName,
      phoneNumber: c.phoneNumber,
      direction: c.direction,
      durationSeconds: c.durationSeconds || 0,
      timestamp: new Date(c.timestamp),
      isFlagged: false,
    }));

    await CallLog.insertMany(docs, { ordered: false });

    // Flag unknown contacts with long calls (> 5 min)
    const suspicious = docs.filter(d => !d.contactName && d.durationSeconds > 300);
    for (const call of suspicious) {
      const alert = await Alert.create({
        child: req.childId,
        parent: req.parentId,
        type: 'unknown_contact',
        severity: 'medium',
        title: 'Long call with unknown number',
        message: `${Math.round(call.durationSeconds / 60)} min ${call.direction} call with unknown number ${call.phoneNumber}`,
        metadata: { phoneNumber: call.phoneNumber, durationSeconds: call.durationSeconds },
      });
      getIO().to(`parent:${req.parentId}`).emit('alert:new', alert);
    }

    res.status(201).json({ message: 'OK', inserted: docs.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/calllog/:childId — parent fetches call logs
router.get('/:childId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50', direction } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));

    const filter: Record<string, unknown> = { child: req.params.childId, parent: req.parentId };
    if (direction) filter.direction = direction;

    const [calls, total] = await Promise.all([
      CallLog.find(filter)
        .sort({ timestamp: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      CallLog.countDocuments(filter),
    ]);

    res.json({ calls, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/calllog/:childId/stats — call stats summary
router.get('/:childId/stats', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { days = '7' } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days as string));

    const calls = await CallLog.find({
      child: req.params.childId,
      parent: req.parentId,
      timestamp: { $gte: since },
    });

    const stats = {
      total: calls.length,
      incoming: calls.filter(c => c.direction === 'incoming').length,
      outgoing: calls.filter(c => c.direction === 'outgoing').length,
      missed: calls.filter(c => c.direction === 'missed').length,
      totalDurationSeconds: calls.reduce((sum, c) => sum + c.durationSeconds, 0),
      unknownContacts: calls.filter(c => !c.contactName).length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
