import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { recordSnackPlaceClick, searchSnackPlaces } from '@/services/snackplace.services';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, TextStyle, TouchableOpacity, View } from 'react-native';

interface PremiumPackage {
  isActive: boolean;
  packageId: number;
  packageName: string;
  purchaseDate: string;
}

interface SnackPlaceData {
  snackPlaceId: string;
  placeName: string;
  address: string;
  mainDish: string;
  averagePrice: number;
  openingHour: string;
  businessModelName: string;
  image: string;
  premiumPackage?: PremiumPackage;
}

interface SearchProps {
  onSearchStateChange: (isSearching: boolean) => void;
}

const Search = ({ onSearchStateChange }: SearchProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [snackPlaces, setSnackPlaces] = useState<SnackPlaceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const pageSize = 10;

  const handleFilterPress = () => {
    router.push('/filter');
  };

  const handleClear = () => {
    setSearchQuery('');
    setSnackPlaces([]);
    setPageNum(1);
    setHasMore(true);
    setHasSearched(false);
    onSearchStateChange(false);
  };

  const fetchSnackPlaces = async (page: number, reset: boolean = false) => {
    if (!hasMore && !reset) return;
    if (isFetchingMore && !reset) return;

    setIsFetchingMore(true);
    if (reset) setLoading(true);

    try {
      const params = {
        pageNum: page,
        pageSize,
        searchKeyword: searchQuery.trim(),
        status: true,
      };
      const response = await searchSnackPlaces(params);

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setHasSearched(true);
      onSearchStateChange(true);
      setLoading(true);
      fetchSnackPlaces(1, true);
    }
  };

  const loadMore = () => {
    if (!hasMore || isFetchingMore || !searchQuery.trim()) return;
    const nextPage = pageNum + 1;
    setPageNum(nextPage);
    fetchSnackPlaces(nextPage);
  };

  const formatTime = (time: string): string => {
    if (!time || !/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return 'Không xác định';
    }

    try {
      const [hourStr, minuteStr] = time.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return 'Không xác định';
      }

      let period: string;
      let displayHour: number;

      if (hour >= 0 && hour < 12) {
        period = 'sáng';
        displayHour = hour === 0 ? 12 : hour;
      } else if (hour >= 12 && hour < 18) {
        period = 'chiều';
        displayHour = hour === 12 ? 12 : hour - 12;
      } else {
        period = 'tối';
        displayHour = hour - 12;
      }

      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return 'Không xác định';
    }
  };

  const handleCardPress = async (snackPlaceId: string) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      console.log(`User ID: ${userId}, Snack Place ID: ${snackPlaceId}`);
      if (userId) {
        await recordSnackPlaceClick(userId, snackPlaceId);
        console.log(`Click recorded for snackPlaceId: ${snackPlaceId}`);
      } else {
        console.log('No userId found, skipping click record');
      }
    } catch (error) {
      console.error('Error recording click:', error);
    }
    router.push({ pathname: '/(snack-place)/snack-place-detail', params: { snackPlaceId } });
  };

  const renderItem = ({ item }: { item: SnackPlaceData }) => (
    <TouchableOpacity onPress={() => handleCardPress(item.snackPlaceId)}>
      <ThemedView style={styles.card}>
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          onError={() => console.log(`Failed to load image for ${item.placeName}`)}
        />
        <ThemedView style={styles.cardContent}>
          <View style={styles.titleContainer}>
            {item.premiumPackage?.isActive && (
              <Ionicons
                name="star"
                size={16}
                color="#FFD700"
                style={styles.premiumIcon}
              />
            )}
            <ThemedText style={styles.cardTitle}>{item.placeName}</ThemedText>
          </View>
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
      <ThemedView style={styles.searchContainer}>
        <View style={[styles.inputWrapper, { backgroundColor: Colors[colorScheme].background }]}>
          <Ionicons
            name="search"
            size={20}
            color={Colors[colorScheme].primaryText}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme].text, borderColor: Colors[colorScheme].blackText }]}
            placeholder="Cần gì đó có mình đây ..."
            placeholderTextColor={Colors[colorScheme].icon}
            returnKeyType="search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons
                name="close"
                size={20}
                color={Colors[colorScheme].primaryText}
              />
            </TouchableOpacity>
          )}
         
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={handleFilterPress}
        >
          <Ionicons
            name="filter"
            size={20}
            color={Colors[colorScheme].primaryText}
          />
        </TouchableOpacity>
      </ThemedView>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].primaryText} />
        </View>
      ) : hasSearched && snackPlaces.length === 0 && searchQuery.trim() ? (
        <ThemedText style={styles.emptyText}>Không tìm thấy quán ăn nào.</ThemedText>
      ) : snackPlaces.length > 0 ? (
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
      ) : null}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  cameraIcon: {
    marginRight: 12,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 18,
    color: Colors.light.text,
  } as TextStyle,
  premiumIcon: {
    marginRight: 6,
  },
  cardDetail: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 4,
  } as TextStyle,
  label: {
    fontFamily: Fonts.Comfortaa.Bold,
    color: Colors.light.icon,
  } as TextStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  } as TextStyle,
  footer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.icon,
  } as TextStyle,
});

export default Search;