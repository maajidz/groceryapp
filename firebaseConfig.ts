(globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import firebase, { getApp, getApps, initializeApp } from '@react-native-firebase/app';
import '@react-native-firebase/auth'; // Ensures the auth module is registered with the core app

// IMPORTANT: Replace these with your actual Firebase project's web app credentials
const firebaseConfig = {
  apiKey: "AIzaSyAdk9uqs8Z5tja4eqHVkByEGgojHstAswE", // Get this from Firebase project settings
  databaseURL: "https://hotelgrocer-3cc31-default-rtdb.asia-southeast1.firebasedatabase.app/",
  authDomain: "hotelgrocer-3cc31.firebaseapp.com", // Get this from Firebase project settings
  projectId: "hotelgrocer-3cc31", // Get this from Firebase project settings
  storageBucket: "hotelgrocer-3cc31.firebasestorage.app", // Get this from Firebase project settings
  messagingSenderId: "322999000463", // Get this from Firebase project settings
  appId: "1:322999000463:android:2906df7a57597f5e4f3ffa", // Get this from Firebase project settings
  // measurementId is optional and typically used for Google Analytics
  // measurementId: "YOUR_MEASUREMENT_ID",
};
// Check if Firebase has already been initialized to avoid re-initialization errors
if (!getApps().length) {
  try {
    // Initialize Firebase with the provided configuration object
    initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully via firebaseConfig.ts');
    // Add diagnostic log here:
    console.log(`[firebaseConfig.ts] After initializeApp(), getApps().length: ${getApps().length}`);
  } catch (error) {
    console.error('Firebase initialization error in firebaseConfig.ts:', error);
    // Handle the error appropriately
  }
} else {
  console.log(`[firebaseConfig.ts] Firebase already initialized. getApps().length: ${getApps().length}`);
  // If already initialized, you can retrieve the default app.
  // This line isn't strictly necessary for operation if already initialized but confirms access.
  getApp();
  // console.log('Firebase was already initialized (checked in firebaseConfig.ts).');
}

export default firebase; // Exporting the namespaced firebase for now for other modules
