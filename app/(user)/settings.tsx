import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Settings = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  const handleLogout = () => {
    console.log("User logged out");
    const clearAsyncStorage = async () => {
      await AsyncStorage.clear();
    };
    clearAsyncStorage();
    router.push('/(tabs)'); 
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    sectionTitle: {
      fontFamily: Fonts.Baloo2.Regular,
      fontSize: 14,
      color: Colors[colorScheme].text,
      paddingHorizontal: 20,
      paddingVertical: 5,
      borderBottomColor: Colors[colorScheme].icon,
      backgroundColor: Colors[colorScheme].grayBackground,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: Colors[colorScheme].icon,
    },
    rowText: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    logoutText: {
      fontFamily: Fonts.Comfortaa.Medium,
      fontSize: 16,
      color: Colors[colorScheme].primaryText || "#FF0000", 
      textAlign: "center",
      paddingVertical: 20,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      <Text style={styles.sectionTitle}>Tài khoản</Text>
      <TouchableOpacity 
        style={styles.row} 
        onPress={() => router.push('/(user)/personal-info')}
      >
        <Text style={styles.rowText}>Thông tin cá nhân</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].text} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.row}
        onPress={() => router.push('/(user)/change-password')}
      >
        <Text style={styles.rowText}>Đổi mật khẩu</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowText}>Địa Chỉ</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].text} />

      </TouchableOpacity>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowText}>Tài khoản / Thẻ Ngân hàng</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].text} />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Cài đặt</Text>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowText}>Cài đặt Chat</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowText}>Cài đặt Thông báo</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowText}>Cài đặt riêng tư</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowText}>Nguồn ngữ / Language</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].text} />
      </TouchableOpacity>
      <View style={styles.row}>
        <Text style={styles.rowText}>Tiếng Việt</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].text} />
      </View>

      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Settings;