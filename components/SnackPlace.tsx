import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { searchSnackPlaces } from '@/services/snackplace.services';
import { Image } from 'expo-image';
import { router } from 'expo-router'; // Thêm import này
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SnackPlaceData {
  snackPlaceId: string;
  placeName: string;
  address: string;
  mainDish: string;
  averagePrice: number;
  openingHour: string;
  businessModelName: string;
  image: string;
}

const SnackPlace = () => {
  const [snackPlaces, setSnackPlaces] = useState<SnackPlaceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const pageSize = 10;

  const fetchSnackPlaces = async (page: number, reset: boolean = false) => {
    if (!hasMore && !reset) return;
    if (isFetchingMore && !reset) return;

    setIsFetchingMore(true);
    if (reset) setLoading(true);

    try {
      const params = {
        pageNum: page,
        pageSize,
        searchKeyword: '',
        status: true,
      };
      const response = await searchSnackPlaces(params);
      console.log('Search response:', response);
      if (response.status === 200 && Array.isArray(response.data.pageData)) {
        const newData = response.data.pageData;
        setSnackPlaces((prev) => (reset ? newData : [...prev, ...newData]));
        setHasMore(newData.length === pageSize);
      } else {
        setSnackPlaces(reset ? [] : snackPlaces);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error searching snack places:', error);
      setSnackPlaces(reset ? [] : snackPlaces);
      setHasMore(false);
    } finally {
      setIsFetchingMore(false);
      if (reset) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnackPlaces(1, true);
  }, []);

  const loadMore = () => {
    if (!hasMore || isFetchingMore) return;
    const nextPage = pageNum + 1;
    setPageNum(nextPage);
    fetchSnackPlaces(nextPage);
  };

  const formatTime = (time: string) => {
    const [hourStr, minute] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? 'tối' : 'sáng';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}h${minute} ${period}`;
  };

  const renderItem = ({ item }: { item: SnackPlaceData }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/(snack-place)/snack-place-detail', params: { snackPlaceId: item.snackPlaceId } })} // Sử dụng router.push
    >
      <ThemedView style={styles.card}>
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          onError={() => console.log(`Failed to load image for ${item.placeName}`)}
        />
        <ThemedView style={styles.cardContent}>
          <ThemedText style={styles.cardTitle}>{item.placeName}</ThemedText>
          <ThemedText style={styles.cardDetail}>
            <ThemedText style={styles.label}>Giờ mở cửa: </ThemedText>
            {formatTime(item.openingHour)}
          </ThemedText>
          <ThemedText style={styles.cardDetail}>
            <ThemedText style={styles.label}>Giá trung bình: </ThemedText>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.averagePrice)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View style={styles.footer}>
        <ThemedText style={styles.loadingMoreText}>Đang tải thêm...</ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <ThemedText style={styles.loadingText}>Đang tải dữ liệu...</ThemedText>
      ) : snackPlaces.length === 0 ? (
        <ThemedText style={styles.emptyText}>Không tìm thấy quán ăn nào.</ThemedText>
      ) : (
        <FlatList
          data={snackPlaces}
          renderItem={renderItem}
          keyExtractor={(item) => item.snackPlaceId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingVertical: 10,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 8,
  },
  cardDetail: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 4,
  },
  label: {
    fontFamily: Fonts.Comfortaa.Bold,
    color: Colors.light.icon,
  },
  loadingText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.icon,
  },
});

export default SnackPlace;