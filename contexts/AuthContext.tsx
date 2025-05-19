import { getApps } from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Removed the problematic module-level defensive check for Firebase initialization.
// The readiness check is now handled in app/_layout.tsx before AuthProvider is mounted,
// and further within AuthProvider's useEffect before using auth().

interface User {
  uid: string;
  phoneNumber: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  // setUser: Dispatch<SetStateAction<User | null>>; // Firebase handles user state internally
  signIn: (otp: string) => Promise<boolean>; // OTP is the only param now
  signOut: () => void;
  requestOtp: (phoneNumber: string) => Promise<boolean>; 
  isLoading: boolean;
  confirmation: FirebaseAuthTypes.ConfirmationResult | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For OTP request and verification
  const [confirmation, setConfirmation] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const isAuthenticated = !!user;
  const router = useRouter();

  // Handle user state changes
  useEffect(() => {
    if (!getApps().length) {
      // This check is inside useEffect, so it runs after initial render.
      // If Firebase is still not ready, it means firebaseConfig.ts didn't initialize it properly or early enough.
      console.error("[AuthContext:useEffect] Firebase not initialized when attempting to set up onAuthStateChanged listener. Check app root import order.");
      // Optionally, you could set an error state here and display a message to the user.
      return; // Don't set up the listener if Firebase isn't ready.
    }

    const subscriber = auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber,
        });
      } else {
        setUser(null);
      }
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  const requestOtp = async (phoneNumber: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Ensure phone number is in E.164 format for Firebase (e.g., +91XXXXXXXXXX)
      const formattedPhoneNumber = `+91${phoneNumber}`;
      console.log(`[AuthContext] Requesting OTP for ${formattedPhoneNumber}`);
      const confirmationResult = await auth().signInWithPhoneNumber(formattedPhoneNumber);
      setConfirmation(confirmationResult);
      console.log('[AuthContext] OTP code sent, confirmation result set.');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      setIsLoading(false);
      console.error('[AuthContext] Error sending OTP:', error);
      Alert.alert('OTP Error', error.message || 'Failed to send OTP. Please check the number and try again.');
      return false;
    }
  };

  const signIn = async (otp: string): Promise<boolean> => {
    if (!confirmation) {
      Alert.alert('Verification Error', 'OTP confirmation not found. Please request OTP again.');
      return false;
    }
    setIsLoading(true);
    try {
      console.log(`[AuthContext] Attempting to confirm OTP: ${otp}`);
      const userCredential = await confirmation.confirm(otp);
      // User is signed in (or linked) here. 
      // onAuthStateChanged will handle setting the user state.
      console.log('[AuthContext] OTP confirmed, user signed in:', userCredential?.user?.uid);
      setConfirmation(null); // Clear confirmation result after use
      setIsLoading(false);
      return true;
    } catch (error: any) {
      setIsLoading(false);
      console.error('[AuthContext] Error confirming OTP:', error);
      Alert.alert('OTP Verification Failed', error.message || 'The OTP entered was incorrect or has expired.');
      return false;
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await auth().signOut();
      // onAuthStateChanged will set user to null
      setConfirmation(null);
      console.log('[AuthContext] User signed out.');
      router.replace('/(tabs)'); // Or your desired screen after logout
    } catch (error: any) {
      console.error('[AuthContext] Sign out error:', error);
      Alert.alert('Sign Out Error', error.message || 'Could not sign out.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, requestOtp, isLoading, confirmation }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
