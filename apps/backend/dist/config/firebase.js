"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fcm = exports.firebaseAdmin = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const hasFirebaseConfig = process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PROJECT_ID !== 'your_firebase_project_id' &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL;
if (!firebase_admin_1.default.apps.length) {
    if (hasFirebaseConfig) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
        });
        console.log('Firebase Admin initialized');
    }
    else {
        console.warn('Firebase credentials not set — FCM push notifications disabled (dev mode)');
    }
}
exports.firebaseAdmin = firebase_admin_1.default;
// Safe FCM wrapper — silently skips if Firebase not configured
exports.fcm = {
    send: async (message) => {
        if (!hasFirebaseConfig || !firebase_admin_1.default.apps.length)
            return;
        await firebase_admin_1.default.messaging().send(message);
    },
};
//# sourceMappingURL=firebase.js.map