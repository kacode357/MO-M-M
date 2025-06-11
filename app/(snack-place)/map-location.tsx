import AlertModal from '@/components/AlertModal';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

// API Key (Note: Consider moving to environment variables for security)
const ORS_API_KEY = '5b3ce3597851110001cf6248c89e354a30184841becfff9d2f7b69a4';

const MapScreen = () => {
  const { address } = useLocalSearchParams();
  console.log('Address from params:', address);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
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

  useEffect(() => {
    if (location && typeof address === 'string' && address.trim()) {
      handleSearch(address);
    }
  }, [location, address]);

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

  const handleSearch = async (query: string) => {
    if (!query.trim() || !location) return;

    setSearchLoading(true);
    const dest = await geocodeWithOSM(query);
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
            title="Quán ăn"
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

      <TouchableOpacity style={styles.backButton} onPress={router.back}>
        <Ionicons name="arrow-back" size={24} color={Colors.light.whiteText} />
      </TouchableOpacity>

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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.26)',
    borderRadius: 35,
    padding: 8,
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