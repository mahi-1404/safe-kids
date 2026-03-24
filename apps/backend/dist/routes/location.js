"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const childAuth_1 = require("../middleware/childAuth");
const Location_1 = __importDefault(require("../models/Location"));
const socket_1 = require("../config/socket");
const router = (0, express_1.Router)();
// POST /api/location — child app posts GPS (child auth token)
router.post('/', childAuth_1.protectChild, async (req, res) => {
    try {
        const { latitude, longitude, accuracy, source } = req.body;
        const location = await Location_1.default.create({
            child: req.childId,
            latitude,
            longitude,
            accuracy: accuracy || 0,
            source: source || 'gps',
        });
        // Push live location to parent dashboard via WebSocket
        (0, socket_1.getIO)().to(`parent:${req.parentId}`).emit('location:update', {
            childId: req.childId,
            latitude,
            longitude,
            accuracy,
            timestamp: location.createdAt,
        });
        res.status(201).json({ message: 'OK' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// GET /api/location/:childId/latest — parent gets current location
router.get('/:childId/latest', auth_1.protect, async (req, res) => {
    try {
        const location = await Location_1.default.findOne({ child: req.params.childId }).sort({ createdAt: -1 });
        if (!location) {
            res.status(404).json({ message: 'No location found' });
            return;
        }
        res.json(location);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// GET /api/location/:childId/history — parent gets location history
router.get('/:childId/history', auth_1.protect, async (req, res) => {
    try {
        const { date } = req.query;
        const start = date ? new Date(date) : new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        const locations = await Location_1.default.find({
            child: req.params.childId,
            createdAt: { $gte: start, $lte: end },
        }).sort({ createdAt: 1 });
        res.json(locations);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=location.js.map