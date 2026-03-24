import admin from 'firebase-admin';

const hasFirebaseConfig =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PROJECT_ID !== 'your_firebase_project_id' &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL;

if (!admin.apps.length) {
  if (hasFirebaseConfig) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('Firebase Admin initialized');
  } else {
    console.warn('Firebase credentials not set — FCM push notifications disabled (dev mode)');
  }
}

export const firebaseAdmin = admin;

// Safe FCM wrapper — silently skips if Firebase not configured
export const fcm = {
  send: async (message: admin.messaging.Message): Promise<void> => {
    if (!hasFirebaseConfig || !admin.apps.length) return;
    await admin.messaging().send(message);
  },
};
