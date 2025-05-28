import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ChangePasswordApi } from '@/services/user.services';
import { Ionicons } from '@expo/vector-icons'; // Ensure this is installed
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ChangePassword = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tất cả các thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }

    // Password validation: at least one uppercase, one lowercase, one number, one special character
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&;])[A-Za-z\d@$!%*?&;]+$/.test(newPassword)) {
      Alert.alert(
        'Lỗi',
        'Mật khẩu mới phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt'
      );
      return;
    }

    setIsLoading(true);
    // Call the ChangePasswordApi
    await ChangePasswordApi({
      oldPassword: currentPassword,
      newPassword: newPassword,
    });

    // On success, clear inputs and show success message
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsLoading(false);
    Alert.alert('Thành công', 'Đổi mật khẩu thành công');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    headerTitle: {
      fontFamily: Fonts.Baloo2.Bold,
      fontSize: 20,
      color: Colors[colorScheme].text,
      marginLeft: 10,
    },
    inputContainer: {
      marginBottom: 15,
      position: 'relative', // For positioning the eye icon
    },
    label: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].text,
      marginBottom: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      padding: 12,
      paddingRight: 40, // Space for the eye icon
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].text,
      backgroundColor: Colors[colorScheme].whiteText,
    },
    eyeIcon: {
      position: 'absolute',
      right: 10,
      top: '50%', // Adjust to center vertically
      transform: [{ translateY: 10 }], // Fine-tune vertical alignment
    },
    button: {
      backgroundColor: Colors[colorScheme].tabBackground || '#007AFF',
      borderRadius: 8,
      padding: 15,
      alignItems: 'center',
      marginTop: 20,
      opacity: isLoading ? 0.7 : 1,
    },
    buttonText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontSize: 16,
      color: Colors[colorScheme].background,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu hiện tại</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showCurrentPassword}
          placeholder="Nhập mật khẩu hiện tại"
          placeholderTextColor={Colors[colorScheme].icon}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowCurrentPassword(!showCurrentPassword)}
        >
          <Ionicons
            name={showCurrentPassword ? 'eye-off' : 'eye'}
            size={24}
            color={Colors[colorScheme].icon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNewPassword}
          placeholder="Nhập mật khẩu mới"
          placeholderTextColor={Colors[colorScheme].icon}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowNewPassword(!showNewPassword)}
        >
          <Ionicons
            name={showNewPassword ? 'eye-off' : 'eye'}
            size={24}
            color={Colors[colorScheme].icon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          placeholder="Xác nhận mật khẩu mới"
          placeholderTextColor={Colors[colorScheme].icon}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? 'eye-off' : 'eye'}
            size={24}
            color={Colors[colorScheme].icon}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleChangePassword}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePassword;