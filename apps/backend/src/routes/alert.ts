import { Router, Request, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import Alert from '../models/Alert';
import NotificationPreference from '../models/NotificationPreference';
import { fcm } from '../config/firebase';
import Parent from '../models/Parent';
import { getIO } from '../config/socket';
import { updateRiskScore } from '../services/riskScoring';

const router = Router();

const SEVERITY_ORDER = ['low', 'medium', 'high', 'critical'];

function isQuietHours(quietFrom: string, quietUntil: string): boolean {
  const now = new Date();
  const [fh, fm] = quietFrom.split(':').map(Number);
  const [uh, um] = quietUntil.split(':').map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const fromMins = fh * 60 + fm;
  const untilMins = uh * 60 + um;
  if (fromMins <= untilMins) return nowMins >= fromMins && nowMins < untilMins;
  return nowMins >= fromMins || nowMins < untilMins; // overnight range
}

// POST /api/alert — child app sends an alert
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { childId, parentId, type, severity, title, message, metadata } = req.body;

    const alert = await Alert.create({ child: childId, parent: parentId, type, severity, title, message, metadata });

    // Push real-time alert to parent dashboard (always)
    getIO().to(`parent:${parentId}`).emit('alert:new', alert);

    // Send FCM push — respect notification preferences
    const [parent, prefs] = await Promise.all([
      Parent.findById(parentId),
      NotificationPreference.findOne({ parent: parentId }),
    ]);

    const shouldPush = (() => {
      if (!parent?.fcmToken) return false;
      if (!prefs) return true; // no prefs set → send everything
      if (!prefs.pushEnabled) return false;
      // Check per-type toggle
      const typeKey = type as keyof typeof prefs;
      if (prefs[typeKey] === false) return false;
      // Check min severity
      const minIdx = SEVERITY_ORDER.indexOf(prefs.minPushSeverity);
      const sevIdx = SEVERITY_ORDER.indexOf(severity);
      if (sevIdx < minIdx) return false;
      // Check quiet hours
      if (prefs.quietHoursEnabled && isQuietHours(prefs.quietFrom, prefs.quietUntil)) return false;
      return true;
    })();

    if (shouldPush && parent?.fcmToken) {
      await fcm.send({
        token: parent.fcmToken,
        notification: { title, body: message },
        data: { alertId: alert._id.toString(), type, severity },
      });
    }

    // Recompute risk score asynchronously — don't block the response
    updateRiskScore(childId).then(score => {
      getIO().to(`parent:${parentId}`).emit('child:riskscore', { childId, score });
    }).catch(() => {});

    res.status(201).json({ message: 'Alert sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/alert — parent gets alerts (paginated, filterable)
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50', childId, type, severity, unreadOnly } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));

    const filter: Record<string, unknown> = { parent: req.parentId };
    if (childId) filter.child = childId;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (unreadOnly === 'true') filter.isRead = false;

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Alert.countDocuments(filter),
    ]);

    res.json({ alerts, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PATCH /api/alert/:id/read — mark alert as read
router.patch('/:id/read', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PATCH /api/alert/read-all — mark all alerts as read for a child
router.patch('/read-all', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { childId } = req.body;
    const filter: Record<string, unknown> = { parent: req.parentId, isRead: false };
    if (childId) filter.child = childId;
    await Alert.updateMany(filter, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE /api/alert/:id — parent deletes an alert
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, parent: req.parentId });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
