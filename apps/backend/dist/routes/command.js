"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Command_1 = __importDefault(require("../models/Command"));
const Child_1 = __importDefault(require("../models/Child"));
const firebase_1 = require("../config/firebase");
const socket_1 = require("../config/socket");
const router = (0, express_1.Router)();
// POST /api/command — parent sends command to child device
router.post('/', auth_1.protect, async (req, res) => {
    try {
        const { childId, type, payload } = req.body;
        const command = await Command_1.default.create({
            child: childId,
            parent: req.parentId,
            type,
            payload,
        });
        // Send via WebSocket if child is online
        (0, socket_1.getIO)().to(`child:${childId}`).emit('command:new', { commandId: command._id, type, payload });
        // Also send via FCM as fallback if child is offline
        const child = await Child_1.default.findById(childId);
        if (child?.fcmToken) {
            await firebase_1.fcm.send({
                token: child.fcmToken,
                data: { commandId: command._id.toString(), type, payload: JSON.stringify(payload || {}) },
            });
        }
        await Command_1.default.findByIdAndUpdate(command._id, { status: 'delivered' });
        res.status(201).json({ message: 'Command sent', commandId: command._id });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// PATCH /api/command/:id/executed — child confirms command executed
router.patch('/:id/executed', async (req, res) => {
    try {
        await Command_1.default.findByIdAndUpdate(req.params.id, { status: 'executed' });
        res.json({ message: 'Command execution confirmed' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// GET /api/command/:childId/pending — child polls for pending commands
router.get('/:childId/pending', async (req, res) => {
    try {
        const commands = await Command_1.default.find({ child: req.params.childId, status: 'pending' });
        res.json(commands);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=command.js.map