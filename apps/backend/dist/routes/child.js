"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Child_1 = __importDefault(require("../models/Child"));
const Parent_1 = __importDefault(require("../models/Parent"));
const router = (0, express_1.Router)();
// POST /api/child/create — parent creates a child profile from web dashboard
router.post('/create', auth_1.protect, async (req, res) => {
    try {
        const { name, age, agePreset } = req.body;
        const child = await Child_1.default.create({
            name,
            age,
            parent: req.parentId,
            agePreset: agePreset || 'custom',
        });
        await Parent_1.default.findByIdAndUpdate(req.parentId, { $push: { children: child._id } });
        res.status(201).json({ child });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// PATCH /api/child/:id/fcm — child app updates FCM token when it changes
router.patch('/:id/fcm', async (req, res) => {
    try {
        const { fcmToken } = req.body;
        await Child_1.default.findByIdAndUpdate(req.params.id, { fcmToken });
        res.json({ message: 'FCM token updated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// GET /api/child/:id — get child profile (parent only)
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const child = await Child_1.default.findOne({ _id: req.params.id, parent: req.parentId });
        if (!child) {
            res.status(404).json({ message: 'Child not found' });
            return;
        }
        res.json(child);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// GET /api/child — get all children for parent
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const children = await Child_1.default.find({ parent: req.parentId });
        res.json(children);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// PATCH /api/child/:id/heartbeat — child app sends heartbeat every 60 seconds
router.patch('/:id/heartbeat', async (req, res) => {
    try {
        const { batteryLevel } = req.body;
        await Child_1.default.findByIdAndUpdate(req.params.id, {
            isOnline: true,
            lastSeen: new Date(),
            batteryLevel,
        });
        res.json({ message: 'OK' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// PATCH /api/child/:id/offline — mark child offline
router.patch('/:id/offline', async (req, res) => {
    try {
        await Child_1.default.findByIdAndUpdate(req.params.id, { isOnline: false });
        res.json({ message: 'OK' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=child.js.map