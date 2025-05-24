import { getApps } from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Removed the problematic module-level defensive check for Firebase initialization.
// The readiness check is now handled in app/_layout.tsx before AuthProvider is mounted,
// and further within AuthProvider's useEffect before using auth().

// Simulated phone number and OTP
const SIMULATED_PHONE_NUMBER = '+917889609247';
const SIMULATED_OTP = '123456';

interface User {
  uid: string;
  phoneNumber: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  // setUser: Dispatch<SetStateAction<User | null>>; // Firebase handles user state internally
  signIn: (otp: string, externalConfirmation?: FirebaseAuthTypes.ConfirmationResult | null) => Promise<boolean>; // OTP is the only param now, added optional confirmation
  signOut: () => void;
  requestOtp: (phoneNumber: string) => Promise<FirebaseAuthTypes.ConfirmationResult | null | boolean>; // Modified return type
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
    // Keep Firebase auth listener for potential future use, but it won't be triggered by simulated login
    if (process.env.NODE_ENV !== 'test' && getApps().length > 0) { // Added NODE_ENV check for robustness
    const subscriber = auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber,
        });
      } else {
          // If not using Firebase auth, user might be set by simulated login
          // We should not nullify it here if it was set by simulation
          // However, if a real Firebase logout happens, it should clear the user.
          // For now, we'll assume if firebaseUser is null, we clear our user too.
          // This might need adjustment depending on how hybrid (simulated + real) auth is handled.
          if (!user?.uid?.startsWith('simulated-')) { // Only clear if not a simulated user
        setUser(null);
          }
      }
    });
    return subscriber; // unsubscribe on unmount
    } else if (process.env.NODE_ENV === 'test' || getApps().length === 0) {
        console.log("[AuthContext:useEffect] Firebase listener not set up (testing or Firebase not initialized). Simulated login will manage user state.");
    }
  }, []);

  const requestOtp = async (phoneNumber: string): Promise<FirebaseAuthTypes.ConfirmationResult | null | boolean> => {
    setIsLoading(true);
    // Simulate OTP request for the specific phone number
    if (phoneNumber === SIMULATED_PHONE_NUMBER.substring(3)) { // Compare without +91
      console.log(`[AuthContext] Simulated OTP request for ${SIMULATED_PHONE_NUMBER}`);
      const mockConfirmation = {
        confirm: async () => {
          console.log("[AuthContext] Mock confirmation.confirm called");
          // @ts-ignore - We are mocking a partial UserCredential
          return { user: { uid: 'simulated-user-uid', phoneNumber: SIMULATED_PHONE_NUMBER } };
        },
        verificationId: 'simulated-verification-id',
      } as unknown as FirebaseAuthTypes.ConfirmationResult;
      setConfirmation(mockConfirmation); // Still set in state for other potential consumers
      setIsLoading(false);
      return mockConfirmation; // Return the mock confirmation object
    } else {
      console.warn(`[AuthContext] OTP request for non-simulated number ${phoneNumber} - Firebase is inactive.`);
      Alert.alert('Simulation Mode', 'OTP request is only supported for the pre-defined test number.');
      setIsLoading(false);
      return false; // Or null, consistent with potential real Firebase failure
    }
    // Original Firebase code:
    // try {
    //   const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    //   console.log(`[AuthContext] Requesting OTP for ${formattedPhoneNumber}`);
    //   const confirmationResult = await auth().signInWithPhoneNumber(formattedPhoneNumber);
    //   setConfirmation(confirmationResult);
    //   console.log('[AuthContext] OTP code sent, confirmation result set.');
    //   setIsLoading(false);
    //   return true;
    // } catch (error: any) {
    //   setIsLoading(false);
    //   console.error('[AuthContext] Error sending OTP:', error);
    //   Alert.alert('OTP Error', error.message || 'Failed to send OTP. Please check the number and try again.');
    //   return false;
    // }
  };

  const signIn = async (otp: string, externalConfirmation?: FirebaseAuthTypes.ConfirmationResult | null): Promise<boolean> => {
    setIsLoading(true);
    const currentConfirmation = externalConfirmation || confirmation; // Prioritize externally passed one

    // Simulate OTP verification
    if (otp === SIMULATED_OTP && currentConfirmation?.verificationId === 'simulated-verification-id') {
      console.log(`[AuthContext] Simulated OTP ${otp} confirmed for ${SIMULATED_PHONE_NUMBER} using ${externalConfirmation ? 'external' : 'state'} confirmation.`);
      setUser({
        uid: 'simulated-user-uid-' + Date.now(), // Unique simulated UID
        phoneNumber: SIMULATED_PHONE_NUMBER,
      });
      setConfirmation(null); // Clear mock confirmation
      setIsLoading(false);
      return true;
    } else {
       // Fallback to Firebase for other OTPs if a real confirmation exists
      if (currentConfirmation && currentConfirmation.verificationId !== 'simulated-verification-id') {
        console.log(`[AuthContext] Attempting to confirm OTP via Firebase: ${otp}`);
        try {
          const userCredential = await currentConfirmation.confirm(otp);
          console.log('[AuthContext] Firebase OTP confirmed, user signed in:', userCredential?.user?.uid);
          setConfirmation(null); 
      setIsLoading(false);
      return true;
    } catch (error: any) {
      setIsLoading(false);
          console.error('[AuthContext] Error confirming OTP via Firebase:', error);
      Alert.alert('OTP Verification Failed', error.message || 'The OTP entered was incorrect or has expired.');
      return false;
    }
      } else {
        setIsLoading(false);
        console.warn(`[AuthContext] Simulated OTP ${otp} incorrect or no valid confirmation (ID: ${currentConfirmation?.verificationId}) for real flow.`);
        Alert.alert('OTP Verification Failed', 'The OTP entered was incorrect.');
        return false;
      }
    }
    // Original Firebase code:
    // if (!confirmation) {
    //   Alert.alert('Verification Error', 'OTP confirmation not found. Please request OTP again.');
    //   return false;
    // }
    // setIsLoading(true);
    // try {
    //   console.log(`[AuthContext] Attempting to confirm OTP: ${otp}`);
    //   const userCredential = await confirmation.confirm(otp);
    //   console.log('[AuthContext] OTP confirmed, user signed in:', userCredential?.user?.uid);
    //   setConfirmation(null); 
    //   setIsLoading(false);
    //   return true;
    // } catch (error: any) {
    //   setIsLoading(false);
    //   console.error('[AuthContext] Error confirming OTP:', error);
    //   Alert.alert('OTP Verification Failed', error.message || 'The OTP entered was incorrect or has expired.');
    //   return false;
    // }
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
