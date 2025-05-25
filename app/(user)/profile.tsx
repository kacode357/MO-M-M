import DEFAULT_AVATAR from '@/assets/images/logo-app.png';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GetCurrentUserApi } from '@/services/user.services';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UserInfo {
  fullName: string;
  email: string;
  photo?: string;
}

const UserProfile = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data } = await GetCurrentUserApi();
        setUserInfo({
          fullName: data.fullname,
          email: data.email,
          photo: data.photo,
        });
      } catch (error) {
        console.error('Error fetching user info:', error);
        router.replace('/(auth)/signin');
      }
    };
    fetchUserInfo();
  }, [router]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors[colorScheme].tabBackground,
      padding: 20,
    },
    avatarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 30,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: Colors[colorScheme].icon,
      marginRight: 10,
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 25,
    },
    nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    fullName: {
      fontFamily: Fonts.Comfortaa.SemiBold,
      fontSize: 18,
      color: Colors[colorScheme].whiteText,
    },
    freeLabel: {
      marginLeft: 10,
      backgroundColor: '#FFE4B5',
      borderRadius: 5,
      paddingVertical: 3,
      paddingHorizontal: 10,
      fontFamily: Fonts.Comfortaa.ExtraBold,
      fontSize: 12,
      color: Colors[colorScheme].text,
    },
    sectionTitle: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontSize: 16,
      color: Colors[colorScheme].text,
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
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Image
              source={userInfo?.photo ? { uri: userInfo.photo } : DEFAULT_AVATAR}
              style={styles.avatarImage}
              resizeMode="cover"
              defaultSource={DEFAULT_AVATAR}
            />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.fullName}>{userInfo?.fullName}</Text>
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
        <Text style={styles.infoValue}>{userInfo?.email}</Text>
      </View>
    </ScrollView>
  );
};

export default UserProfile;