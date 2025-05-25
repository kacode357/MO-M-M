import logo_warning from '@/assets/images/icon-warning.png';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CheckLogin = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background }, // Move dynamic backgroundColor here
      ]}
    >
      <Image source={logo_warning} style={styles.logo} />
      <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
        Úi, bạn chưa đăng nhập!
      </Text>
      <Text style={[styles.subtitle, { color: Colors[colorScheme].text }]}>
        Bạn cần đăng nhập để sử dụng các tính năng
      </Text>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push('/(screen)/welcome')}
      >
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    // Remove backgroundColor from here
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20, // Space between logo and text
  },
  title: {
    fontFamily: Fonts.Baloo2.Regular, // Baloo2-Regular (weight 400)
    fontWeight: '400',
    fontSize: 30,
    lineHeight: 40,
    letterSpacing: 0,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.Comfortaa.Regular, // Comfortaa-Regular (weight 400)
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14 * 1.47, // 147% line height ≈ 20.58px
    letterSpacing: 0,
    textAlign: 'center',
    marginTop: 10, // Space between title and subtitle
    marginBottom: 20, // Space between subtitle and button
  },
  loginButton: {
    backgroundColor: '#FF9500', // Match Colors.light/dark.background
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25, // Rounded corners for the button
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Fonts.Comfortaa.Medium, // Use Comfortaa-Medium for better readability
    fontWeight: '500',
    fontSize: 16,
    color: '#FFFFFF', // White text, matching tabIconDefault
  },
});

export default CheckLogin;