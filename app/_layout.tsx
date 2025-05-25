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
import { StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60, // Tùy chỉnh chiều cao header
    backgroundColor: 'transparent', // Màu nền header
    shadowOpacity: 0, // Loại bỏ shadow nếu cần
  },
  headerWithTitle: {
    height: 60, // Chiều cao header cho màn hình có tiêu đề
    backgroundColor: '#fff', // Màu nền tùy chỉnh
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts(getFontMap());

  const navigateBasedOnToken = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await SplashScreen.hideAsync();
      router.replace(token ? '/(tabs)' : '/(screen)/welcome');
    } catch (error) {
      console.error('Navigation error:', error);
      await SplashScreen.hideAsync();
      router.replace('/(tabs)');
    }
  };

  useEffect(() => {
    if (fontsLoaded || fontError) {
      navigateBasedOnToken();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const commonHeaderOptions = {
    headerStyle: styles.header,
    headerTransparent: true,
    headerTitle: '',
    headerShadowVisible: false,
  };

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
            <Stack.Screen name="(auth)/signin" options={commonHeaderOptions} />
            <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/forgot-password" options={commonHeaderOptions} />
            <Stack.Screen name="(auth)/verify-otp" options={commonHeaderOptions} />
            <Stack.Screen name="(user)/settings" options={{ headerShown: true, headerTitle: 'Cài Đặt', headerStyle: styles.headerWithTitle }} />
            <Stack.Screen name="(user)/personal-info" options={{ headerShown: true, headerTitle: 'Thông Tin Cá Nhân', headerStyle: styles.headerWithTitle }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
            </Stack>
        </ThemeProvider>
      </AlertProvider>
    </SafeAreaView>
  );
}