import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth'; // Ensures the auth module is registered

// IMPORTANT: Replace these with your actual Firebase project's web app credentials
const firebaseConfig = {
  apiKey: "AIzaSyAgRAIGqCaIaUOq8rnK1R4yprf7tZvxAd0", // Get this from Firebase project settings
  authDomain: "", // Get this from Firebase project settings
  projectId: "hotelgrocer-3cc31", // Get this from Firebase project settings
  storageBucket: "hotelgrocer-3cc31.firebasestorage.app", // Get this from Firebase project settings
  messagingSenderId: "322999000463", // Get this from Firebase project settings
  appId: "1:322999000463:android:2906df7a57597f5e4f3ffa", // Get this from Firebase project settings
  // measurementId is optional and typically used for Google Analytics
  // measurementId: "YOUR_MEASUREMENT_ID",
};

// Check if Firebase has already been initialized
if (!firebase.apps.length) {
  try {
    // Initialize Firebase with the explicit config
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully with explicit config via firebaseConfig.ts');
  } catch (error) {
    console.error('Firebase initialization error in firebaseConfig.ts:', error);
    // Handle the error appropriately
  }
} else {
  // If already initialized, retrieve the default app
  firebase.app();
  // console.log('Firebase was already initialized (checked in firebaseConfig.ts).');
}

export default firebase;