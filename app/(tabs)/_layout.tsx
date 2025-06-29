import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'; // For map tab icon
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
         
            {/* Map tab for navigation to map.tsx route */}
          <Tabs.Screen
            name="map"
            options={{
              title: 'Bản đồ',
              tabBarIcon: ({ color, focused }) => (
                <MaterialIcons
                  name="map"
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