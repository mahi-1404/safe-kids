import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { protect, AuthRequest } from '../middleware/auth';
import { protectChild, ChildAuthRequest } from '../middleware/childAuth';
import Contact from '../models/Contact';

const router = Router();

// POST /api/contact/sync — child syncs full contact list
router.post('/sync', protectChild, async (req: ChildAuthRequest, res: Response): Promise<void> => {
  try {
    const { contacts } = req.body as {
      contacts: Array<{
        name: string;
        phoneNumbers: string[];
        email?: string;
      }>;
    };

    if (!Array.isArray(contacts)) {
      res.status(400).json({ message: 'contacts array required' });
      return;
    }

    const childOid  = new mongoose.Types.ObjectId(req.childId!);
    const parentOid = new mongoose.Types.ObjectId(req.parentId!);

    // Upsert each contact by name (preserve blocked/flagged flags set by parent)
    const ops = contacts.map(c => ({
      updateOne: {
        filter: { child: childOid, name: c.name },
        update: {
          $set: {
            parent: parentOid,
            phoneNumbers: c.phoneNumbers,
            email: c.email,
            lastSyncedAt: new Date(),
          },
          $setOnInsert: { isBlocked: false, isFlagged: false },
        },
        upsert: true,
      },
    }));

    await Contact.bulkWrite(ops);

    res.status(200).json({ message: 'Synced', count: contacts.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/contact/:childId — parent gets child's contact list
router.get('/:childId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, blocked, flagged } = req.query;
    const filter: Record<string, unknown> = { child: req.params.childId, parent: req.parentId };

    if (blocked === 'true') filter.isBlocked = true;
    if (flagged === 'true') filter.isFlagged = true;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const contacts = await Contact.find(filter).sort({ name: 1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PATCH /api/contact/:id/block — parent blocks/unblocks a contact
router.patch('/:id/block', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isBlocked } = req.body;
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, parent: req.parentId },
      { isBlocked },
      { new: true }
    );
    if (!contact) { res.status(404).json({ message: 'Contact not found' }); return; }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PATCH /api/contact/:id/flag — parent flags a contact
router.patch('/:id/flag', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isFlagged, flagReason } = req.body;
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, parent: req.parentId },
      { isFlagged, flagReason },
      { new: true }
    );
    if (!contact) { res.status(404).json({ message: 'Contact not found' }); return; }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/contact/:childId/blocked-numbers — child fetches list of blocked numbers (for call/sms blocking)
router.get('/:childId/blocked-numbers', protectChild, async (req: ChildAuthRequest, res: Response): Promise<void> => {
  try {
    const blocked = await Contact.find({ child: req.childId, isBlocked: true }, 'phoneNumbers');
    const numbers = blocked.flatMap(c => c.phoneNumbers);
    res.json({ blockedNumbers: numbers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
