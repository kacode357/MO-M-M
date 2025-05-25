import { Colors } from '@/constants/Colors';
import { AlertProvider } from '@/contexts/AlertContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import Fonts
import { getFontMap } from '@/constants/Fonts';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const styles = StyleSheet.create({
  headerButton: {
    padding: 10,
  },
  container: {
    flex: 1,
  },
});

// Common header options for auth screens
const authScreenHeaderOptions = {
  headerShown: true,
  headerTransparent: true,
  headerTitle: '',
  headerShadowVisible: false,
};

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'dark'; // Ưu tiên dark nếu không xác định
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts(getFontMap());

  // Hide splash screen and navigate based on token presence
  useEffect(() => {
    const checkTokenAndNavigate = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        await SplashScreen.hideAsync();
        if (token) {
          router.replace('/(tabs)'); // Token exists, skip welcome screen
        } else {
          router.replace('/(screen)/welcome'); // No token, show welcome screen
        }
      } catch (error) {
        console.error('Error during navigation:', error);
        await SplashScreen.hideAsync();
        router.replace('/(tabs)'); // Fallback to tabs on error
      }
    };

    if (fontsLoaded && !fontError) {
      checkTokenAndNavigate();
    } else if (fontError) {
      console.error('Font loading error:', fontError);
      SplashScreen.hideAsync().then(() => {
        router.replace('/(tabs)');
      });
    }
  }, [fontsLoaded, fontError, router]);

  // Return null until fonts are loaded or error occurs
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme].safeAreaBackground }]}
      edges={['bottom']}
    >
      <AlertProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(screen)/welcome" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/signin" options={authScreenHeaderOptions} />
            <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/forgot-password" options={authScreenHeaderOptions} />
            <Stack.Screen name="(auth)/verify-otp" options={authScreenHeaderOptions} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          </Stack>
          <StatusBar
            style={colorScheme === 'dark' ? 'light' : 'dark'}
            backgroundColor="transparent"
          />
        </ThemeProvider>
      </AlertProvider>
    </SafeAreaView>
  );
}