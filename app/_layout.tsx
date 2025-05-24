import { getApps } from '@react-native-firebase/app';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as DevClient from 'expo-dev-client';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../firebaseConfig';

import { AddressProvider } from '@/contexts/AddressContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
console.log('[_layout.tsx] SplashScreen.preventAutoHideAsync() called.');
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log('[_layout.tsx] RootLayout rendering or re-rendering...');
  const colorScheme = 'light';
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Ionicons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
    MaterialIcons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
  });
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      console.log('[_layout.tsx] Fonts loaded successfully.');
    }
    if (fontError) {
      console.error('[_layout.tsx] Font loading error:', fontError);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    console.log('[_layout.tsx] Firebase readiness check effect running...');
    if (getApps().length > 0) {
      console.log('[_layout.tsx] Firebase already ready on initial check.');
      setFirebaseReady(true);
    } else {
      console.log('[_layout.tsx] Firebase not immediately ready, starting poller...');
      const interval = setInterval(() => {
        console.log('[_layout.tsx] Firebase poller checking...');
        if (getApps().length > 0) {
          console.log('[_layout.tsx] Firebase became ready via poller.');
          setFirebaseReady(true);
          clearInterval(interval);
        }
      }, 100); // Check every 100ms
      return () => {
        console.log('[_layout.tsx] Cleaning up Firebase poller.');
        clearInterval(interval);
      };
    }
  }, []); // Run once on mount

  useEffect(() => {
    console.log(`[_layout.tsx] Splash screen check: fontsLoaded: ${fontsLoaded}, firebaseReady: ${firebaseReady}`);
    if (fontsLoaded && firebaseReady) {
      console.log('[_layout.tsx] Both fonts loaded and Firebase ready. Hiding splash screen.');
      SplashScreen.hideAsync();
    } else {
      console.log('[_layout.tsx] Conditions not met to hide splash screen yet.');
    }
  }, [fontsLoaded, firebaseReady]);

  console.log(`[_layout.tsx] Pre-render check: fontsLoaded: ${fontsLoaded}, firebaseReady: ${firebaseReady}`);
  if (!fontsLoaded || !firebaseReady) {
    console.log('[_layout.tsx] Returning null (fonts or Firebase not ready).');
    return null; 
  }
  
  console.log('[_layout.tsx] Rendering main app content.');
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <AddressProvider>
            <ThemeProvider value={DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="cart" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="search" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="otp" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="address" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="payment" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="tracking" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="dark" translucent={false} />
            </ThemeProvider>
          </AddressProvider>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
