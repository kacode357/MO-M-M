import { Colors } from '@/constants/Colors';
import { getFontMap } from '@/constants/Fonts';
import { getToastConfig } from '@/constants/ToastConfig';
import { RefreshTokenApi } from '@/services/user.services';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar'; // Import StatusBar
import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 60, backgroundColor: 'transparent', shadowOpacity: 0 },
  headerWithTitle: { height: 60, backgroundColor: '#fff' }, // White background, removed transparent
  headerTitle: { color: '#000', fontSize: 18, fontWeight: '600' }, // Black title text
});

export default function RootLayout() {
  const colorScheme = 'light'; // Hardcode to light mode
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts(getFontMap());

  // Get Toast configuration for light mode
  const toastConfig = getToastConfig(colorScheme);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    const navigateBasedOnToken = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
          router.replace('/(screen)/welcome');
          return;
        }

        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const response = await RefreshTokenApi({ accessToken, refreshToken });
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
            await AsyncStorage.setItem('accessToken', newAccessToken);
            if (newRefreshToken) {
              await AsyncStorage.setItem('refreshToken', newRefreshToken);
            }
            router.replace('/(tabs)');
          } catch (refreshError) {
            console.error('Token refresh error:', refreshError);
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
            router.replace('/(screen)/welcome');
          }
        } else {
          await AsyncStorage.removeItem('accessToken');
          router.replace('/(screen)/welcome');
        }
      } catch (error) {
        console.error('Navigation error:', error);
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
    headerLeft: () => (
      <TouchableOpacity onPress={() => router.back()} >
        <Ionicons name="arrow-back" size={24} color="#000" /> 
      </TouchableOpacity>
    ),
  };

  const screenOptions = [
    { name: '(tabs)', options: { headerShown: false } },
    { name: '(screen)/welcome', options: { headerShown: false } },
    { name: '(auth)/signin', options: commonHeaderOptions },
    { name: '(auth)/signup', options: { headerShown: false } },
    { name: '(auth)/forgot-password', options: commonHeaderOptions },
    { name: '(auth)/verify-otp', options: commonHeaderOptions },
    {
      name: '(user)/settings',
      options: {
        headerShown: true,
        headerTitle: 'Cài Đặt',
        headerStyle: styles.headerWithTitle,
        headerTitleStyle: styles.headerTitle,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        ),
      },
    },
    {
      name: '(user)/personal-info',
      options: {
        headerShown: true,
        headerTitle: 'Thông Tin Cá Nhân',
        headerStyle: styles.headerWithTitle,
        headerTitleStyle: styles.headerTitle,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        ),
      },
    },
    {
      name: '(user)/change-password',
      options: {
        headerShown: true,
        headerTitle: 'Đổi Mật Khẩu',
        headerStyle: styles.headerWithTitle,
        headerTitleStyle: styles.headerTitle,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        ),
      },
    },
    { name: '+not-found', options: { headerShown: false } },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].safeAreaBackground }]} edges={['bottom']}>
      <StatusBar style="dark" />
      <ThemeProvider value={DefaultTheme}>
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