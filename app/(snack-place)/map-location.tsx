import AlertModal from '@/components/AlertModal';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react'; // Import useRef
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

// CẤU HÌNH API KEY
// RẤT QUAN TRỌNG: Hãy di chuyển ORS_API_KEY này vào biến môi trường (ví dụ: .env, app.config.js)
// để đảm bảo bảo mật, thay vì để cứng trong mã nguồn.
// Ví dụ: const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY;
const ORS_API_KEY = '5b3ce3597851110001cf6248c89e354a30184841becfff9d2f7b69a4'; // KHUYÊN KHÔNG NÊN ĐỂ TRỰC TIẾP THẾ NÀY

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

  const mapRef = useRef<MapView>(null); // Thêm ref cho MapView để dùng fitToCoordinates

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setModalConfig({
            title: 'Lỗi',
            message: 'Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền trong cài đặt ứng dụng.',
            isSuccess: false,
            onConfirm: () => {
                setModalVisible(false);
                router.back(); // Quay lại màn hình trước nếu quyền bị từ chối
            },
          });
          setModalVisible(true);
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
        setModalConfig({
          title: 'Lỗi',
          message: 'Không thể lấy vị trí hiện tại. Vui lòng kiểm tra cài đặt GPS và thử lại.',
          isSuccess: false,
          onConfirm: () => {
              setModalVisible(false);
              router.back(); // Quay lại màn hình trước nếu lỗi
          },
        });
        setModalVisible(true);
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  // Effect để tìm kiếm địa chỉ khi có vị trí và địa chỉ từ params
  useEffect(() => {
    if (location && typeof address === 'string' && address.trim()) {
      handleSearch(address);
    }
  }, [location, address]);

  /**
   * Geocoding với OpenStreetMap Nominatim
   * Cần đặt User-Agent hợp lệ.
   */
  const geocodeWithOSM = async (query: string, specificParams: Record<string, string> = {}) => {
    try {
      // Tính toán viewbox dựa trên vị trí hiện tại để ưu tiên kết quả gần đó
      const latDelta = 0.1;
      const lonDelta = 0.1;

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

      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: params,
        headers: {
          'User-Agent': 'ReactNativeMapApp/1.0 (luukaka2211@gmail.com)', // Thay thế bằng email của bạn
        },
      });

      if (response.data.length > 0) {
        const place = response.data[0];
        console.log('Nominatim result for query:', query, '=>', place.display_name, 'Lat:', place.lat, 'Lon:', place.lon);
        return {
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
          displayName: place.display_name // TRẢ VỀ TÊN HIỂN THỊ ĐỂ KIỂM TRA ĐỘ KHỚP
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
      setModalConfig({
        title: 'Lỗi API Key',
        message: 'OpenRouteService API Key chưa được cấu hình. Vui lòng kiểm tra biến môi trường.',
        isSuccess: false,
        onConfirm: () => setModalVisible(false),
      });
      setModalVisible(true);
      return;
    }

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

      if (response.data.features && response.data.features.length > 0) {
        const coords = response.data.features[0].geometry.coordinates.map(
          ([lon, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lon,
          })
        );
        setRouteCoords(coords);
        // Fit bản đồ để hiển thị toàn bộ tuyến đường
        if (mapRef.current && location && destination) {
            mapRef.current.fitToCoordinates([location, destination, ...coords], {
                edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
      } else {
        setModalConfig({
          title: 'Không có tuyến đường',
          message: 'Không thể tìm thấy tuyến đường giữa hai điểm này. Có thể do địa điểm không khả dụng cho định tuyến.',
          isSuccess: false,
          onConfirm: () => setModalVisible(false),
        });
        setModalVisible(true);
        setRouteCoords([]);
      }
    } catch (error: any) {
      console.error('Lỗi tính toán đường đi:', error.response?.data || error.message);
      let errorMessage = `Có lỗi khi tính toán đường đi: ${error.message}. Vui lòng thử lại.`;
      if (error.response && error.response.data && error.response.data.error) {
          errorMessage = `Lỗi tuyến đường: ${error.response.data.error.message || error.message}.`;
      }
      setModalConfig({
        title: 'Lỗi tuyến đường',
        message: errorMessage,
        isSuccess: false,
        onConfirm: () => setModalVisible(false),
      });
      setModalVisible(true);
      setRouteCoords([]);
    }
  };

  // Hàm parseAddress đã tối ưu
  const parseAddress = (query: string) => {
    let street = '';
    let ward = '';
    let district = '';
    let city = 'Hồ Chí Minh'; // Mặc định thành phố
    let houseNumber = '';

    let cleanQuery = query.toLowerCase()
        .replace(/phường/g, 'p.')
        .replace(/quận/g, 'q.')
        .replace(/thành phố/g, 'tp.')
        .replace(/số\s*/, '')
        .trim();

    const houseNumberMatch = cleanQuery.match(/^(\d+)([a-zA-Z]?)\s*(.*)/);
    if (houseNumberMatch) {
        houseNumber = houseNumberMatch[1] + (houseNumberMatch[2] || '');
        cleanQuery = houseNumberMatch[3].trim();
    }

    const parts = cleanQuery.split(',').map(p => p.trim()).filter(Boolean);

    for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i];
        if (part.startsWith('p.') || part.startsWith('phuong')) {
            ward = part;
            parts.splice(i, 1);
        } else if (part.startsWith('q.') || part.startsWith('quan')) {
            district = part;
            parts.splice(i, 1);
        } else if (part.includes('ho chi minh') || part.includes('hcm') || part.includes('tphcm')) {
            city = part;
            parts.splice(i, 1);
        }
    }

    street = parts.join(', ').trim();

    if (houseNumber) {
        street = `${houseNumber} ${street}`;
    }
    
    return { street, ward, district, city, houseNumber };
  };

  const handleSearch = async (query: string) => {
    if (!query.trim() || !location) {
      setModalConfig({
        title: 'Lỗi tìm kiếm',
        message: 'Vui lòng nhập địa điểm cần tìm hoặc không có vị trí hiện tại của bạn.',
        isSuccess: false,
        onConfirm: () => setModalVisible(false),
      });
      setModalVisible(true);
      return;
    }

    setSearchLoading(true);
    setRouteCoords([]);
    setDestination(null);

    let foundDest = null;
    const { street, ward, district, city, houseNumber } = parseAddress(query);

    console.log(`Parsed parts: House: "${houseNumber}", Street: "${street}", Ward: "${ward}", District: "${district}", City: "${city}"`);

    const searchStrategies = [
        // 1. Full query gốc
        query,
        // 2. Full query gốc với các từ viết tắt được chuẩn hóa
        query.replace(/P\.(\d+)/gi, 'Phường $1').replace(/Q\.(\d+)/gi, 'Quận $1'),
        // 3. Chuẩn hóa địa chỉ và thêm ngữ cảnh thành phố/quốc gia
        (street || houseNumber) && ward && district ? `${houseNumber ? houseNumber + ' ' : ''}${street}, ${ward.replace(/p\./i, 'Phường ')}, ${district.replace(/q\./i, 'Quận ')}, ${city}, Việt Nam` : '',
        // 4. Chỉ đường, phường, quận, thành phố (bỏ số nhà nếu có)
        street && ward && district ? `${street}, ${ward.replace(/p\./i, 'Phường ')}, ${district.replace(/q\./i, 'Quận ')}, ${city}, Việt Nam` : '',
        // 5. Chỉ đường, quận, thành phố (nếu không có phường)
        street && district && !ward ? `${street}, ${district.replace(/q\./i, 'Quận ')}, ${city}, Việt Nam` : '',
        // 6. Chỉ phường, quận, thành phố
        ward && district ? `${ward.replace(/p\./i, 'Phường ')}, ${district.replace(/q\./i, 'Quận ')}, ${city}, Việt Nam` : '',
        // 7. Chỉ tên đường và thành phố (hữu ích nếu địa chỉ không cụ thể)
        street ? `${street}, ${city}, Việt Nam` : '',
        // 8. Chỉ tên đường (cuối cùng, nếu tất cả thất bại)
        street,
        // 9. Chỉ quận và thành phố
        district ? `${district.replace(/q\./i, 'Quận ')}, ${city}, Việt Nam` : '',
        // 10. Chỉ thành phố (để tìm ra trung tâm thành phố nếu không có gì khác được tìm thấy)
        city ? `${city}, Việt Nam` : '',
    ].filter(Boolean);

    const uniqueQueries = [...new Set(searchStrategies)];

    console.log('Attempting search with queries:', uniqueQueries);

    for (const q of uniqueQueries) { // Đổi tên biến để tránh trùng lặp với tham số hàm
        if (!q) continue;

        foundDest = await geocodeWithOSM(q);
        if (foundDest) {
            // Kiểm tra độ khớp đơn giản
            const queryWords = query.toLowerCase().split(/\s*,\s*|\s+/).filter(Boolean);
            const foundNameWords = foundDest.displayName.toLowerCase().split(/\s*,\s*|\s+/).filter(Boolean);
            
            const matchScore = queryWords.filter(word => foundNameWords.includes(word)).length;
            const threshold = Math.max(1, Math.floor(queryWords.length / 2)); 

            if (matchScore >= threshold) {
                break;
            } else {
                console.log(`Kết quả cho "${q}" (${foundDest.displayName}) không đủ khớp, tiếp tục tìm kiếm.`);
                foundDest = null; // Reset để thử query tiếp theo
            }
        }
    }

    if (foundDest) {
      setDestination(foundDest);
      await getRouteFromORS(location, foundDest);
    } else {
      setModalConfig({
        title: 'Không tìm thấy',
        message: `Không tìm thấy địa điểm "${query}". Vui lòng thử một tên khác, cụ thể hơn hoặc kiểm tra chính tả. Nominatim có thể không hỗ trợ đầy đủ các địa chỉ chi tiết ở Việt Nam.`,
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
        ref={mapRef} 
        style={styles.map}
        initialRegion={{
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