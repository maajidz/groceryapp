import '../firebaseConfig'; // Import to initialize Firebase - ADJUST PATH AS NEEDED
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Ionicons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
    MaterialIcons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
  });

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
      SplashScreen.hideAsync(); 
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Do not return null if Firebase hasn't initialized if your init is async in firebaseConfig.ts
  // However, for @react-native-firebase, native config usually handles this.
  if (!loaded && !error) { 
    return null;
  }
  
  return (
    <AuthProvider>
      <CartProvider> 
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="cart" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="search" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="otp" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}
