import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  Pressable, // Changed from TouchableWithoutFeedback
  Keyboard,
  Alert
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { requestOtp } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number.');
      return;
    }
    setIsLoading(true);
    try {
      // For Firebase, requestOtp will likely store a confirmationResult
      // and then navigate to OTP screen. The actual OTP sending is handled by Firebase.
      const otpRequestedSuccessfully = await requestOtp(phoneNumber); 
      if (otpRequestedSuccessfully) {
        router.push({ pathname: '/otp', params: { phoneNumber } });
      } else {
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
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Adjust if necessary
      >
        <Pressable onPress={Keyboard.dismiss} style={styles.pressableContainer}> 
          <View style={styles.innerContainer}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/100x40.png/FFD700/000000?text=blinkit' }} 
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

            <TouchableOpacity 
              style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={isLoading || phoneNumber.length !== 10}
            >
              <ThemedText style={styles.continueButtonText}>
                {isLoading ? 'Sending OTP...' : 'Continue'}
              </ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.termsText}>
              By continuing, you agree to our <ThemedText style={styles.linkText}>Terms of service</ThemedText> & <ThemedText style={styles.linkText}>Privacy policy</ThemedText>.
            </ThemedText>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 50,
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
    width: 120,
    height: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 25,
    width: '100%',
    backgroundColor: '#FFFFFF', // Ensure input background is white if container is different
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginRight: 8,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12, 
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingVertical: Platform.OS === 'ios' ? 14 : 12, 
  },
  continueButton: {
    backgroundColor: '#6C757D', 
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#555555', 
    textDecorationLine: 'underline',
  },
});
