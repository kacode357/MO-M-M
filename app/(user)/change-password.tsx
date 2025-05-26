import AlertModal from '@/components/AlertModal'; // Adjust the import path as needed
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ChangePasswordApi } from '@/services/user.services';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ChangePassword = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    isSuccess?: boolean;
    onConfirm?: () => void;
  }>({ title: '', message: '' });

  const handleChangePassword = async () => {
    try {
      // Basic validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        setModalConfig({
          title: 'Lỗi',
          message: 'Vui lòng điền đầy đủ tất cả các trường',
        });
        setModalVisible(true);
        return;
      }

      if (newPassword !== confirmPassword) {
        setModalConfig({
          title: 'Lỗi',
          message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
        });
        setModalVisible(true);
        return;
      }

      if (newPassword.length < 8) {
        setModalConfig({
          title: 'Lỗi',
          message: 'Mật khẩu mới phải có ít nhất 8 ký tự',
        });
        setModalVisible(true);
        return;
      }

      setIsLoading(true);

      // Call the ChangePasswordApi
      await ChangePasswordApi({
        oldPassword: currentPassword,
        newPassword: newPassword,
      });

      
      setModalVisible(true);
    } catch (error: any) {
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
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
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].text,
      backgroundColor: Colors[colorScheme].whiteText,
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
          secureTextEntry
          placeholder="Nhập mật khẩu hiện tại"
          placeholderTextColor={Colors[colorScheme].icon}
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Nhập mật khẩu mới"
          placeholderTextColor={Colors[colorScheme].icon}
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Xác nhận mật khẩu mới"
          placeholderTextColor={Colors[colorScheme].icon}
          editable={!isLoading}
        />
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
  );
};

export default ChangePassword;