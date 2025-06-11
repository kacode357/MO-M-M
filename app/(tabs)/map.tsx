import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// Note: Add to app.json for iOS and Android:
// {
//   "expo": {
//     "ios": {
//       "infoPlist": {
//         "NSLocationWhenInUseUsageDescription": "Ứng dụng cần quyền truy cập vị trí để hiển thị vị trí hiện tại của bạn."
//       }
//     },
//     "android": {
//       "permissions": ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"]
//     }
//   }
// }

const Map = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Optional: State for address
  // const [address, setAddress] = useState<string | null>(null);

  const fetchLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    // setAddress(null);
    try {
      // Request foreground location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Quyền truy cập vị trí bị từ chối');
        setLoading(false);
        return;
      }

      // Get current position
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      // Optional: Reverse geocode to get address
      /*
      const geocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setAddress(geocode[0]?.formattedAddress || 'Không tìm thấy địa chỉ');
      */
    } catch (error) {
      setErrorMsg('Không thể lấy vị trí. Vui lòng thử lại.');
      console.error('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        <Text style={[styles.text, { color: Colors[colorScheme].text }]}>Đang tải vị trí...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: Colors[colorScheme].text }]}>{errorMsg}</Text>
        <Button title="Thử lại" onPress={fetchLocation} color={Colors[colorScheme].tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location!.latitude,
          longitude: location!.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        <Marker
          coordinate={{
            latitude: location!.latitude,
            longitude: location!.longitude,
          }}
          title="Vị trí của bạn"
        />
      </MapView>
      <View style={styles.infoContainer}>
        <Text style={[styles.text, { color: Colors[colorScheme].text }]}>Vị trí hiện tại:</Text>
        <Text style={[styles.text, { color: Colors[colorScheme].text }]}>
          Kinh độ: {location!.longitude.toFixed(6)}
        </Text>
        <Text style={[styles.text, { color: Colors[colorScheme].text }]}>
          Vĩ độ: {location!.latitude.toFixed(6)}
        </Text>
        {/* Optional: Display address */}
        {/* {address && <Text style={[styles.text, { color: Colors[colorScheme].text }]}>Địa chỉ: {address}</Text>} */}
        <Button title="Làm mới" onPress={fetchLocation} color={Colors[colorScheme].tint} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  map: {
    flex: 0.6,
  },
  infoContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default Map;