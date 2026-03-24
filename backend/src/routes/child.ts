import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import Child from '../models/Child';
import Parent from '../models/Parent';

const router = Router();

// POST /api/child/create — parent creates a child profile from web dashboard
router.post('/create', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, age, agePreset } = req.body;

    const child = await Child.create({
      name,
      age,
      parent: req.parentId,
      agePreset: agePreset || 'custom',
    });

    await Parent.findByIdAndUpdate(req.parentId, { $push: { children: child._id } });

    res.status(201).json({ child });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PATCH /api/child/:id/fcm — child app updates FCM token when it changes
router.patch('/:id/fcm', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fcmToken } = req.body;
    await Child.findByIdAndUpdate(req.params.id, { fcmToken });
    res.json({ message: 'FCM token updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/child/:id — get child profile (parent only)
router.get('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const child = await Child.findOne({ _id: req.params.id, parent: req.parentId });
    if (!child) {
      res.status(404).json({ message: 'Child not found' });
      return;
    }
    res.json(child);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/child — get all children for parent
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const children = await Child.find({ parent: req.parentId });
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PATCH /api/child/:id/heartbeat — child app sends heartbeat every 60 seconds
router.patch('/:id/heartbeat', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { batteryLevel } = req.body;
    await Child.findByIdAndUpdate(req.params.id, {
      isOnline: true,
      lastSeen: new Date(),
      batteryLevel,
    });
    res.json({ message: 'OK' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PATCH /api/child/:id/offline — mark child offline
router.patch('/:id/offline', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Child.findByIdAndUpdate(req.params.id, { isOnline: false });
    res.json({ message: 'OK' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
