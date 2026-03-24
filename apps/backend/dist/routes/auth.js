"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const Parent_1 = __importDefault(require("../models/Parent"));
const Child_1 = __importDefault(require("../models/Child"));
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const exists = await Parent_1.default.findOne({ email });
        if (exists) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }
        const parent = await Parent_1.default.create({ name, email, phone, password });
        const token = jsonwebtoken_1.default.sign({ id: parent._id }, process.env.JWT_SECRET, {
            expiresIn: 86400, // 24 hours in seconds
        });
        res.status(201).json({ token, parent: { id: parent._id, name: parent.name, email: parent.email } });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const parent = await Parent_1.default.findOne({ email });
        if (!parent || !(await parent.comparePassword(password))) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: parent._id }, process.env.JWT_SECRET, {
            expiresIn: 86400, // 24 hours in seconds
        });
        res.json({ token, parent: { id: parent._id, name: parent.name, email: parent.email } });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// POST /api/auth/child-login
// Called by child app during installation using parent credentials
router.post('/child-login', async (req, res) => {
    try {
        const { email, password, childName, childAge, fcmToken, deviceModel, androidVersion } = req.body;
        // Verify parent credentials
        const parent = await Parent_1.default.findOne({ email });
        if (!parent || !(await parent.comparePassword(password))) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Check if parent has given consent
        if (!parent.consentSigned) {
            res.status(403).json({ message: 'Parental consent not completed. Please finish setup on the web dashboard.' });
            return;
        }
        const deviceId = (0, uuid_1.v4)();
        // Find existing child profile by name under this parent or create new one
        let child = await Child_1.default.findOne({ parent: parent._id, name: childName });
        if (child) {
            // Update device info on existing child profile
            child.fcmToken = fcmToken;
            child.deviceId = deviceId;
            child.deviceModel = deviceModel;
            child.androidVersion = androidVersion;
            child.isPaired = true;
            child.isOnline = true;
            child.lastSeen = new Date();
            await child.save();
        }
        else {
            // Create new child profile and link to parent
            child = await Child_1.default.create({
                name: childName,
                age: childAge || 10,
                parent: parent._id,
                deviceId,
                deviceModel,
                androidVersion,
                fcmToken,
                isPaired: true,
                isOnline: true,
            });
            await Parent_1.default.findByIdAndUpdate(parent._id, { $push: { children: child._id } });
        }
        // Issue a long-lived token for the child app
        const token = jsonwebtoken_1.default.sign({ childId: child._id, parentId: parent._id, deviceId }, process.env.JWT_SECRET, { expiresIn: 31536000 } // 365 days in seconds
        );
        res.json({
            token,
            childId: child._id,
            deviceId,
            parentName: parent.name,
            screenTimeLimit: child.screenTimeLimit,
            bedtimeStart: child.bedtimeStart,
            bedtimeEnd: child.bedtimeEnd,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// POST /api/auth/consent
router.post('/consent', async (req, res) => {
    try {
        const { parentId } = req.body;
        await Parent_1.default.findByIdAndUpdate(parentId, { consentSigned: true, consentSignedAt: new Date() });
        res.json({ message: 'Consent recorded' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map