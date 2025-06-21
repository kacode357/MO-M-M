import AlertModal from '@/components/AlertModal';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import uuid from 'react-native-uuid';

// --- CÁC HẰNG SỐ ---
const ORS_API_KEY = '5b3ce3597851110001cf6248c89e354a30184841becfff9d2f7b69a4';
const OPENMAP_API_KEY = 'kKuOnsjlYksE6rRQ2gk2pzGhky4jivXk';
const OPENMAP_BASE_URL = 'https://mapapis.openmap.vn/v1';

const DEFAULT_REGION = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const MapScreen = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);

  const mapRef = useRef<MapView>(null);
  const searchInputRef = useRef<TextInput>(null);

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
    setSessionToken(uuid.v4() as string);
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permission to access location was denied');
          return;
        }
        const { coords } = await Location.getCurrentPositionAsync({});
        const userLocation = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        setLocation(userLocation);
        centerOnUser(userLocation);
      } catch (error) {
        console.error('Error fetching location: ', error);
      }
    };
    fetchLocation();
  }, []);

  const centerOnUser = (loc?: { latitude: number; longitude: number } | null) => {
    const targetLocation = loc || location;
    if (targetLocation && mapRef.current) {
        mapRef.current.animateToRegion({
            ...targetLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 1000);
    }
  };

  const fetchAutocomplete = async (input: string) => {
    if (!input.trim()) return;
    Keyboard.dismiss();
    setSearchLoading(true);
    setPredictions([]);
    try {
      const apiParams = {
        'apikey': OPENMAP_API_KEY,
        input: input,
        sessiontoken: sessionToken,
      };
      const response = await axios.get(`${OPENMAP_BASE_URL}/autocomplete`, { params: apiParams });
      if (response.data.status === 'OK') {
        setPredictions(response.data.predictions);
      } else {
        setPredictions([]);
      }
    } catch (err) {
      console.error('Autocomplete API error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const getPlaceDetails = async (placeId: string) => {
    if (!sessionToken) return null;
    setSearchLoading(true);
    try {
      const response = await axios.get(`${OPENMAP_BASE_URL}/place`, {
        params: {
          'apikey': OPENMAP_API_KEY,
          ids: placeId,
          sessiontoken: sessionToken,
        },
      });
      if (response.data.features && response.data.features.length > 0) {
        const coords = response.data.features[0].geometry.coordinates;
        return { latitude: coords[1], longitude: coords[0] };
      }
      return null;
    } catch (err) {
      console.error('Place Details API error:', err);
      return null;
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchPress = () => {
    fetchAutocomplete(searchQuery);
  };
  
  // CẬP NHẬT: Thêm logic zoom vào hàm này
  const handleSuggestionPress = async (prediction: any) => {
    setPredictions([]);
    setSearchQuery(prediction.description);
    const dest = await getPlaceDetails(prediction.place_id);
    if (dest && location) {
      setDestination(dest);
      await getRouteFromORS(location, dest);

      // THÊM MỚI: Tự động zoom để hiển thị cả điểm đầu và điểm cuối
      if (mapRef.current) {
        mapRef.current.fitToCoordinates([location, dest], {
          edgePadding: {
            top: 150, // Tăng padding trên để không bị che bởi thanh tìm kiếm
            right: 50,
            bottom: 50,
            left: 50,
          },
          animated: true,
        });
      }

    } else {
        console.warn('Could not get destination details or user location is missing.');
    }
  };
  
  const getRouteFromORS = async (start: any, end: any) => {
    setIsRouting(true);
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
        ([lon, lat]: [number, number]) => ({ latitude: lat, longitude: lon })
      );
      setRouteCoords(coords);
    } catch (error) {
        console.error('Error fetching route from ORS:', error);
    } finally {
        setIsRouting(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {destination && ( 
          <Marker 
            coordinate={destination} 
            title="Điểm đến" 
            pinColor={Colors.light.tint}
          /> 
        )}
        {routeCoords.length > 0 && ( 
          <Polyline 
            coordinates={routeCoords} 
            strokeColor={Colors.light.primaryText} 
            strokeWidth={4} 
          /> 
        )}
      </MapView>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <TextInput
            ref={searchInputRef}
            placeholder="Nhập địa điểm..."
            placeholderTextColor={Colors.light.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.input}
            onFocus={() => {
              setRouteCoords([]);
              setDestination(null);
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={22} color={Colors.light.icon} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
            <Text style={styles.searchButtonText}>Tìm</Text>
          </TouchableOpacity>
        </View>

        {searchLoading && <ActivityIndicator style={{ marginTop: 10 }} size="small" color={Colors.light.tint} />}
        {predictions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={predictions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSuggestionPress(item)}>
                  <Text style={styles.suggestionMainText}>{item.structured_formatting.main_text}</Text>
                  <Text style={styles.suggestionSecondaryText}>{item.structured_formatting.secondary_text}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setPredictions([])}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {location && (
        <TouchableOpacity style={styles.locationButton} onPress={() => centerOnUser()}>
            <MaterialIcons name="my-location" size={24} color={Colors.light.primaryText} />
        </TouchableOpacity>
      )}

      <AlertModal visible={modalVisible} {...modalConfig} />
      
      {isRouting && (
        <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.light.whiteText} />
            <Text style={styles.loadingText}>Đang tìm đường...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 15,
    right: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 8,
    shadowColor: Colors.light.blackText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: Colors.light.text,
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  searchButton: {
    backgroundColor: Colors.light.primaryText,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  searchButtonText: {
    color: Colors.light.whiteText,
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 16,
  },
  suggestionsContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginTop: 8,
    elevation: 8,
    maxHeight: 350,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.grayBackground,
  },
  suggestionMainText: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 15,
  },
  suggestionSecondaryText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 13,
    color: Colors.light.icon,
  },
  closeButton: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: Colors.light.grayBackground,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  closeButtonText: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 16,
    color: Colors.light.primaryText
  },
  locationButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: Colors.light.background,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.light.blackText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.light.whiteText,
    fontSize: 18,
    fontFamily: Fonts.Comfortaa.Bold,
  },
});

export default MapScreen;