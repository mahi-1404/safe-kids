import admin from 'firebase-admin';
export declare const firebaseAdmin: typeof admin;
export declare const fcm: {
    send: (message: admin.messaging.Message) => Promise<void>;
};
