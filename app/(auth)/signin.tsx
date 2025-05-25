import logo from '@/assets/images/logo-mm-final.png';
import { Colors } from '@/constants/Colors';
import { useAlert } from '@/contexts/AlertContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GetCurrentUserApi, LoginUserApi } from '@/services/user.services'; // Add GetCurrentUserApi
import { signinStyles } from '@/styles/SigninStyles';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const Signin = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { showAlert } = useAlert();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => setSecureTextEntry(!secureTextEntry);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleSignin = async () => {
    // Client-side validation: only check if fields are filled
    if (!userName || !password) {
      showAlert({
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.',
        confirmText: 'OK',
        showCancel: false,
      });
      return;
    }

    setIsLoading(true);
    try {
      const loginResponse = await LoginUserApi({
        userName,
        password,
      });
      const { accessToken, refreshToken } = loginResponse.data;
      await AsyncStorage.setItem('accessToken', accessToken);
      console.log('Login response data:', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      const userResponse = await GetCurrentUserApi();
      console.log('GetCurrentUser response data:', userResponse);
      const { premium, id, userName: userNameResponse, email } = userResponse.data;
      await AsyncStorage.setItem('user_premium', JSON.stringify(premium));
      await AsyncStorage.setItem('user_id', id);
      await AsyncStorage.setItem('user_name', userNameResponse);
      await AsyncStorage.setItem('user_email', email);
      router.push('/(tabs)');
    } catch (error) {
      console.error('Signin error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate styles with colorScheme and isLoading
  const styles = signinStyles(colorScheme, isLoading);

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>ĐĂNG NHẬP</Text>
        </View>

        <Text style={styles.inputLabel}>Tên đăng nhập</Text>
        <TextInput
          style={styles.input}
          placeholder="username"
          placeholderTextColor={Colors[colorScheme].icon}
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Mật khẩu</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor={Colors[colorScheme].icon}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
            <Ionicons
              name={secureTextEntry ? 'eye-off' : 'eye'}
              size={20}
              color={Colors[colorScheme].primaryText}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => {
            Keyboard.dismiss();
            handleSignin();
          }}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-facebook" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
        </View>

        <View style={styles.signupLinkContainer}>
          <Text style={styles.signupText}>Bạn chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.signupLink}>Đăng ký tơi đây</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Signin;