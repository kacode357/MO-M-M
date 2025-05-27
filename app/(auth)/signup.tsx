import AlertModal from '@/components/AlertModal'; // Adjust the import path as needed
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CreateUserApi } from '@/services/user.services';
import { signupStyles } from '@/styles/SignupStyles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Signup = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    isSuccess?: boolean;
    onConfirm?: () => void;
  }>({ title: '', message: '' });

  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const togglePasswordVisibility = () => setSecureTextEntry(!secureTextEntry);
  const toggleConfirmPasswordVisibility = () => setSecureConfirmTextEntry(!secureConfirmTextEntry);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleSignup = async () => {
    // Client-side validation
    if (!email || !fullName || !userName || !password || !confirmPassword) {
      setModalConfig({
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ tất cả các thông tin',
      });
      setModalVisible(true);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setModalConfig({
        title: 'Lỗi',
        message: 'Định dạng email không hợp lệ',
      });
      setModalVisible(true);
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(userName)) {
      setModalConfig({
        title: 'Lỗi',
        message: 'Tên đăng nhập chỉ được chứa chữ thường, số, dấu gạch dưới hoặc gạch ngang, không chứa khoảng trắng hoặc chữ hoa',
      });
      setModalVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setModalConfig({
        title: 'Lỗi',
        message: 'Mật khẩu và xác nhận mật khẩu không khớp',
      });
      setModalVisible(true);
      return;
    }

    if (password.length < 6) {
      setModalConfig({
        title: 'Lỗi',
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
      });
      setModalVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      await CreateUserApi({
        fullName,
        email,
        userName,
        password,
      });
      router.push('/(auth)/signin');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const keyboardDidShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
    };

    const keyboardDidHide = () => {
      setKeyboardHeight(0);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };

    const showSubscription = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const hideSubscription = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const styles = signupStyles(colorScheme, isLoading);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.select({
        ios: 60,
        android: 80,
      })}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: keyboardHeight }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>TẠO TÀI KHOẢN</Text>
          <Text style={styles.subtitle}>
            Hãy điền đầy đủ thông tin dưới đây để chúng mình có thể hỗ trợ tốt hơn nhé!
          </Text>
        </View>

        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="hello@example.com"
          placeholderTextColor={Colors[colorScheme].icon}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />

        <Text style={styles.inputLabel}>Họ tên của bạn</Text>
        <TextInput
          style={styles.input}
          placeholder="Nguyễn Văn A"
          placeholderTextColor={Colors[colorScheme].icon}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          editable={!isLoading}
        />

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

        <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor={Colors[colorScheme].icon}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={secureConfirmTextEntry}
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={toggleConfirmPasswordVisibility}>
            <Ionicons
              name={secureConfirmTextEntry ? 'eye-off' : 'eye'}
              size={20}
              color={Colors[colorScheme].primaryText}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Bằng cách gửi biểu mẫu này, tôi đồng ý với{' '}
          </Text>
          <TouchableOpacity onPress={() => {/* Navigate to terms */}}>
            <Text style={styles.termsLink}>điều khoản và điều kiện</Text>
          </TouchableOpacity>
          <Text style={styles.termsText}> của Măm</Text>
        </View>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => {
            dismissKeyboard();
            handleSignup();
          }}
          disabled={isLoading}
        >
          <Text style={styles.signupButtonText}>
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Bạn đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
            <Text style={styles.loginLink}>Đăng nhập tơi đây</Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;