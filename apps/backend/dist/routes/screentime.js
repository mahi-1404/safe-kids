"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const childAuth_1 = require("../middleware/childAuth");
const ScreenTime_1 = __importDefault(require("../models/ScreenTime"));
const Child_1 = __importDefault(require("../models/Child"));
const Alert_1 = __importDefault(require("../models/Alert"));
const socket_1 = require("../config/socket");
const router = (0, express_1.Router)();
// POST /api/screentime — child app posts daily app usage
router.post('/', childAuth_1.protectChild, async (req, res) => {
    try {
        const { date, apps } = req.body;
        const totalMinutes = apps.reduce((sum, app) => sum + app.durationMinutes, 0);
        // Upsert — update if exists for this date, create if not
        const screenTime = await ScreenTime_1.default.findOneAndUpdate({ child: req.childId, date }, { totalMinutes, apps }, { upsert: true, new: true });
        // Check if screen time limit is exceeded
        const child = await Child_1.default.findById(req.childId);
        if (child && totalMinutes >= child.screenTimeLimit) {
            // Create alert and push to parent
            const alert = await Alert_1.default.create({
                child: req.childId,
                parent: req.parentId,
                type: 'blocked_content',
                severity: 'medium',
                title: 'Screen time limit reached',
                message: `${child.name} has used ${totalMinutes} minutes of screen time today (limit: ${child.screenTimeLimit} min)`,
            });
            (0, socket_1.getIO)().to(`parent:${req.parentId}`).emit('alert:new', alert);
        }
        // Push updated screen time to parent dashboard
        (0, socket_1.getIO)().to(`parent:${req.parentId}`).emit('screentime:update', {
            childId: req.childId,
            date,
            totalMinutes,
            apps,
        });
        res.status(201).json({ message: 'OK' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// GET /api/screentime/:childId/today — parent gets today's usage
router.get('/:childId/today', auth_1.protect, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const screenTime = await ScreenTime_1.default.findOne({ child: req.params.childId, date: today });
        res.json(screenTime || { totalMinutes: 0, apps: [] });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// GET /api/screentime/:childId/week — parent gets last 7 days usage
router.get('/:childId/week', auth_1.protect, async (req, res) => {
    try {
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();
        const records = await ScreenTime_1.default.find({
            child: req.params.childId,
            date: { $in: days },
        });
        // Fill in missing days with 0
        const result = days.map(date => {
            const record = records.find(r => r.date === date);
            return { date, totalMinutes: record?.totalMinutes || 0, apps: record?.apps || [] };
        });
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=screentime.js.map