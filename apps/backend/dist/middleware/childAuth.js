"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectChild = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware for routes called by the child app
// Child tokens contain: { childId, parentId, deviceId }
const protectChild = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.childId = decoded.childId;
        req.parentId = decoded.parentId;
        req.deviceId = decoded.deviceId;
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};
exports.protectChild = protectChild;
//# sourceMappingURL=childAuth.js.map