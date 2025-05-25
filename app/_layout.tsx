import { Colors } from '@/constants/Colors';
import { getFontMap } from '@/constants/Fonts';
import { AlertProvider } from '@/contexts/AlertContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

const styles = StyleSheet.create({
  headerButton: {
    padding: 10,
  },
  container: {
    flex: 1,
  },
});

const authScreenHeaderOptions = {
  headerShown: true,
  headerTransparent: true,
  headerTitle: '',
  headerShadowVisible: false,
};

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts(getFontMap());

  useEffect(() => {
    const checkTokenAndNavigate = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        await SplashScreen.hideAsync();
        if (token) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(screen)/welcome');
        }
      } catch (error) {
        console.error('Error during navigation:', error);
        await SplashScreen.hideAsync();
        router.replace('/(tabs)');
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

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme].safeAreaBackground }]}
      edges={['bottom']} // Bỏ 'top' để không chiếm không gian status bar
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
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
        </ThemeProvider>
      </AlertProvider>
    </SafeAreaView>
  );
}
