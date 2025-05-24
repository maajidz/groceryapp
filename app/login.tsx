import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image, // Changed from TouchableWithoutFeedback
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { requestOtp, signIn } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('7889609247');
  const [isLoading, setIsLoading] = useState(false);

  // Simulate OTP for immediate sign-in
  const SIMULATED_OTP = '123456'; 

  const handleContinue = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number.');
      return;
    }
    setIsLoading(true);
    try {
      const otpRequestedSuccessfully = await requestOtp(phoneNumber); 
      if (otpRequestedSuccessfully && typeof otpRequestedSuccessfully === 'object' && (otpRequestedSuccessfully as FirebaseAuthTypes.ConfirmationResult).verificationId === 'simulated-verification-id') {
        // Directly attempt to sign in with the simulated OTP and the returned mock confirmation
        console.log('[LoginScreen] OTP requested (simulated), attempting direct sign in with returned confirmation...');
        const signInSuccessful = await signIn(SIMULATED_OTP, otpRequestedSuccessfully as FirebaseAuthTypes.ConfirmationResult);
        if (signInSuccessful) {
          console.log('[LoginScreen] Simulated sign in successful, navigating to cart.');
          // Navigate to the main part of the app, e.g., tabs or a dashboard
          // Assuming successful sign-in in AuthContext handles the isAuthenticated state
          // and the _layout.tsx will redirect accordingly. 
          // If not, explicitly navigate here:
          router.replace('/cart'); // Changed to /cart
        } else {
          // This case should ideally be handled by alerts within signIn in AuthContext
          Alert.alert('Sign-in Failed', 'The simulated OTP was incorrect or an error occurred.');
        }
      } else if (otpRequestedSuccessfully) { // It was true, but not the object we expected for simulation
        // This might be a path if requestOtp was changed to return true for other non-Firebase cases
        console.log('[LoginScreen] OTP request was successful but did not return a simulated confirmation object. Navigating to OTP screen might be needed or check logic.');
        // router.push({ pathname: '/otp', params: { phoneNumber } }); // Fallback if you have an OTP screen
        Alert.alert('OTP Sent', 'Please enter the OTP you received.'); // Generic message
      } else {
        // This case should ideally be handled by alerts within requestOtp in AuthContext
        Alert.alert('Failed to send OTP', 'Please ensure your phone number is correct and try again.');
      }
    } catch (error: any) {
      console.error('[LoginScreen] Error requesting OTP:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </Pressable>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Adjust if necessary
      >
        <Pressable onPress={Keyboard.dismiss} style={styles.pressableContainer}> 
          <View style={styles.innerContainer}>
            <Image 
              source={require('@/assets/images/image.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.title}>India's last minute app</ThemedText>
            <ThemedText style={styles.subtitle}>Log in or Sign up</ThemedText>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.countryCode}>+91</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={10}
                autoFocus={false} // Changed to false, let user tap to focus
                onSubmitEditing={handleContinue} // Allow submitting via keyboard
              />
            </View>

            <Pressable
              style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={isLoading || phoneNumber.length !== 10}
            >
              <ThemedText style={styles.continueButtonText}>
                {isLoading ? 'Sending OTP...' : 'Continue'}
              </ThemedText>
            </Pressable>

            <ThemedText style={styles.termsText}>
              By continuing, you agree to our <ThemedText style={styles.linkText}>Terms of service</ThemedText> & <ThemedText style={styles.linkText}>Privacy policy</ThemedText>.
            </ThemedText>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191e25',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 10, // Adjusted top for SafeAreaView
    left: 15,
    zIndex: 10, // Ensure it's above other elements
    padding: 10,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  pressableContainer: { // Added for Pressable
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 20, 
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#DDDDDD',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A4A4A',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 25,
    width: '100%',
    backgroundColor: '#2C323A',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 8,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12, 
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: Platform.OS === 'ios' ? 14 : 12, 
  },
  continueButton: {
    backgroundColor: '#00A877',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#00A877',
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 10, 
  },
  linkText: {
    color: '#00A877',
    textDecorationLine: 'underline',
  },
});