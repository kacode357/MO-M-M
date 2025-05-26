import { Colors } from '@/constants/Colors';
import { getFontMap } from '@/constants/Fonts';
import { getToastConfig } from '@/constants/ToastConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RefreshTokenApi } from '@/services/user.services'; // Import RefreshTokenApi
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 60, backgroundColor: 'transparent', shadowOpacity: 0 },
  headerWithTitle: { height: 60, backgroundColor: '#fff' },
});

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts(getFontMap());

  // Get Toast configuration with current colorScheme
  const toastConfig = getToastConfig(colorScheme);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    const navigateBasedOnToken = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
          // No access token, navigate to welcome screen
          router.replace('/(screen)/welcome');
          return;
        }

        // Attempt to refresh the token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const response = await RefreshTokenApi({ accessToken, refreshToken });
            // Assuming response contains new accessToken and refreshToken
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
            // Update AsyncStorage with new tokens
            await AsyncStorage.setItem('accessToken', newAccessToken);
            if (newRefreshToken) {
              await AsyncStorage.setItem('refreshToken', newRefreshToken);
            }
            // Navigate to tabs
            router.replace('/(tabs)');
          } catch (refreshError) {
            console.error('Token refresh error:', refreshError);
            // Clear tokens and navigate to welcome screen on refresh failure
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
            router.replace('/(screen)/welcome');
          }
        } else {
          // No refresh token, clear access token and navigate to welcome screen
          await AsyncStorage.removeItem('accessToken');
          router.replace('/(screen)/welcome');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to tabs on unexpected errors
        router.replace('/(tabs)');
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    navigateBasedOnToken();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const commonHeaderOptions = {
    headerStyle: styles.header,
    headerTransparent: true,
    headerTitle: '',
    headerShadowVisible: false,
  };

  const screenOptions = [
    { name: '(tabs)', options: { headerShown: false } },
    { name: '(screen)/welcome', options: { headerShown: false } },
    { name: '(auth)/signin', options: commonHeaderOptions },
    { name: '(auth)/signup', options: { headerShown: false } },
    { name: '(auth)/forgot-password', options: commonHeaderOptions },
    { name: '(auth)/verify-otp', options: commonHeaderOptions },
    { name: '(user)/settings', options: { headerShown: true, headerTitle: 'Cài Đặt', headerStyle: styles.headerWithTitle } },
    { name: '(user)/personal-info', options: { headerShown: true, headerTitle: 'Thông Tin Cá Nhân', headerStyle: styles.headerWithTitle } },
    { name: '(user)/change-password', options: { headerShown: true, headerTitle: 'Đổi Mật Khẩu', headerStyle: styles.headerWithTitle } },

    { name: '+not-found', options: { headerShown: false } },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].safeAreaBackground }]} edges={['bottom']}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {screenOptions.map(({ name, options }) => (
            <Stack.Screen key={name} name={name} options={options} />
          ))}
        </Stack>
      </ThemeProvider>
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
}