import { Router, Request, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import Alert from '../models/Alert';
import { fcm } from '../config/firebase';
import Parent from '../models/Parent';
import { getIO } from '../config/socket';

const router = Router();

// POST /api/alert — child app sends an alert
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { childId, parentId, type, severity, title, message, metadata } = req.body;

    const alert = await Alert.create({ child: childId, parent: parentId, type, severity, title, message, metadata });

    // Push real-time alert to parent dashboard
    getIO().to(`parent:${parentId}`).emit('alert:new', alert);

    // Send FCM push to parent mobile
    const parent = await Parent.findById(parentId);
    if (parent?.fcmToken) {
      await fcm.send({
        token: parent.fcmToken,
        notification: { title, body: message },
        data: { alertId: alert._id.toString(), type, severity },
      });
    }

    res.status(201).json({ message: 'Alert sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/alert — parent gets all alerts
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alerts = await Alert.find({ parent: req.parentId }).sort({ createdAt: -1 }).limit(50);
    res.json(alerts);
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

export default router;
