"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Alert_1 = __importDefault(require("../models/Alert"));
const firebase_1 = require("../config/firebase");
const Parent_1 = __importDefault(require("../models/Parent"));
const socket_1 = require("../config/socket");
const router = (0, express_1.Router)();
// POST /api/alert — child app sends an alert
router.post('/', async (req, res) => {
    try {
        const { childId, parentId, type, severity, title, message, metadata } = req.body;
        const alert = await Alert_1.default.create({ child: childId, parent: parentId, type, severity, title, message, metadata });
        // Push real-time alert to parent dashboard
        (0, socket_1.getIO)().to(`parent:${parentId}`).emit('alert:new', alert);
        // Send FCM push to parent mobile
        const parent = await Parent_1.default.findById(parentId);
        if (parent?.fcmToken) {
            await firebase_1.fcm.send({
                token: parent.fcmToken,
                notification: { title, body: message },
                data: { alertId: alert._id.toString(), type, severity },
            });
        }
        res.status(201).json({ message: 'Alert sent' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// GET /api/alert — parent gets all alerts
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const alerts = await Alert_1.default.find({ parent: req.parentId }).sort({ createdAt: -1 }).limit(50);
        res.json(alerts);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// PATCH /api/alert/:id/read — mark alert as read
router.patch('/:id/read', auth_1.protect, async (req, res) => {
    try {
        await Alert_1.default.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: 'Alert marked as read' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=alert.js.map