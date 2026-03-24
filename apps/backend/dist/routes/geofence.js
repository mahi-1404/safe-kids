"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const childAuth_1 = require("../middleware/childAuth");
const Geofence_1 = __importDefault(require("../models/Geofence"));
const Alert_1 = __importDefault(require("../models/Alert"));
const socket_1 = require("../config/socket");
const router = (0, express_1.Router)();
// Haversine formula — distance in meters between two GPS points
const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
// POST /api/geofence — parent creates a geofence zone
router.post('/', auth_1.protect, async (req, res) => {
    try {
        const { childId, name, type, latitude, longitude, radiusMeters, alertOnExit, alertOnEnter } = req.body;
        const geofence = await Geofence_1.default.create({
            parent: req.parentId,
            child: childId,
            name,
            type: type || 'custom',
            latitude,
            longitude,
            radiusMeters: radiusMeters || 200,
            alertOnExit: alertOnExit !== undefined ? alertOnExit : true,
            alertOnEnter: alertOnEnter !== undefined ? alertOnEnter : false,
        });
        res.status(201).json(geofence);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// GET /api/geofence/:childId — parent gets all zones for a child
router.get('/:childId', auth_1.protect, async (req, res) => {
    try {
        const zones = await Geofence_1.default.find({ child: req.params.childId, parent: req.parentId });
        res.json(zones);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// PATCH /api/geofence/:id — parent updates a zone
router.patch('/:id', auth_1.protect, async (req, res) => {
    try {
        const geofence = await Geofence_1.default.findOneAndUpdate({ _id: req.params.id, parent: req.parentId }, req.body, { new: true });
        if (!geofence) {
            res.status(404).json({ message: 'Zone not found' });
            return;
        }
        res.json(geofence);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// DELETE /api/geofence/:id — parent deletes a zone
router.delete('/:id', auth_1.protect, async (req, res) => {
    try {
        await Geofence_1.default.findOneAndDelete({ _id: req.params.id, parent: req.parentId });
        res.json({ message: 'Zone deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// POST /api/geofence/check — child app checks if inside any zone (called on every location update)
router.post('/check', childAuth_1.protectChild, async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const zones = await Geofence_1.default.find({ child: req.childId, active: true });
        for (const zone of zones) {
            const distance = getDistanceMeters(latitude, longitude, zone.latitude, zone.longitude);
            const isInside = distance <= zone.radiusMeters;
            if (!isInside && zone.alertOnExit) {
                const alert = await Alert_1.default.create({
                    child: req.childId,
                    parent: req.parentId,
                    type: 'geofence_breach',
                    severity: 'high',
                    title: `Left safe zone: ${zone.name}`,
                    message: `${zone.name} zone was exited. Current distance: ${Math.round(distance)}m from zone center.`,
                    metadata: { zoneId: zone._id, zoneName: zone.name, latitude, longitude },
                });
                (0, socket_1.getIO)().to(`parent:${req.parentId}`).emit('alert:new', alert);
            }
            if (isInside && zone.alertOnEnter) {
                const alert = await Alert_1.default.create({
                    child: req.childId,
                    parent: req.parentId,
                    type: 'geofence_breach',
                    severity: 'low',
                    title: `Arrived at: ${zone.name}`,
                    message: `${zone.name} zone was entered.`,
                    metadata: { zoneId: zone._id, zoneName: zone.name, latitude, longitude },
                });
                (0, socket_1.getIO)().to(`parent:${req.parentId}`).emit('alert:new', alert);
            }
        }
        res.json({ message: 'OK' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=geofence.js.map