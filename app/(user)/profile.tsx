import DEFAULT_AVATAR from '@/assets/images/logo-app.png';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GetCurrentUserApi } from '@/services/user.services';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface UserInfo {
  fullName: string;
  email: string;
  photo?: string;
}

const UserProfile = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const user_fullname = await AsyncStorage.getItem('user_fullname');
      const { data } = await GetCurrentUserApi();

      setUserInfo({
        fullName: user_fullname ?? data.fullName ?? 'Unknown User',
        email: data.email,
        photo: data.image,
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      router.replace('/(auth)/signin');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
    }, [fetchUserInfo])
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Failed to load user data</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Image
              source={userInfo.photo ? { uri: userInfo.photo } : DEFAULT_AVATAR}
              style={styles.avatarImage}
              resizeMode="cover"
              defaultSource={DEFAULT_AVATAR}
            />
          </View>
          <View style={styles.nameAndLabel}>
            <Text
              style={styles.fullName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {userInfo.fullName}
            </Text>
            <Text style={styles.freeLabel}>Miễn phí</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color={Colors[colorScheme].whiteText} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{userInfo.email}</Text>
      </View>
    </ScrollView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.tabBackground,
    paddingTop: 50,
    padding: 20,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.icon,
    marginRight: 10,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  nameAndLabel: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
  },
  fullName: {
    fontFamily: Fonts.Comfortaa.SemiBold,
    fontSize: 18,
    color: Colors.light.whiteText,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  freeLabel: {
    marginTop: 4,
    backgroundColor: '#FFE4B5',
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 10,
    fontFamily: Fonts.Comfortaa.ExtraBold,
    fontSize: 12,
    color: Colors.light.text,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontFamily: Fonts.Comfortaa.Medium,
    fontSize: 16,
    color: Colors.light.text,
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.icon,
  },
  infoLabel: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.text,
  },
  infoValue: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    color: Colors.light.text,
  },
});
