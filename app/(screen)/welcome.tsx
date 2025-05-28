import logo from '@/assets/images/logo-mm-final-2.png';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Fallback version if EXPO_PUBLIC_APP_VERSION is not defined
const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION
const WelcomePage = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 30, // Increased for better spacing
      backgroundColor: Colors[colorScheme].background,
    },
    textContainer: {
      alignItems: 'flex-start',
      width: '100%',
      marginTop: 40, // Lower the title and subtitle
    },
    title: {
      fontFamily: Fonts.Baloo2.ExtraBold,
      fontSize: 60, // Reduced from 53
      lineHeight: 55 * 1.3, // Adjusted
      letterSpacing: -0.02 * 36, // Adjusted
      color: Colors[colorScheme].primaryText,
      textAlign: 'left',
      marginBottom: 12, // Adjusted for spacing
    },
    subtitle: {
      fontFamily: Fonts.Baloo2.Bold,
      fontSize: 25, // Reduced from 32
      lineHeight: 28, // Adjusted
      letterSpacing: -0.02 * 24, // Adjusted
      color: Colors[colorScheme].primaryText,
      textAlign: 'left',
      marginBottom: 24, // Adjusted
    },
    highlightedText: {
      color: Colors[colorScheme].tabIconSelected,
    },
    logo: {
      width: 250, // Reduced for proportionality
      height: 250, // Adjusted
      resizeMode: 'contain',
    
    },
    loginButton: {
      width: 250, // Aligned with other components
      height: 50, // Increased for consistency
      borderWidth: 1,
      borderColor: Colors[colorScheme].primaryText,
      borderRadius: 25, // Aligned with Signup
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    buttonText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontSize: 16,
      color: Colors[colorScheme].primaryText,
      textAlign: 'center',
    },
    createAccountButton: {
      width: 250,
      height: 50,
      backgroundColor: Colors[colorScheme].primaryText,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    createAccountText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontSize: 16,
      color: Colors[colorScheme].background,
      textAlign: 'center',
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      width: 250,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: Colors[colorScheme].icon,
    },
    dividerText: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].icon,
      marginHorizontal: 10,
    },
    continueWithoutLogin: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].primaryText,
      textAlign: 'center',
    },
    versionContainer: {
      position: 'absolute',
      bottom: 20,
      right: 20,
    },
    versionText: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 12, // Small but legible
      color: Colors[colorScheme].icon, // Subtle color
      textAlign: 'right',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>ĐÓI BỤNG?</Text>
        <Text style={styles.subtitle}>
          LÊN{' '}
          <Text style={[styles.subtitle, styles.highlightedText]}>MAP</Text>,{' '}
          <Text style={[styles.subtitle, styles.highlightedText]}>MĂM</Text> VẶT NGAY THÔI
        </Text>
      </View>
      <Image source={logo} style={styles.logo} />
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push('/(auth)/signin')}
      >
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={() => router.push('/(auth)/signup')}
      >
        <Text style={styles.createAccountText}>Tạo tài khoản</Text>
      </TouchableOpacity>
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Hoặc</Text>
        <View style={styles.dividerLine} />
      </View>
      <TouchableOpacity onPress={() => router.push('/(tabs)')}>
        <Text style={styles.continueWithoutLogin}>
          Tiếp tục vào app mà không cần đăng nhập
        </Text>
      </TouchableOpacity>
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Phiên bản: {APP_VERSION}</Text>
      </View>
    </View>
  );
};

export default WelcomePage;