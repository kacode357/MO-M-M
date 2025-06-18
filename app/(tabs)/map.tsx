import AlertModal from '@/components/AlertModal';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { MAP_CONFIG, MAP_MESSAGES } from '@/constants/MapConstants'; // Import các hằng số mới
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react'; // Thêm useCallback
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

// CẤU HÌNH API KEY
// Đảm bảo rằng biến môi trường này đã được cấu hình đúng trong file .env hoặc app.config.js
// Ví dụ: EXPO_PUBLIC_ORS_API_KEY=your_openrouteservice_api_key

const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY;

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

  const mapRef = useRef<MapView>(null);

  // Hàm tiện ích để hiển thị modal
  const showModal = useCallback((title: string, message: string, isSuccess: boolean = false, onConfirm: () => void = () => setModalVisible(false)) => {
    setModalConfig({ title, message, isSuccess, onConfirm });
    setModalVisible(true);
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          showModal(
            MAP_MESSAGES.LOCATION_PERMISSION_DENIED_TITLE,
            MAP_MESSAGES.LOCATION_PERMISSION_DENIED_MESSAGE,
            false
          );
          setLoading(false);
          return;
        }

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy vị trí:', error);
        showModal(
          MAP_MESSAGES.LOCATION_FETCH_ERROR_TITLE,
          MAP_MESSAGES.LOCATION_FETCH_ERROR_MESSAGE,
          false
        );
        setLoading(false);
      }
    };

    fetchLocation();
  }, [showModal]); // Thêm showModal vào dependency array

  /**
   * Geocoding với OpenStreetMap Nominatim
   * Cần đặt User-Agent hợp lệ.
   */
  const geocodeWithOSM = async (query: string, specificParams: Record<string, string> = {}) => {
    try {
      const latDelta = MAP_CONFIG.LOCATION_DELTA_SEARCH_BOX;
      const lonDelta = MAP_CONFIG.LOCATION_DELTA_SEARCH_BOX;

      const viewbox = location ?
        `${location.longitude - lonDelta},${location.latitude - latDelta},${location.longitude + lonDelta},${location.latitude + latDelta}`
        : undefined;

      const params = {
        q: query,
        format: 'json',
        limit: 1,
        'accept-language': 'vi',
        ...(viewbox && { viewbox: viewbox, bounded: 1 }),
        ...specificParams,
      };

      const response = await axios.get(MAP_CONFIG.NOMINATIM_BASE_URL, {
        params: params,
        headers: {
          'User-Agent': MAP_CONFIG.NOMINATIM_USER_AGENT,
        },
      });

      if (response.data.length > 0) {
        const place = response.data[0];
        console.log('Nominatim result for query:', query, '=>', place.display_name, 'Lat:', place.lat, 'Lon:', place.lon);
        return {
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
          displayName: place.display_name
        };
      } else {
        console.log('No Nominatim result for query:', query, 'Full response data:', response.data);
        return null;
      }
    } catch (err: any) {
      console.error('Lỗi tìm kiếm địa điểm với Nominatim:', err.response?.data || err.message);
      return null;
    }
  };

  /**
   * Lấy tuyến đường từ OpenRouteService
   * Yêu cầu ORS_API_KEY.
   */
  const getRouteFromORS = async (
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number }
  ) => {
    if (!ORS_API_KEY) {
      console.error('OpenRouteService API Key chưa được cấu hình. Vui lòng kiểm tra biến môi trường EXPO_PUBLIC_ORS_API_KEY.');
      showModal(
        MAP_MESSAGES.API_KEY_MISSING_TITLE,
        MAP_MESSAGES.API_KEY_MISSING_MESSAGE,
        false
      );
      return;
    }

    const url = MAP_CONFIG.ORS_DIRECTIONS_BASE_URL;
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

      if (response.data.features && response.data.features.length > 0) {
        const coords = response.data.features[0].geometry.coordinates.map(
          ([lon, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lon,
          })
        );
        setRouteCoords(coords);
        if (mapRef.current && location && destination) {
          mapRef.current.fitToCoordinates([location, destination, ...coords], {
            edgePadding: MAP_CONFIG.MAP_FIT_EDGE_PADDING,
            animated: true,
          });
        }
      } else {
        showModal(
          MAP_MESSAGES.NO_ROUTE_FOUND_TITLE,
          MAP_MESSAGES.NO_ROUTE_FOUND_MESSAGE,
          false
        );
        setRouteCoords([]);
      }
    } catch (error: any) {
      console.error('Lỗi tính toán đường đi:', error.response?.data || error.message);
      let errorMessage = `${MAP_MESSAGES.ROUTE_CALCULATION_ERROR_TITLE}: ${error.message}. Vui lòng thử lại.`;
      if (error.response && error.response.data && error.response.data.error) {
          errorMessage = `${MAP_MESSAGES.ROUTE_CALCULATION_ERROR_TITLE}: ${error.response.data.error.message || error.message}.`;
      }
      showModal(
        MAP_MESSAGES.ROUTE_CALCULATION_ERROR_TITLE,
        errorMessage,
        false
      );
      setRouteCoords([]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showModal(
        MAP_MESSAGES.SEARCH_QUERY_EMPTY_TITLE,
        MAP_MESSAGES.SEARCH_QUERY_EMPTY_MESSAGE,
        false
      );
      return;
    }
    if (!location) {
      showModal(
        MAP_MESSAGES.NO_CURRENT_LOCATION_TITLE,
        MAP_MESSAGES.NO_CURRENT_LOCATION_MESSAGE,
        false
      );
      return;
    }

    Keyboard.dismiss();
    setSearchLoading(true);
    setRouteCoords([]);
    setDestination(null);

    let foundDest = null;

    // Hàm tiện ích để chuẩn hóa chuỗi
    const normalizeString = (str: string) => str.toLowerCase()
      .replace(/phường|p\./gi, 'phường ') // Chuẩn hóa "p." thành "phường "
      .replace(/quận|q\./gi, 'quận ')   // Chuẩn hóa "q." thành "quận "
      .replace(/thành phố hồ chí minh|hồ chí minh|tphcm|hcm/gi, MAP_CONFIG.DEFAULT_CITY.toLowerCase()) // Chuẩn hóa tên thành phố
      .replace(/\s+/g, ' ') // Thay thế nhiều khoảng trắng bằng một khoảng trắng
      .trim();

    const originalQuery = searchQuery.trim();
    // Không normalize originalQuery để giữ nguyên ý định của người dùng cho các search API
    // const normalizedQuery = normalizeString(originalQuery); // Có thể không cần dùng normalizedQuery trực tiếp cho các request API

    // Tách các thành phần của địa chỉ
    const addressParts = originalQuery.split(',').map(part => part.trim());
    let street = '';
    let ward = '';
    let district = '';
    const city = MAP_CONFIG.DEFAULT_CITY;

    // Cố gắng phân tích cú pháp các phần của địa chỉ từ truy vấn gốc
    for (const part of addressParts) {
      const lowerPart = part.toLowerCase();
      if (lowerPart.includes('phường') || lowerPart.includes('p.')) {
        ward = part;
      } else if (lowerPart.includes('quận') || lowerPart.includes('q.')) {
        district = part;
      } else if (!street && (lowerPart.includes('đường') || lowerPart.match(/^\d+/) || lowerPart.match(/\d+\s+[^,]+/))) {
        // Đây có thể là số nhà hoặc tên đường. Cần một logic phức tạp hơn
        // Tạm thời coi đây là phần đầu tiên có thể là tên đường/số nhà nếu chưa có street
        street = part;
      }
    }
    // Nếu chưa có street, và phần đầu tiên của địa chỉ không phải phường/quận, coi đó là street
    if (!street && addressParts.length > 0 && !(addressParts[0].toLowerCase().includes('phường') || addressParts[0].toLowerCase().includes('p.'))) {
        street = addressParts[0];
    }
    // Nếu chỉ có một phần, coi toàn bộ là street
    if (!street && addressParts.length === 1) {
        street = originalQuery;
    }

    console.log(`Parsed parts: Street: "${street}", Ward: "${ward}", District: "${district}"`);

    // Các chiến lược tìm kiếm theo thứ tự ưu tiên
    const searchStrategies = [
        // 1. Truy vấn gốc + ngữ cảnh đầy đủ
        `${originalQuery}, ${city}, ${MAP_CONFIG.DEFAULT_COUNTRY}`,
        // 2. Truy vấn gốc + ngữ cảnh TP. Hồ Chí Minh (biến thể)
        `${originalQuery}, TP. ${city}, ${MAP_CONFIG.DEFAULT_COUNTRY}`,
        // 3. Cố gắng xây dựng địa chỉ với các phần đã phân tích
        (street && ward && district) ? `${street}, ${ward}, ${district}, ${city}, ${MAP_CONFIG.DEFAULT_COUNTRY}` : '',
        (street && district && !ward) ? `${street}, ${district}, ${city}, ${MAP_CONFIG.DEFAULT_COUNTRY}` : '',
        (ward && district) ? `${ward}, ${district}, ${city}, ${MAP_CONFIG.DEFAULT_COUNTRY}` : '',
        // 4. Truy vấn gốc không có thêm ngữ cảnh
        originalQuery,
        // 5. Thử với các từ viết tắt được thay thế (chuyển p./q. thành Phường/Quận)
        originalQuery.replace(/P\.(\d+)/gi, 'Phường $1').replace(/Q\.(\d+)/gi, 'Quận $1'),
        // 6. Thử chỉ tên đường hoặc số nhà (nếu có)
        street,
    ].filter(Boolean); // Lọc bỏ các chuỗi rỗng

    // Thêm các truy vấn bổ sung với các biến thể
    const additionalQueries = [
      `${searchQuery}, ${city}, ${MAP_CONFIG.DEFAULT_COUNTRY}`,
      `${searchQuery}, TP. ${city}, ${MAP_CONFIG.DEFAULT_COUNTRY}`,
      `${searchQuery}, ${MAP_CONFIG.DEFAULT_COUNTRY}`,
    ].filter(q => q.trim() !== '');

    const allSearchQueries = [...new Set([...searchStrategies, ...additionalQueries])]; // Sử dụng Set để loại bỏ trùng lặp

    console.log('Attempting search with queries:', allSearchQueries);

    for (const query of allSearchQueries) {
        if (!query) continue;

        foundDest = await geocodeWithOSM(query);
        if (foundDest) {
            console.log(`Tìm thấy địa điểm với Nominatim cho: "${query}"`);
            break;
        }
    }

    if (foundDest) {
      setDestination(foundDest);
      await getRouteFromORS(location, foundDest);
    } else {
      showModal(
        MAP_MESSAGES.LOCATION_NOT_FOUND_TITLE,
        MAP_MESSAGES.LOCATION_NOT_FOUND_MESSAGE(searchQuery),
        false
      );
    }
    setSearchLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>{MAP_MESSAGES.LOADING_LOCATION}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>{MAP_MESSAGES.MAP_LOAD_ERROR}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true); // Đặt lại loading để thử lại quá trình lấy vị trí
            showModal(
                MAP_MESSAGES.RETRY_BUTTON_TEXT, // Title cho modal thử lại
                MAP_MESSAGES.RETRY_PROMPT,
                false,
                () => { // Callback để ẩn modal và thử lại
                    setModalVisible(false);
                    // Có thể gọi lại fetchLocation ở đây, nhưng tốt hơn là reload toàn bộ ứng dụng hoặc
                    // hướng dẫn người dùng cấp quyền
                    // For simplicity, we just set loading to true to re-trigger useEffect on next render
                }
            );
          }}
        >
          <Text style={styles.retryButtonText}>{MAP_MESSAGES.RETRY_BUTTON_TEXT}</Text>
        </TouchableOpacity>
        <AlertModal
          visible={modalVisible}
          title={modalConfig.title}
          message={modalConfig.message}
          isSuccess={modalConfig.isSuccess}
          showCancel={false}
          confirmText={MAP_MESSAGES.CONFIRM_BUTTON_TEXT}
          onConfirm={modalConfig.onConfirm}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: MAP_CONFIG.MAP_INITIAL_LATITUDE_DELTA,
          longitudeDelta: MAP_CONFIG.MAP_INITIAL_LONGITUDE_DELTA,
        }}
      >
        <Marker
          coordinate={location}
          title={MAP_MESSAGES.YOUR_LOCATION_MARKER_TITLE}
          pinColor={Colors.light.primaryText}
        />
        {destination && (
          <Marker
            coordinate={destination}
            title={MAP_MESSAGES.DESTINATION_MARKER_TITLE}
            pinColor={Colors.light.success}
          />
        )}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={MAP_CONFIG.ROUTE_STROKE_WIDTH}
            strokeColor={Colors.light.tint}
          />
        )}
      </MapView>

      <View style={styles.searchBox}>
        <TextInput
          placeholder={`${MAP_MESSAGES.SEARCH_PLACEHOLDER}`}
          placeholderTextColor={Colors.light.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.input}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>{MAP_MESSAGES.SEARCH_BUTTON_TEXT}</Text>
        </TouchableOpacity>
      </View>

      {searchLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.whiteText} />
            <Text style={styles.loadingSearchText}>{MAP_MESSAGES.SEARCHING}</Text>
          </View>
        </View>
      )}

      <AlertModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        isSuccess={modalConfig.isSuccess}
        showCancel={false}
        confirmText={MAP_MESSAGES.CONFIRM_BUTTON_TEXT}
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
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.light.tint,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.light.whiteText,
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 16,
  },
});

export default MapScreen;