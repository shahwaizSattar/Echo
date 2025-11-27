import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';

// Read Firebase config from Expo "extra" (app.json / app.config.js).
// This keeps secrets out of source code. For production, set these values
// via your build / CI environment.
const extra = (Constants.expoConfig && Constants.expoConfig.extra) || (Constants.manifest && Constants.manifest.extra) || {};

const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: extra.FIREBASE_AUTH_DOMAIN || (extra.FIREBASE_PROJECT_ID ? `${extra.FIREBASE_PROJECT_ID}.firebaseapp.com` : 'YOUR_PROJECT_ID.firebaseapp.com'),
  projectId: extra.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: extra.FIREBASE_STORAGE_BUCKET || (extra.FIREBASE_PROJECT_ID ? `${extra.FIREBASE_PROJECT_ID}.appspot.com` : 'YOUR_PROJECT_ID.appspot.com'),
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: extra.FIREBASE_APP_ID || 'YOUR_APP_ID'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
