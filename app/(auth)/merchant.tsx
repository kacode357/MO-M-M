import logo from '@/assets/images/logo-merchant.png';
import AlertModal from '@/components/AlertModal'; // Adjust the import path as needed
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { signinStyles } from '@/styles/SigninMerchantStyles';
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

const SigninMerChant = () => {
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
  // Client-side validation
  if (!userName || !password) {
    setModalConfig({
      title: 'Lỗi',
      message: 'Vui lòng điền đầy đủ tên đăng nhập và mật khẩu',
    });
    setModalVisible(true);
    return;
  }



  setIsLoading(true);
  try {
    // Simulate successful login with mock Merchant data
    const mockLoginResponse = {
      data: {
        accessToken: 'mock-access-token-merchant',
        refreshToken: 'mock-refresh-token-merchant',
      },
    };

    const mockUserResponse = {
      data: {
        premium: false, // Adjust based on your app's logic
        id: 'mock-merchant-id-123',
        userName: userName,
        email: `${userName}@merchant.example.com`, // Mock email
        fullname: `Merchant ${userName}`,
        role: 'Merchant', // Explicitly set the role to Merchant
      },
    };

    // Store tokens in AsyncStorage
    await AsyncStorage.setItem('accessToken', mockLoginResponse.data.accessToken);
    await AsyncStorage.setItem('refreshToken', mockLoginResponse.data.refreshToken);

    // Store user data in AsyncStorage
    await AsyncStorage.setItem('user_premium', JSON.stringify(mockUserResponse.data.premium));
    await AsyncStorage.setItem('user_id', mockUserResponse.data.id);
    await AsyncStorage.setItem('user_name', mockUserResponse.data.userName);
    await AsyncStorage.setItem('user_email', mockUserResponse.data.email);
    await AsyncStorage.setItem('user_fullname', mockUserResponse.data.fullname);
    await AsyncStorage.setItem('user_role', mockUserResponse.data.role); // Store the role

    // Redirect to the tabs route
    router.push('/(tabs)');
  } catch (error) {
    console.error('Signin error:', error);
    setModalConfig({
      title: 'Lỗi',
      message: 'Đã có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.',
    });
    setModalVisible(true);
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
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Trở thành đối tác cùng chúng mình</Text>
          <View style={styles.dividerLine} />
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

export default SigninMerChant;