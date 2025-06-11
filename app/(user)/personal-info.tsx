import DEFAULT_AVATAR from '@/assets/images/logo-app.png';
import AlertModal from '@/components/AlertModal';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GetUserByIdApi, UpdateUserApi } from '@/services/user.services';
import { uploadImage } from '@/utils/uploadImage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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

interface UserData {
  id: string;
  phoneNumber: string;
  fullname: string;
  image: string;
  dateOfBirth: string;
}

const PersonalInfo = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    isSuccess: boolean;
    onConfirm: () => void;
  }>({
    title: '',
    message: '',
    isSuccess: false,
    onConfirm: () => setModalVisible(false),
  });
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) throw new Error('User ID not found');
        const response = await GetUserByIdApi(userId);
        setUserData(response.data);
      } catch (error) {
        console.error('Fetch user error:', error);
        setModalConfig({
          title: 'Lỗi',
          message: 'Không thể tải thông tin người dùng. Vui lòng thử lại.',
          isSuccess: false,
          onConfirm: () => setModalVisible(false),
        });
        setModalVisible(true);
      }
    };

    fetchUserData();

    const keyboardShow = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      keyboardShow.remove();
      keyboardHide.remove();
    };
  }, []);

  // Update input fields
  const handleInputChange = (field: keyof UserData, value: string) => {
    if (userData) {
      setUserData({ ...userData, [field]: value });
    }
  };

  // Handle date selection
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios' && event.type !== 'dismiss');
    if (selectedDate && userData) {
      setUserData({ ...userData, dateOfBirth: format(selectedDate, 'yyyy-MM-dd') });
    }
  };

  // Validate and update user data
  const handleUpdate = async () => {
    if (!userData || isUploading) return;

    // Validate phone number (exactly 10 digits)
    if (!/^\d{10}$/.test(userData.phoneNumber)) {
      setModalConfig({
        title: 'Lỗi',
        message: 'Số điện thoại phải chứa đúng 10 chữ số.',
        isSuccess: false,
        onConfirm: () => setModalVisible(false),
      });
      setModalVisible(true);
      return;
    }

    try {
      setIsUpdating(true);
      await UpdateUserApi(userData);
      await AsyncStorage.setItem('user_fullname', userData.fullname);
      setIsEditing(false);
    
     
    } catch (error) {
      console.error('Update user error:', error);
      
    
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async () => {
    if (!userData) return;
    try {
      const result = await uploadImage(
        () => {}, // No-op for setImageUri
        (url) => url && setUserData({ ...userData, image: url }),
        setIsUploading,
      );
      if (!result.imageUrl && result.imageUri) {
        // Upload failed
        setModalConfig({
          title: 'Lỗi',
          message: 'Tải ảnh lên thất bại. Vui lòng thử lại.',
          isSuccess: false,
          onConfirm: () => setModalVisible(false),
        });
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setModalConfig({
        title: 'Lỗi',
        message: 'Tải ảnh lên thất bại. Vui lòng thử lại.',
        isSuccess: false,
        onConfirm: () => setModalVisible(false),
      });
      setModalVisible(true);
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
      return 'DD/MM/YYYY';
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors[colorScheme].background },
    scrollContainer: { padding: 20, paddingBottom: 40 },
    imagePickerContainer: {
      width: 100,
      height: 100,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: Colors[colorScheme].primaryText,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      overflow: 'hidden',
      alignSelf: 'center',
    },
    disabledContainer: { opacity: 0.6 },
    profileImage: { width: 100, height: 100, borderRadius: 8 },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[colorScheme].blackText,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].grayBackground,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      fontSize: 16,
      color: Colors[colorScheme].text,
      backgroundColor: isEditing ? Colors[colorScheme].background : Colors[colorScheme].grayBackground,
    },
    dateInput: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].grayBackground,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      justifyContent: 'center',
      backgroundColor: isEditing ? Colors[colorScheme].background : Colors[colorScheme].grayBackground,
    },
    dateText: {
      fontSize: 16,
      color: userData?.dateOfBirth ? Colors[colorScheme].text : Colors[colorScheme].icon,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    button: {
      flex: 1,
      backgroundColor: isEditing ? Colors[colorScheme].primaryText : Colors[colorScheme].grayBackground,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 8,
    },
    buttonText: {
      color: isEditing ? Colors[colorScheme].whiteText : Colors[colorScheme].blackText,
      fontSize: 16,
      fontWeight: '600',
    },
    disabledButton: { opacity: 0.5 },
  });

  if (!userData) {
    return (
      <AlertModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        isSuccess={modalConfig.isSuccess}
        showCancel={false}
        confirmText="OK"
        onConfirm={modalConfig.onConfirm}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 100, android: 0 })}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: keyboardHeight }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.imagePickerContainer, (!isEditing || isUploading) && styles.disabledContainer]}
          onPress={isEditing ? handleImageUpload : undefined}
          disabled={!isEditing || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="large" color={Colors[colorScheme].primaryText} />
          ) : (
            <Image
              source={userData.image?.trim() ? { uri: userData.image } : DEFAULT_AVATAR}
              style={styles.profileImage}
            />
          )}
        </TouchableOpacity>

        <Text style={styles.inputLabel}>Họ và Tên</Text>
        <TextInput
          style={styles.input}
          value={userData.fullname}
          onChangeText={(text) => handleInputChange('fullname', text)}
          editable={isEditing}
          placeholder="Nhập họ và tên"
          placeholderTextColor={Colors[colorScheme].icon}
        />

        <Text style={styles.inputLabel}>Số Điện Thoại</Text>
        <TextInput
          style={styles.input}
          value={userData.phoneNumber}
          onChangeText={(text) => handleInputChange('phoneNumber', text.replace(/[^0-9]/g, ''))}
          editable={isEditing}
          placeholder="0123456789"
          placeholderTextColor={Colors[colorScheme].icon}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Text style={styles.inputLabel}>Ngày Sinh</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => isEditing && setShowDatePicker(true)}
          disabled={!isEditing}
        >
          <Text style={styles.dateText}>
            {userData.dateOfBirth ? formatDisplayDate(userData.dateOfBirth) : 'DD/MM/YYYY'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={
              userData.dateOfBirth && !isNaN(Date.parse(userData.dateOfBirth))
                ? parseISO(userData.dateOfBirth)
                : new Date()
            }
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            textColor={Colors[colorScheme].text}
            themeVariant={colorScheme}
          />
        )}

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, (isUploading || isUpdating) && styles.disabledButton]}
                onPress={handleUpdate}
                disabled={isUploading || isUpdating}
              >
                <Text style={styles.buttonText}>{isUpdating ? 'Đang lưu...' : 'Lưu'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: Colors[colorScheme].grayBackground }]}
                onPress={() => {
                  setIsEditing(false);
                  setShowDatePicker(false);
                }}
              >
                <Text style={[styles.buttonText, { color: Colors[colorScheme].blackText }]}>Hủy</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, { alignSelf: 'center', paddingHorizontal: 40 }]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Chỉnh Sửa</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <AlertModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        isSuccess={modalConfig.isSuccess}
        showCancel={false}
        confirmText="OK"
        onConfirm={modalConfig.onConfirm}
      />
    </KeyboardAvoidingView>
  );
};

export default PersonalInfo;