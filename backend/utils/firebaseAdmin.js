const admin = require('firebase-admin');

// Initialize Firebase Admin SDK. Supports two modes:
// 1. Provide `FIREBASE_SERVICE_ACCOUNT` env var containing the service account JSON string.
// 2. Rely on application default credentials (e.g. GOOGLE_APPLICATION_CREDENTIALS).
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT');
    } else {
      admin.initializeApp();
      console.log('Firebase Admin initialized with default credentials');
    }
  } catch (err) {
    console.error('Failed to initialize Firebase Admin:', err.message);
    // Re-throw so callers know initialization failed at startup
    throw err;
  }
}

module.exports = admin;
