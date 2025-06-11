import logo from '@/assets/images/logo-mm-final-2.png';
import AlertModal from '@/components/AlertModal';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GetCurrentUserApi, LoginUserApi } from '@/services/user.services';
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

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    isSuccess?: boolean;
    onConfirm?: () => void;
  }>({ title: '', message: '' });

  const togglePasswordVisibility = () => setSecureTextEntry(!secureTextEntry);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

 const handleSignin = async () => {
  // Validate input fields
  if (!userName || !password) {
    setModalConfig({
      title: 'Lỗi',
      message: 'Vui lòng điền đầy đủ tên đăng nhập và mật khẩu',
    });
    setModalVisible(true);
    return;
  }

  // Validate username format
  if (!/^[a-z0-9_-]+$/.test(userName)) {
    setModalConfig({
      title: 'Lỗi',
      message: 'Tên đăng nhập chỉ được chứa chữ thường, số, dấu gạch dưới hoặc gạch ngang, không chứa khoảng trắng hoặc chữ hoa',
    });
    setModalVisible(true);
    return;
  }

  setIsLoading(true);
  // No try-catch to avoid handling API errors
  const loginResponse = await LoginUserApi({ userName, password });
  const { accessToken, refreshToken } = loginResponse.data;
  await AsyncStorage.setItem('accessToken', accessToken);
  await AsyncStorage.setItem('refreshToken', refreshToken);

  const userResponse = await GetCurrentUserApi();
  const { premium, id, userName: userNameResponse, email, fullname, roles } = userResponse.data;
  console.log('User roles:', roles[0]);

  // Check if the user has the User role
  if (roles[0] !== 'User') {
    console.log('Access denied: User does not have User role');
    setIsLoading(false);
    return;
  }

  // Store user data in AsyncStorage
  await AsyncStorage.setItem('user_premium', JSON.stringify(premium));
  await AsyncStorage.setItem('user_id', id);
  await AsyncStorage.setItem('user_name', userNameResponse);
  await AsyncStorage.setItem('user_email', email);
  await AsyncStorage.setItem('user_fullname', fullname);

  // Navigate to tabs
  router.push('/(tabs)');
  setIsLoading(false);
};
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
          editable={!isLoading}
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
            editable={!isLoading}
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
            <Text style={styles.signupLink}>Đăng ký tại đây</Text>
          </TouchableOpacity>
        </View>

        <AlertModal
          visible={modalVisible}
          title={modalConfig.title}
          message={modalConfig.message}
          isSuccess={modalConfig.isSuccess}
          onConfirm={() => {
            setModalVisible(false);
            if (modalConfig.onConfirm) modalConfig.onConfirm();
          }}
          onCancel={() => setModalVisible(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Signin;