"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
// PATCH /api/child/:id — parent updates child settings/profile
router.patch('/:id', auth_1.protect, async (req, res) => {
    try {
        const allowed = ['name', 'age', 'agePreset', 'screenTimeLimit', 'bedtimeStart', 'bedtimeEnd'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined)
                updates[key] = req.body[key];
        }
        const child = await Child_1.default.findOneAndUpdate({ _id: req.params.id, parent: req.parentId }, { $set: updates }, { new: true });
        if (!child) {
            res.status(404).json({ message: 'Child not found' });
            return;
        }
        // Push updated policy to child device in real time
        const { getIO } = await Promise.resolve().then(() => __importStar(require('../config/socket')));
        getIO().to(`child:${child._id}`).emit('policy:settings', {
            screenTimeLimit: child.screenTimeLimit,
            bedtimeStart: child.bedtimeStart,
            bedtimeEnd: child.bedtimeEnd,
        });
        res.json(child);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// DELETE /api/child/:id — parent removes a child profile
router.delete('/:id', auth_1.protect, async (req, res) => {
    try {
        const child = await Child_1.default.findOneAndDelete({ _id: req.params.id, parent: req.parentId });
        if (!child) {
            res.status(404).json({ message: 'Child not found' });
            return;
        }
        await Parent_1.default.findByIdAndUpdate(req.parentId, { $pull: { children: child._id } });
        res.json({ message: 'Child profile deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=child.js.map