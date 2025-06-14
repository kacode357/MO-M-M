import AlertModal from '@/components/AlertModal';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

// API Key (Note: Consider moving to environment variables for security)
const ORS_API_KEY = '5b3ce3597851110001cf6248c89e354a30184841becfff9d2f7b69a4';

const MapScreen = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    isSuccess: boolean;
    onConfirm: () => void;
  }>({
    title: '',
    message: '',
    isSuccess: false,
    onConfirm: () => setModalVisible(false),
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setModalConfig({
            title: 'Lỗi',
            message: 'Quyền truy cập vị trí bị từ chối',
            isSuccess: false,
            onConfirm: () => setModalVisible(false),
          });
          setModalVisible(true);
          return;
        }

        const { coords } = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy vị trí:', error);
        setModalConfig({
          title: 'Lỗi',
          message: 'Không thể lấy vị trí hiện tại',
          isSuccess: false,
          onConfirm: () => setModalVisible(false),
        });
        setModalVisible(true);
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  const geocodeWithOSM = async (query: string) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: 1,
        },
        headers: {
          'Accept-Language': 'vi',
          'User-Agent': 'ReactNativeApp/1.0 (luukaka2211@gmail.com)',
        },
      });

      if (response.data.length > 0) {
        const place = response.data[0];
        return {
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
        };
      }
      return null;
    } catch (err: any) {
      console.error('Lỗi tìm kiếm địa điểm:', err.response?.data || err.message);
      return null;
    }
  };

  const getRouteFromORS = async (
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number }
  ) => {
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
    const body = {
      coordinates: [
        [start.longitude, start.latitude],
        [end.longitude, end.latitude],
      ],
    };

    try {
      const response = await axios.post(url, body, {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      const coords = response.data.features[0].geometry.coordinates.map(
        ([lon, lat]: [number, number]) => ({
          latitude: lat,
          longitude: lon,
        })
      );
      setRouteCoords(coords);
    } catch (error: any) {
      console.error('Lỗi tính toán đường đi:', error.response?.data || error.message);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !location) return;

    Keyboard.dismiss();
    setSearchLoading(true);
    const dest = await geocodeWithOSM(searchQuery);
    if (dest) {
      setDestination(dest);
      await getRouteFromORS(location, dest);
    } else {
      setModalConfig({
        title: 'Thông báo',
        message: 'Không tìm thấy địa điểm',
        isSuccess: false,
        onConfirm: () => setModalVisible(false),
      });
      setModalVisible(true);
    }
    setSearchLoading(false);
  };

  if (loading || !location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Đang tải vị trí...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={location}
          title="Vị trí của bạn"
          pinColor={Colors.light.primaryText}
        />
        {destination && (
          <Marker
            coordinate={destination}
            title="Điểm đến"
            pinColor={Colors.light.success}
          />
        )}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={5}
            strokeColor={Colors.light.tint}
          />
        )}
      </MapView>

      <View style={styles.searchBox}>
        <TextInput
          placeholder="Nhập địa điểm (ví dụ: Hồ Gươm)"
          placeholderTextColor={Colors.light.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.input}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {searchLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.whiteText} />
            <Text style={styles.loadingSearchText}>Đang tìm kiếm...</Text>
          </View>
        </View>
      )}

      <AlertModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        isSuccess={modalConfig.isSuccess}
        showCancel={false}
        confirmText="OK"
        onConfirm={modalConfig.onConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  map: {
    flex: 1,
  },
  searchBox: {
    position: 'absolute',
    top: 50,
    left: 15,
    right: 15,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
    elevation: 8,
    shadowColor: Colors.light.blackText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.grayBackground,
    color: Colors.light.text,
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: Colors.light.primaryText,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  searchButtonText: {
    color: Colors.light.whiteText,
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.light.text,
    fontFamily: Fonts.Comfortaa.Medium,
    fontSize: 18,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: Colors.light.primaryText,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingSearchText: {
    marginTop: 10,
    color: Colors.light.whiteText,
    fontFamily: Fonts.Comfortaa.SemiBold,
    fontSize: 20,
  },
});

export default MapScreen;