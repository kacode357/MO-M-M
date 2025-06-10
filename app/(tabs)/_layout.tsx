import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme].tabIconSelected,
            tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: Platform.select({
              ios: {
                position: 'absolute',
                backgroundColor: 'transparent',
                borderTopWidth: 0,
                height: 90,
                paddingBottom: 10,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
              },
              android: {
                backgroundColor: Colors[colorScheme].tabBackground,
                borderTopWidth: 0,
                height: 55,
                paddingBottom: 16,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
              },
            }),
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            tabBarIconStyle: {
              marginBottom: -1,
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Trang chủ',
              tabBarIcon: ({ color, focused }) => (
                <Entypo
                  name="home"
                  size={26}
                  color={focused ? Colors[colorScheme].tabIconSelected : Colors[colorScheme].tabIconDefault}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="community"
            options={{
              title: 'Cộng đồng',
              tabBarIcon: ({ color, focused }) => (
                <AntDesign
                  name="heart"
                  size={26}
                  color={focused ? Colors[colorScheme].tabIconSelected : Colors[colorScheme].tabIconDefault}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="help"
            options={{
              title: 'Trợ giúp',
              tabBarIcon: ({ color, focused }) => (
                <FontAwesome5
                  name="headset"
                  size={26}
                  color={focused ? Colors[colorScheme].tabIconSelected : Colors[colorScheme].tabIconDefault}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="user"
            options={{
              title: 'Của tôi',
              tabBarIcon: ({ color, focused }) => (
                <FontAwesome
                  name="user"
                  size={26}
                  color={focused ? Colors[colorScheme].tabIconSelected : Colors[colorScheme].tabIconDefault}
                />
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});