import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { protect, AuthRequest } from '../middleware/auth';
import { protectChild, ChildAuthRequest } from '../middleware/childAuth';
import AppRule from '../models/AppRule';
import { getIO } from '../config/socket';

const router = Router();

// GET /api/apprule/:childId — parent gets all app rules for a child
router.get('/:childId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rules = await AppRule.find({ child: req.params.childId, parent: req.parentId }).sort({ appName: 1 });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST /api/apprule — parent creates/upserts an app rule
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { childId, packageName, appName, category, isBlocked, scheduleEnabled, blockedFrom, blockedUntil, blockedDays, dailyLimitMinutes } = req.body;

    const rule = await AppRule.findOneAndUpdate(
      { child: childId, packageName },
      { parent: req.parentId, appName, category, isBlocked, scheduleEnabled, blockedFrom, blockedUntil, blockedDays, dailyLimitMinutes },
      { upsert: true, new: true }
    );

    // Push updated policy to child device in real time
    getIO().to(`child:${childId}`).emit('policy:apprules', { packageName, isBlocked, scheduleEnabled, blockedFrom, blockedUntil, blockedDays, dailyLimitMinutes });

    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PATCH /api/apprule/:id — parent updates a specific rule
router.patch('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rule = await AppRule.findOneAndUpdate(
      { _id: req.params.id, parent: req.parentId },
      { $set: req.body },
      { new: true }
    );
    if (!rule) { res.status(404).json({ message: 'Rule not found' }); return; }

    getIO().to(`child:${rule.child.toString()}`).emit('policy:apprules', {
      packageName: rule.packageName,
      isBlocked: rule.isBlocked,
      scheduleEnabled: rule.scheduleEnabled,
      blockedFrom: rule.blockedFrom,
      blockedUntil: rule.blockedUntil,
      blockedDays: rule.blockedDays,
      dailyLimitMinutes: rule.dailyLimitMinutes,
    });

    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE /api/apprule/:id — parent removes a rule
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rule = await AppRule.findOneAndDelete({ _id: req.params.id, parent: req.parentId });
    if (!rule) { res.status(404).json({ message: 'Rule not found' }); return; }
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/apprule/:childId/policy — child fetches its full app policy (blocked packages + limits)
router.get('/:childId/policy', protectChild, async (req: ChildAuthRequest, res: Response): Promise<void> => {
  try {
    const rules = await AppRule.find({ child: req.childId }, 'packageName isBlocked scheduleEnabled blockedFrom blockedUntil blockedDays dailyLimitMinutes');
    res.json({ rules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST /api/apprule/bulk — parent blocks/unblocks many apps at once
router.post('/bulk', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { childId, packages, isBlocked } = req.body as {
      childId: string;
      packages: Array<{ packageName: string; appName: string; category?: string }>;
      isBlocked: boolean;
    };

    const parentOid = new mongoose.Types.ObjectId(req.parentId!);
    const childOid  = new mongoose.Types.ObjectId(childId);

    const ops = packages.map(p => ({
      updateOne: {
        filter: { child: childOid, packageName: p.packageName },
        update: { $set: { parent: parentOid, appName: p.appName, category: p.category, isBlocked } },
        upsert: true,
      },
    }));

    await AppRule.bulkWrite(ops);

    getIO().to(`child:${childId}`).emit('policy:apprules:bulk', { packages: packages.map(p => p.packageName), isBlocked });

    res.json({ message: 'Bulk update applied', count: packages.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
