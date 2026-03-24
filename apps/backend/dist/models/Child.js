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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ChildSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    parent: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Parent', required: true },
    deviceId: { type: String, unique: true, sparse: true },
    deviceModel: { type: String },
    androidVersion: { type: String },
    fcmToken: { type: String },
    isPaired: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    batteryLevel: { type: Number, default: 100 },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    agePreset: { type: String, enum: ['little_explorer', 'junior_learner', 'preteen', 'custom'], default: 'custom' },
    screenTimeLimit: { type: Number, default: 180 },
    bedtimeStart: { type: String, default: '21:00' },
    bedtimeEnd: { type: String, default: '07:00' },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Child', ChildSchema);
//# sourceMappingURL=Child.js.map