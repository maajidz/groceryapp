(globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import firebase, { getApp, getApps, initializeApp } from '@react-native-firebase/app';
import '@react-native-firebase/auth'; // Ensures the auth module is registered with the core app

// You can also import other Firebase modules you use here, e.g.:
// import '@react-native-firebase/firestore';
// import '@react-native-firebase/functions';

// Check if Firebase has already been initialized to avoid re-initialization errors
if (!getApps().length) {
  try {
    // Initialize Firebase.
    // This will automatically use your google-services.json (Android)
    // or GoogleService-Info.plist (iOS)
    // @ts-ignore RNFirebase allows initializeApp() without args for default native config
    initializeApp();
    console.log('Firebase initialized successfully via firebaseConfig.ts');
    // Add diagnostic log here:
    console.log(`[firebaseConfig.ts] After initializeApp(), getApps().length: ${getApps().length}`);
  } catch (error) {
    console.error('Firebase initialization error in firebaseConfig.ts:', error);
    // You might want to throw the error or handle it appropriately
    // depending on your app's error handling strategy.
  }
} else {
  console.log(`[firebaseConfig.ts] Firebase already initialized. getApps().length: ${getApps().length}`);
  // If already initialized, you can retrieve the default app.
  // This line isn't strictly necessary for operation if already initialized but confirms access.
  getApp();
  // console.log('Firebase was already initialized (checked in firebaseConfig.ts).');
}

export default firebase; // Exporting the namespaced firebase for now for other modules