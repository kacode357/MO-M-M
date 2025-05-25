import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ForgotPasswordApi } from '@/services/user.services';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const ForgotPassword = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [requestAttempts, setRequestAttempts] = useState<number>(0);
  const [requestBlockedUntil, setRequestBlockedUntil] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (requestBlockedUntil > 0) {
      const now = Date.now();
      if (now >= requestBlockedUntil) {
        setRequestAttempts(0);
        setRequestBlockedUntil(0);
      }
    }
  }, [requestBlockedUntil]);

  const handleForgotPassword = async () => {
    const now = Date.now();
    const maxAttempts = 3;
    const blockDuration = 5 * 60 * 1000;

    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }

    if (requestBlockedUntil > now) {
      const remainingTime = Math.ceil((requestBlockedUntil - now) / 1000);
      setError(`Vui lòng chờ ${remainingTime} giây trước khi thử lại.`);
      return;
    }

    if (requestAttempts >= maxAttempts) {
      setRequestBlockedUntil(now + blockDuration);
      setRequestAttempts(0);
      setError('Bạn đã vượt quá số lần thử. Vui lòng chờ 5 phút.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await ForgotPasswordApi({ email });
      console.log('ForgotPasswordApi response:', response.data);
      setRequestAttempts((prev) => prev + 1);
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { email },
      });
    } catch (error) {
      console.error('Error sending forgot password request:', error);
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const keyboardDidShow = (event: any) => {
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 30, // Increased for better spacing
    },
    textContainer: {
      alignItems: 'flex-start',
      width: '100%',
      marginTop: 40, // Lower the title and instruction
    },
    title: {
      fontFamily: Fonts.Baloo2.ExtraBold,
      fontWeight: '400',
      fontSize: 36, // Reduced from 46
      lineHeight: 36 * 1.3, // Adjusted proportionally
      letterSpacing: -0.02 * 36, // Adjusted for new font size
      color: Colors[colorScheme].text,
      textAlign: 'left',
      marginBottom: 12, // Increased for spacing
    },
    instruction: {
      fontFamily: Fonts.Baloo2.Regular,
      fontWeight: '400',
      fontSize: 16,
      lineHeight: 24,
      color: Colors[colorScheme].primaryText,
      textAlign: 'left',
      marginBottom: 24, // Adjusted for tighter spacing
    },
    inputLabel: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontWeight: '500',
      fontSize: 16,
      color: Colors[colorScheme].text,
      marginBottom: 5,
      alignSelf: 'flex-start',
    },
    input: {
      width: '100%',
      height: 50,
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 25,
      paddingHorizontal: 15,
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 16,
      color: Colors[colorScheme].text,
      marginBottom: 20,
    },
    resetButton: {
      width: '100%',
      height: 50,
      backgroundColor: Colors[colorScheme].primaryText,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      opacity: isLoading ? 0.6 : 1,
    },
    resetButtonText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontWeight: '500',
      fontSize: 16,
      color: Colors[colorScheme].whiteText,
      textAlign: 'center',
    },
    errorText: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontWeight: '400',
      fontSize: 14,
      color: Colors[colorScheme].primaryText,
      textAlign: 'center',
      marginBottom: 15,
    },
  });

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
          <Text style={styles.title}>QUÊN MẬT KHẨU?</Text>
          <Text style={styles.instruction}>
            Đừng lo lắng, hãy nhập email của bạn để đặt lại mật khẩu
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
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            dismissKeyboard();
            handleForgotPassword();
          }}
          disabled={isLoading}
        >
          <Text style={styles.resetButtonText}>
            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;