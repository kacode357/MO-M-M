import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router'; // Import useRouter
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LANGUAGE_KEY = 'appLanguage';

const LanguageSettings = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const [activeLanguage, setActiveLanguage] = useState<string>('vi');
  const router = useRouter(); // Khởi tạo router

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (storedLanguage) {
          setActiveLanguage(storedLanguage);
        }
      } catch (error) {
        console.error("Failed to load language from AsyncStorage", error);
      }
    };
    loadLanguage();
  }, []);

  const handleLanguageSelect = async (lang: string) => {
    if (lang === 'en') {
      return; 
    }
    setActiveLanguage(lang);
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch (error) {
      console.error("Failed to save language to AsyncStorage", error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 0.5,
      borderBottomColor: Colors[colorScheme].icon,
      marginTop: 40,
    },
    backButton: {
      marginRight: 15,
    },
    headerTitle: {
      fontFamily: Fonts.Comfortaa.Bold,
      fontSize: 20,
      color: Colors[colorScheme].text,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 0.5,
      borderBottomColor: Colors[colorScheme].icon,
    },
    rowText: {
      fontFamily: Fonts.Comfortaa.Regular,
      fontSize: 16,
      color: Colors[colorScheme].text,
    },
    disabledRowText: {
        color: Colors[colorScheme].grayBackground,
    },
    activeIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: Colors[colorScheme].primaryText,
      marginRight: 10,
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt ngôn ngữ</Text> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity 
          style={styles.row} 
          onPress={() => handleLanguageSelect('vi')}
        >
          <View style={styles.rowContent}>
              {activeLanguage === 'vi' && <View style={styles.activeIndicator} />}
              <Text style={styles.rowText}>Tiếng Việt</Text>
          </View>
          {activeLanguage === 'vi' && (
            <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme].primaryText} />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.row} 
          onPress={() => handleLanguageSelect('en')}
          disabled={true} 
        >
          <View style={styles.rowContent}>
              {activeLanguage === 'en' && <View style={styles.activeIndicator} />}
              <Text style={[styles.rowText, activeLanguage !== 'en' && styles.disabledRowText]}>English</Text>
          </View>
          {activeLanguage === 'en' && (
            <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme].primaryText} />
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default LanguageSettings;