import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const { signIn, requestOtp, isLoading: authIsLoading, confirmation } = useAuth(); // Get confirmation from context
  const params = useLocalSearchParams<{ phoneNumber: string }>();
  const phoneNumber = params.phoneNumber || 'Not Provided';

  const [otp, setOtp] = useState<string[]> (new Array(OTP_LENGTH).fill(''));
  // Use authIsLoading from context for verify button, local isLoading for resend if needed
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    let timerInterval: any;
    if (resendTimer > 0) {
      timerInterval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [resendTimer]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(0,1);
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (text && index === OTP_LENGTH - 1 && newOtp.join('').length === OTP_LENGTH) {
      Keyboard.dismiss();
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];
      if (!newOtp[index] && index > 0) { 
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerifyOtp = async (currentOtpString?: string) => {
    Keyboard.dismiss();
    const enteredOtp = currentOtpString || otp.join('');

    if (enteredOtp.length !== OTP_LENGTH) {
      Alert.alert('Invalid OTP', 'Please enter all 6 digits of the OTP.');
      return;
    }
    // isLoading state is now managed by AuthContext for signIn
    try {
      const success = await signIn(enteredOtp); // signIn from context now only takes OTP
      if (success) {
        router.replace('/(tabs)'); 
      } else {
        // Error alert is handled by AuthContext's signIn method
        setOtp(new Array(OTP_LENGTH).fill('')); 
        inputRefs.current[0]?.focus(); 
      }
    } catch (error: any) { // Should be caught by AuthContext, but good practice
      console.error('[OtpScreen] Error verifying OTP outside context:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    try {
      // requestOtp now returns a boolean indicating if the attempt to send was made
      // It internally sets the confirmation object for Firebase
      const otpRequestInitiated = await requestOtp(phoneNumber);
      if (otpRequestInitiated) {
        Alert.alert('OTP Resent', `A new OTP should be sent to ${phoneNumber} shortly.`);
        setResendTimer(30); 
        setOtp(new Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        // Error alert for failed OTP request is handled by AuthContext's requestOtp
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not resend OTP.');
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Pressable onPress={Keyboard.dismiss} style={styles.pressableContainer}>
          <View style={styles.innerContainer}>
            <ThemedText style={styles.title}>Verify OTP</ThemedText>
            <ThemedText style={styles.subtitle}>
              Enter the 6-digit OTP sent to <ThemedText style={styles.phoneNumberText}>{phoneNumber}</ThemedText>
            </ThemedText>

            <View style={styles.otpInputContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  value={digit}
                  editable={!authIsLoading} // Disable input while auth is loading
                />
              ))}
            </View>

            <Pressable
              style={[styles.verifyButton, authIsLoading && styles.verifyButtonDisabled]}
              onPress={() => handleVerifyOtp()} 
              disabled={authIsLoading || otp.join('').length !== OTP_LENGTH}
            >
              <ThemedText style={styles.verifyButtonText}>
                {authIsLoading ? 'Verifying...' : 'Verify OTP'}
              </ThemedText>
            </Pressable>

            {resendTimer > 0 ? (
                <ThemedText style={styles.resendOtpText}>Resend OTP in {resendTimer}s</ThemedText>
            ) : (
                <Pressable onPress={handleResendOtp} disabled={isResendingOtp || authIsLoading}>
                    <ThemedText style={[styles.resendOtpText, styles.resendOtpLink]}>
                        {isResendingOtp ? 'Sending...' : 'Resend OTP'}
                    </ThemedText>
                </Pressable>
            )}
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  backButton: { position: 'absolute', top: Platform.OS === 'android' ? 20 : 10, left: 15, zIndex: 10, padding:10 },
  keyboardAvoidingContainer: { flex: 1 },
  pressableContainer: { flex: 1 },
  innerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#555555', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  phoneNumberText: { fontWeight: 'bold', color: '#1A1A1A' },
  otpInputContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', maxWidth: 320, marginBottom: 30 },
  otpInput: {
    width: Platform.OS === 'ios' ? 45 : 40, 
    height: Platform.OS === 'ios' ? 55 : 50,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    backgroundColor: '#F5F5F5',
  },
  verifyButton: { backgroundColor: '#00A877', paddingVertical: 15, borderRadius: 8, alignItems: 'center', width: '100%', maxWidth: 320, marginBottom: 20 }, 
  verifyButtonDisabled: { backgroundColor: '#A0D1C1' },
  verifyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  resendOtpText: { fontSize: 14, color: '#555555', marginTop: 10 },
  resendOtpLink: { color: '#007AFF', fontWeight: '600' }
});
