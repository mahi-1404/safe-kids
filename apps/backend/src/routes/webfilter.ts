import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { protect, AuthRequest } from '../middleware/auth';
import { protectChild, ChildAuthRequest } from '../middleware/childAuth';
import WebFilterRule, { CATEGORY_PRESETS, FilterMode } from '../models/WebFilterRule';
import Child from '../models/Child';
import { getIO } from '../config/socket';

const router = Router();

// GET /api/webfilter/:childId — parent gets all filter rules
router.get('/:childId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rules = await WebFilterRule.find({ child: req.params.childId, parent: req.parentId });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST /api/webfilter — parent adds a rule (URL or category)
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { childId, mode, url, category, isEnabled } = req.body;

    if (!url && !category) {
      res.status(400).json({ message: 'Either url or category required' });
      return;
    }

    const rule = await WebFilterRule.create({
      child: childId,
      parent: req.parentId,
      mode: mode || 'blacklist',
      url,
      category,
      isEnabled: isEnabled !== undefined ? isEnabled : true,
    });

    getIO().to(`child:${childId}`).emit('policy:webfilter', { action: 'add', rule });

    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PATCH /api/webfilter/:id — toggle or update a rule
router.patch('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rule = await WebFilterRule.findOneAndUpdate(
      { _id: req.params.id, parent: req.parentId },
      { $set: req.body },
      { new: true }
    );
    if (!rule) { res.status(404).json({ message: 'Rule not found' }); return; }

    getIO().to(`child:${rule.child.toString()}`).emit('policy:webfilter', { action: 'update', rule });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE /api/webfilter/:id
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rule = await WebFilterRule.findOneAndDelete({ _id: req.params.id, parent: req.parentId });
    if (!rule) { res.status(404).json({ message: 'Rule not found' }); return; }

    getIO().to(`child:${rule.child.toString()}`).emit('policy:webfilter', { action: 'remove', ruleId: rule._id });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST /api/webfilter/:childId/apply-preset — apply age-preset categories at once
router.post('/:childId/apply-preset', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const child = await Child.findOne({ _id: req.params.childId, parent: req.parentId });
    if (!child) { res.status(404).json({ message: 'Child not found' }); return; }

    const categories = CATEGORY_PRESETS[child.agePreset] || CATEGORY_PRESETS.junior_learner;

    const parentOid = new mongoose.Types.ObjectId(req.parentId!);

    const ops = categories.map(cat => ({
      updateOne: {
        filter: { child: child._id, parent: parentOid, category: cat },
        update: { $set: { mode: 'blacklist' as FilterMode, isEnabled: true } },
        upsert: true,
      },
    }));

    await WebFilterRule.bulkWrite(ops);
    getIO().to(`child:${child._id}`).emit('policy:webfilter:preset', { categories });

    res.json({ message: 'Preset applied', categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/webfilter/:childId/policy — child fetches its full filter policy
router.get('/:childId/policy', protectChild, async (req: ChildAuthRequest, res: Response): Promise<void> => {
  try {
    const rules = await WebFilterRule.find({ child: req.childId, isEnabled: true },
      'mode url category');
    res.json({ rules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST /api/webfilter/check — child checks if a URL is blocked before loading
router.post('/check', protectChild, async (req: ChildAuthRequest, res: Response): Promise<void> => {
  try {
    const { url } = req.body as { url: string };
    if (!url) { res.status(400).json({ message: 'url required' }); return; }

    const rules = await WebFilterRule.find({ child: req.childId, isEnabled: true });

    const whitelist = rules.filter(r => r.mode === 'whitelist');
    const blacklist = rules.filter(r => r.mode === 'blacklist');

    // Whitelist mode: if any whitelist rules exist, URL must match one
    if (whitelist.length > 0) {
      const allowed = whitelist.some(r => r.url && url.includes(r.url));
      if (!allowed) {
        return res.json({ blocked: true, reason: 'Not in whitelist' }) as unknown as void;
      }
    }

    // Blacklist mode: block if URL matches any rule
    const match = blacklist.find(r => r.url && url.includes(r.url));
    if (match) {
      return res.json({ blocked: true, reason: `Blocked URL: ${match.url}` }) as unknown as void;
    }

    res.json({ blocked: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
