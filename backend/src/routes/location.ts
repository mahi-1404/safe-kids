import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { protectChild, ChildAuthRequest } from '../middleware/childAuth';
import Location from '../models/Location';
import { getIO } from '../config/socket';

const router = Router();

// POST /api/location — child app posts GPS (child auth token)
router.post('/', protectChild, async (req: ChildAuthRequest, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, accuracy, source } = req.body;

    const location = await Location.create({
      child: req.childId,
      latitude,
      longitude,
      accuracy: accuracy || 0,
      source: source || 'gps',
    });

    // Push live location to parent dashboard via WebSocket
    getIO().to(`parent:${req.parentId}`).emit('location:update', {
      childId: req.childId,
      latitude,
      longitude,
      accuracy,
      timestamp: location.createdAt,
    });

    res.status(201).json({ message: 'OK' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/location/:childId/latest — parent gets current location
router.get('/:childId/latest', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const location = await Location.findOne({ child: req.params.childId }).sort({ createdAt: -1 });
    if (!location) {
      res.status(404).json({ message: 'No location found' });
      return;
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/location/:childId/history — parent gets location history
router.get('/:childId/history', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    const start = date ? new Date(date as string) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const locations = await Location.find({
      child: req.params.childId,
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: 1 });

    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
