import { defaultAxiosInstance } from '@/config/axios.customize';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 30;

const ResetPasswordApi = async (data: ResetPasswordData) => {
  const response = await defaultAxiosInstance.post('/api/users/reset-password', data);
  return response;
};

// Stub for resend OTP API (replace with actual implementation)
const ResendOtpApi = async (email: string) => {
  console.log('Resending OTP to:', email);
  return { success: true };
};

const VerifyOTP = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  const otpInputs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const scrollViewRef = useRef<ScrollView>(null);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

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

  const handleResend = async () => {
    if (!email) {
      setError('Không tìm thấy email. Vui lòng thử lại.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await ResendOtpApi(email);
      setCanResend(false);
      setCountdown(COUNTDOWN_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(''));
      otpInputs.current[0]?.focus();
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Không thể gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      otpInputs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }

    if (newOtp.every((digit) => digit) && index === OTP_LENGTH - 1) {
      handleVerifyOtp();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOtp = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      setError(`Vui lòng nhập đủ ${OTP_LENGTH} chữ số OTP.`);
      return;
    }

    setError('');
    setIsOtpVerified(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ mật khẩu.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (!email) {
      setError('Không tìm thấy email. Vui lòng thử lại.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const otpCode = otp.join('');
      await ResetPasswordApi({
        email,
        otp: otpCode,
        newPassword,
      });
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Mã OTP không hợp lệ. Vui lòng nhập lại.');
      setIsOtpVerified(false);
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsLoading(false);
    }
  };

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
      paddingVertical: 30,
    },
    textContainer: {
      alignItems: 'flex-start',
      width: '100%',
      marginTop: 40,
    },
    title: {
      fontFamily: Fonts.Baloo2.ExtraBold,
      fontWeight: '400',
      fontSize: 36,
      lineHeight: 36 * 1.3,
      letterSpacing: -0.02 * 36,
      color: Colors[colorScheme].text,
      textAlign: 'left',
      marginBottom: 12,
    },
    instruction: {
      fontFamily: Fonts.Baloo2.Regular,
      fontWeight: '400',
      fontSize: 16,
      lineHeight: 24,
      color: Colors[colorScheme].primaryText,
      textAlign: 'left',
      marginBottom: 24,
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 20,
    },
    otpInput: {
      width: 50,
      height: 50,
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 12,
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 20,
      color: Colors[colorScheme].text,
      textAlign: 'center',
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
      marginBottom: 15,
    },
    verifyButton: {
      width: '100%',
      height: 50,
      backgroundColor: Colors[colorScheme].primaryText,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      opacity: isLoading ? 0.6 : 1,
    },
    verifyButtonText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontWeight: '500',
      fontSize: 16,
      color: Colors[colorScheme].whiteText,
      textAlign: 'center',
    },
    resendText: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontWeight: '400',
      fontSize: 14,
      color: Colors[colorScheme].primaryText,
      textAlign: 'center',
    },
    resendButton: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontWeight: '400',
      fontSize: 14,
      color: Colors[colorScheme].primaryText,
      textAlign: 'center',
      textDecorationLine: 'underline',
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
          <Text style={styles.title}>
            {isOtpVerified ? 'ĐẶT LẠI MẬT KHẨU' : 'XÁC THỰC OTP'}
          </Text>
          <Text style={styles.instruction}>
            {isOtpVerified
              ? 'Vui lòng nhập mật khẩu mới cho tài khoản của bạn'
              : `Nhập mã OTP mà chúng mình vừa gửi qua ${email || 'hello@example.com'}`}
          </Text>
        </View>

        {!isOtpVerified ? (
          <>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  ref={(ref) => {
                    otpInputs.current[index] = ref; // No return, ensures void
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                      otpInputs.current[index - 1]?.focus();
                    }
                  }}
                />
              ))}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOtp} disabled={isLoading}>
              <Text style={styles.verifyButtonText}>Xác nhận</Text>
            </TouchableOpacity>

            {canResend ? (
              <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                <Text style={styles.resendButton}>Gửi lại mã</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendText}>Gửi lại mã sau {formatTime(countdown)}</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.inputLabel}>Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor={Colors[colorScheme].icon}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Xác nhận lại mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor={Colors[colorScheme].icon}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.verifyButton}
              onPress={() => {
                dismissKeyboard();
                handleResetPassword();
              }}
              disabled={isLoading}
            >
              <Text style={styles.verifyButtonText}>
                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VerifyOTP;