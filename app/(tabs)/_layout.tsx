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
            tabBarActiveTintColor: Colors[colorScheme].tabIconSelected, // #FFE001 for active tab
            tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault, // #FFFFFF for inactive tab
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: Platform.select({
              ios: {
                position: 'absolute',
                backgroundColor: 'transparent', // Transparency for blur effect
                borderTopWidth: 0, // No top border
                height: 90, // Increased height to accommodate icons
                paddingBottom: 10, // Padding for home indicator
                borderTopLeftRadius: 10, // Round top-left corner
                borderTopRightRadius: 10, // Round top-right corner
              },
              android: {
                backgroundColor: Colors[colorScheme].tabBackground, // Keep original color
                borderTopWidth: 0,
                height: 55, // Adjusted height for Android
                paddingBottom: 16, // Increased padding to avoid navigation bar
               
                borderTopLeftRadius: 10, // Round top-left corner
                borderTopRightRadius: 10, // Round top-right corner
             
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
            name="map"
            options={{
              title: 'Bản đồ',
              tabBarIcon: ({ color, focused }) => (
                <Entypo
                  name="map"
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
    backgroundColor: '#FFFFFF', // White background for container
  },
  tabContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background for tab area
  },
});