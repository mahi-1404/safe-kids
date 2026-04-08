"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Alert_1 = __importDefault(require("../models/Alert"));
const NotificationPreference_1 = __importDefault(require("../models/NotificationPreference"));
const firebase_1 = require("../config/firebase");
const Parent_1 = __importDefault(require("../models/Parent"));
const socket_1 = require("../config/socket");
const riskScoring_1 = require("../services/riskScoring");
const router = (0, express_1.Router)();
const SEVERITY_ORDER = ['low', 'medium', 'high', 'critical'];
function isQuietHours(quietFrom, quietUntil) {
    const now = new Date();
    const [fh, fm] = quietFrom.split(':').map(Number);
    const [uh, um] = quietUntil.split(':').map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const fromMins = fh * 60 + fm;
    const untilMins = uh * 60 + um;
    if (fromMins <= untilMins)
        return nowMins >= fromMins && nowMins < untilMins;
    return nowMins >= fromMins || nowMins < untilMins; // overnight range
}
// POST /api/alert — child app sends an alert
router.post('/', async (req, res) => {
    try {
        const { childId, parentId, type, severity, title, message, metadata } = req.body;
        const alert = await Alert_1.default.create({ child: childId, parent: parentId, type, severity, title, message, metadata });
        // Push real-time alert to parent dashboard (always)
        (0, socket_1.getIO)().to(`parent:${parentId}`).emit('alert:new', alert);
        // Send FCM push — respect notification preferences
        const [parent, prefs] = await Promise.all([
            Parent_1.default.findById(parentId),
            NotificationPreference_1.default.findOne({ parent: parentId }),
        ]);
        const shouldPush = (() => {
            if (!parent?.fcmToken)
                return false;
            if (!prefs)
                return true; // no prefs set → send everything
            if (!prefs.pushEnabled)
                return false;
            // Check per-type toggle
            const typeKey = type;
            if (prefs[typeKey] === false)
                return false;
            // Check min severity
            const minIdx = SEVERITY_ORDER.indexOf(prefs.minPushSeverity);
            const sevIdx = SEVERITY_ORDER.indexOf(severity);
            if (sevIdx < minIdx)
                return false;
            // Check quiet hours
            if (prefs.quietHoursEnabled && isQuietHours(prefs.quietFrom, prefs.quietUntil))
                return false;
            return true;
        })();
        if (shouldPush && parent?.fcmToken) {
            await firebase_1.fcm.send({
                token: parent.fcmToken,
                notification: { title, body: message },
                data: { alertId: alert._id.toString(), type, severity },
            });
        }
        // Recompute risk score asynchronously — don't block the response
        (0, riskScoring_1.updateRiskScore)(childId).then(score => {
            (0, socket_1.getIO)().to(`parent:${parentId}`).emit('child:riskscore', { childId, score });
        }).catch(() => { });
        res.status(201).json({ message: 'Alert sent' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// GET /api/alert — parent gets alerts (paginated, filterable)
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const { page = '1', limit = '50', childId, type, severity, unreadOnly } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const filter = { parent: req.parentId };
        if (childId)
            filter.child = childId;
        if (type)
            filter.type = type;
        if (severity)
            filter.severity = severity;
        if (unreadOnly === 'true')
            filter.isRead = false;
        const [alerts, total] = await Promise.all([
            Alert_1.default.find(filter)
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Alert_1.default.countDocuments(filter),
        ]);
        res.json({ alerts, total, page: pageNum, pages: Math.ceil(total / limitNum) });
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
// PATCH /api/alert/read-all — mark all alerts as read for a child
router.patch('/read-all', auth_1.protect, async (req, res) => {
    try {
        const { childId } = req.body;
        const filter = { parent: req.parentId, isRead: false };
        if (childId)
            filter.child = childId;
        await Alert_1.default.updateMany(filter, { isRead: true });
        res.json({ message: 'All marked as read' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// DELETE /api/alert/:id — parent deletes an alert
router.delete('/:id', auth_1.protect, async (req, res) => {
    try {
        await Alert_1.default.findOneAndDelete({ _id: req.params.id, parent: req.parentId });
        res.json({ message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=alert.js.map