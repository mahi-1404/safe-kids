import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import Command from '../models/Command';
import Child from '../models/Child';
import { fcm } from '../config/firebase';
import { getIO } from '../config/socket';

const router = Router();

// POST /api/command — parent sends command to child device
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { childId, type, payload } = req.body;

    const command = await Command.create({
      child: childId,
      parent: req.parentId,
      type,
      payload,
    });

    // Send via WebSocket if child is online
    getIO().to(`child:${childId}`).emit('command:new', { commandId: command._id, type, payload });

    // Also send via FCM as fallback if child is offline
    const child = await Child.findById(childId);
    if (child?.fcmToken) {
      await fcm.send({
        token: child.fcmToken,
        data: { commandId: command._id.toString(), type, payload: JSON.stringify(payload || {}) },
      });
    }

    await Command.findByIdAndUpdate(command._id, { status: 'delivered' });

    res.status(201).json({ message: 'Command sent', commandId: command._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PATCH /api/command/:id/executed — child confirms command executed
router.patch('/:id/executed', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Command.findByIdAndUpdate(req.params.id, { status: 'executed' });
    res.json({ message: 'Command execution confirmed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/command/:childId/pending — child polls for pending commands
router.get('/:childId/pending', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const commands = await Command.find({ child: req.params.childId, status: 'pending' });
    res.json(commands);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
