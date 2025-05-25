import { defaultAxiosInstance } from '@/config/axios.customize';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface UserInfo {
  fullName: string;
  email: string;
  phone: string;
  photo?: string; // Optional photo URL
}

// API function to get current user
const GetCurrentLoginApi = async () => {
  const response = await defaultAxiosInstance.get('/api/users/get-current-login');
  return response;
};

const DEFAULT_AVATAR = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png';

const UserProfile = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch user info when component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await GetCurrentLoginApi();
        const userData = response.data;
        setUserInfo({
          fullName: userData.fullname,
          email: userData.email,
          phone: userData.phone,
          photo: userData.photo, // Optional photo field
        });
      } catch (error) {
        console.error('Error fetching user info:', error);
        setError('Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.');
        await AsyncStorage.removeItem('accessToken');
        router.replace('/(auth)/signin');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      console.log('Logged out and token removed');
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Error removing token:', error);
      router.replace('/(auth)/signin');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    avatarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 40,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: Colors[colorScheme].icon,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      overflow: 'hidden', // Ensure image fits within the circular border
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontSize: 20,
      color: Colors[colorScheme].text,
    },
    nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    fullName: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontSize: 18,
      color: Colors[colorScheme].text,
    },
    freeLabel: {
      marginLeft: 10,
      backgroundColor: '#FFE4B5',
      borderRadius: 15,
      paddingVertical: 3,
      paddingHorizontal: 10,
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 12,
      color: Colors[colorScheme].text,
    },
    sectionTitle: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontSize: 16,
      color: Colors[colorScheme].text,
      marginVertical: 10,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].icon,
    },
    infoLabel: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    infoValue: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    button: {
      backgroundColor: '#FFA500',
      borderRadius: 25,
      paddingVertical: 15,
      marginVertical: 5,
      alignItems: 'center',
    },
    buttonText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontSize: 16,
      color: Colors[colorScheme].whiteText,
    },
    settingsSection: {
      marginTop: 20,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].icon,
    },
    settingLabel: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    languageValue: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    passwordValue: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].primaryText,
      textAlign: 'center',
      marginBottom: 20,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primaryText} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!userInfo) {
    return null;
  }

  const hasPhoneNumber = userInfo.phone && userInfo.phone.trim() !== '';
  const avatarSource = userInfo.photo ? userInfo.photo : DEFAULT_AVATAR;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={styles.container}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Image
            source={{ uri: avatarSource }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.fullName}>{userInfo.fullName}</Text>
          <Text style={styles.freeLabel}>Miễn phí</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{userInfo.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Số điện thoại</Text>
        <Text style={styles.infoValue}>
          {hasPhoneNumber ? userInfo.phone : 'Chưa cập nhật'}
        </Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Địa chỉ đã lưu</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Quản yêu thích</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Hoạt động</Text>
      </TouchableOpacity>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Ngôn ngữ</Text>
          <Text style={styles.languageValue}>Tiếng Việt</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Đổi mật khẩu</Text>
          <Text style={styles.passwordValue}>********</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Nhận thông báo</Text>
          <Switch
            value={isNotificationEnabled}
            onValueChange={setIsNotificationEnabled}
            trackColor={{ false: Colors[colorScheme].icon, true: '#FFA500' }}
            thumbColor={Colors[colorScheme].whiteText}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UserProfile;