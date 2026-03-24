import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { protectChild, ChildAuthRequest } from '../middleware/childAuth';
import ScreenTime from '../models/ScreenTime';
import Child from '../models/Child';
import Alert from '../models/Alert';
import { getIO } from '../config/socket';

const router = Router();

// POST /api/screentime — child app posts daily app usage
router.post('/', protectChild, async (req: ChildAuthRequest, res: Response): Promise<void> => {
  try {
    const { date, apps } = req.body;

    const totalMinutes = apps.reduce((sum: number, app: { durationMinutes: number }) => sum + app.durationMinutes, 0);

    // Upsert — update if exists for this date, create if not
    const screenTime = await ScreenTime.findOneAndUpdate(
      { child: req.childId, date },
      { totalMinutes, apps },
      { upsert: true, new: true }
    );

    // Check if screen time limit is exceeded
    const child = await Child.findById(req.childId);
    if (child && totalMinutes >= child.screenTimeLimit) {
      // Create alert and push to parent
      const alert = await Alert.create({
        child: req.childId,
        parent: req.parentId,
        type: 'blocked_content',
        severity: 'medium',
        title: 'Screen time limit reached',
        message: `${child.name} has used ${totalMinutes} minutes of screen time today (limit: ${child.screenTimeLimit} min)`,
      });

      getIO().to(`parent:${req.parentId}`).emit('alert:new', alert);
    }

    // Push updated screen time to parent dashboard
    getIO().to(`parent:${req.parentId}`).emit('screentime:update', {
      childId: req.childId,
      date,
      totalMinutes,
      apps,
    });

    res.status(201).json({ message: 'OK' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/screentime/:childId/today — parent gets today's usage
router.get('/:childId/today', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const screenTime = await ScreenTime.findOne({ child: req.params.childId, date: today });
    res.json(screenTime || { totalMinutes: 0, apps: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/screentime/:childId/week — parent gets last 7 days usage
router.get('/:childId/week', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const records = await ScreenTime.find({
      child: req.params.childId,
      date: { $in: days },
    });

    // Fill in missing days with 0
    const result = days.map(date => {
      const record = records.find(r => r.date === date);
      return { date, totalMinutes: record?.totalMinutes || 0, apps: record?.apps || [] };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
