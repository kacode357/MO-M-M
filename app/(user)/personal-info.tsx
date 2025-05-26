import DEFAULT_AVATAR from '@/assets/images/logo-app.png';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GetUserByIdApi, UpdateUserApi } from '@/services/user.services';
import { uploadImage } from '@/utils/uploadImage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import {
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
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) throw new Error('User ID not found');
        const response = await GetUserByIdApi(userId);
        setUserData(response.data);
        setStatus('success');
      } catch (error) {
        console.error('Fetch user error:', error);
        setStatus('error');
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

  const handleInputChange = (field: keyof UserData, value: string) => {
    if (userData) {
      setUserData({ ...userData, [field]: value });
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate && userData) {
      setUserData({ ...userData, dateOfBirth: format(selectedDate, 'yyyy-MM-dd') });
    }
  };

  const handleUpdate = async () => {
    if (!userData) return;
    try {
      setIsUpdating(true);
      await UpdateUserApi(userData);
      await AsyncStorage.setItem('user_fullname', userData.fullname);
      setIsEditing(false);
      setStatus('success');
    } catch (error) {
      console.error('Update user error:', error);
      setStatus('error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async () => {
    if (!userData) return;
    try {
      const result = await uploadImage(
        () => {}, // No-op for setImageUri
        (url) => url && setUserData({ ...userData, image: url }),
        setIsUploading
      );
      // Only set error status if there's an actual upload error, not on cancel
      if (!result.imageUrl && !result.imageUri) {
        // If both are null, it was canceled, so do nothing
        return;
      }
      if (!result.imageUrl && result.imageUri) {
        // If imageUri exists but imageUrl doesn't, there was an upload error
        setStatus('error');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setStatus('error');
    }
  };

  const formatDisplayDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString || 'DD/MM/YYYY';
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors[colorScheme].background },
    scrollContainer: { padding: 20, paddingBottom: 40 },
    profileContainer: { alignItems: 'center', marginBottom: 20 },
    profileImage: { width: 100, height: 100, borderRadius: 50 },
    inputLabel: { fontSize: 16, fontWeight: '600', color: Colors[colorScheme].blackText, marginBottom: 8 },
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
    uploadButton: {
      backgroundColor: Colors[colorScheme].primaryText,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
    },
    uploadButtonText: {
      color: Colors[colorScheme].whiteText,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
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
    statusContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    statusText: { fontSize: 18, color: Colors[colorScheme].error },
  });

  if (status === 'loading') {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Loading...</Text>
      </View>
    );
  }

  if (status === 'error' || !userData) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Failed to load user data</Text>
      </View>
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
        <View style={styles.profileContainer}>
          <Image
            source={userData.image?.trim() ? { uri: userData.image } : DEFAULT_AVATAR}
            style={styles.profileImage}
            defaultSource={DEFAULT_AVATAR}
          />
        </View>

        {isEditing && (
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.disabledButton]}
            onPress={handleImageUpload}
            disabled={isUploading}
          >
            <Text style={styles.uploadButtonText}>
              {isUploading ? 'Đang tải lên...' : 'Chọn ảnh hồ sơ'}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.inputLabel}>Họ và Tên</Text>
        <TextInput
          style={styles.input}
          value={userData.fullname}
          onChangeText={(text) => handleInputChange('fullname', text)}
          editable={isEditing}
          placeholder="Nguyễn Văn A"
          placeholderTextColor={Colors[colorScheme].icon}
        />

        <Text style={styles.inputLabel}>Số Điện Thoại</Text>
        <TextInput
          style={styles.input}
          value={userData.phoneNumber}
          onChangeText={(text) => handleInputChange('phoneNumber', text)}
          editable={isEditing}
          placeholder="0123456789"
          placeholderTextColor={Colors[colorScheme].icon}
          keyboardType="phone-pad"
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
                style={[styles.button, isUpdating && styles.disabledButton]}
                onPress={handleUpdate}
                disabled={isUpdating}
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
    </KeyboardAvoidingView>
  );
};

export default PersonalInfo;