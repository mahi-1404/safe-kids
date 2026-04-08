import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import NotificationPreference from '../models/NotificationPreference';

const router = Router();

// GET /api/notification/preferences — parent gets their preferences
router.get('/preferences', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Upsert: return defaults if not yet configured
    let prefs = await NotificationPreference.findOne({ parent: req.parentId });
    if (!prefs) {
      prefs = await NotificationPreference.create({ parent: req.parentId });
    }
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PATCH /api/notification/preferences — parent updates preferences
router.patch('/preferences', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowed = [
      'geofence_breach', 'sos', 'low_battery', 'blocked_content', 'unknown_contact',
      'sim_change', 'app_install', 'distress_keyword', 'cyberbullying', 'grooming',
      'movement_unusual', 'screen_time_exceeded', 'minPushSeverity',
      'quietHoursEnabled', 'quietFrom', 'quietUntil', 'pushEnabled', 'emailEnabled',
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const prefs = await NotificationPreference.findOneAndUpdate(
      { parent: req.parentId },
      { $set: updates },
      { upsert: true, new: true }
    );

    res.json(prefs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
