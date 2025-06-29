import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { filterSnackPlaces, getAllSnackPlaceAttributes, recordSnackPlaceClick } from '@/services/snackplace.services';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, TextStyle, TouchableOpacity, View } from 'react-native';

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

interface Attribute {
  id: string;
  name: string;
}

interface FilterSnackPlacesParams {
  priceFrom: number;
  priceTo: number;
  tasteIds: string[];
  dietIds: string[];
  foodTypeIds: string[];
}

const FilterScreen = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const [tastes, setTastes] = useState<Attribute[]>([]);
  const [diets, setDiets] = useState<Attribute[]>([]);
  const [foodTypes, setFoodTypes] = useState<Attribute[]>([]);
  const [selectedTasteIds, setSelectedTasteIds] = useState<string[]>([]);
  const [selectedDietIds, setSelectedDietIds] = useState<string[]>([]);
  const [selectedFoodTypeIds, setSelectedFoodTypeIds] = useState<string[]>([]);
  const [priceFrom, setPriceFrom] = useState<string>('');
  const [priceTo, setPriceTo] = useState<string>('');
  const [snackPlaces, setSnackPlaces] = useState<SnackPlaceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [attributesLoading, setAttributesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await getAllSnackPlaceAttributes();
        if (response.status === 200) {
          setTastes(response.data.tastes);
          setDiets(response.data.diets);
          setFoodTypes(response.data.foodTypes);
        } else {
          setError('Không thể tải bộ lọc');
        }
      } catch (err) {
        console.error('Error fetching attributes:', err);
        setError('Không thể tải bộ lọc');
      } finally {
        setAttributesLoading(false);
      }
    };
    fetchAttributes();
  }, []);

  const toggleSelection = (id: string, selectedIds: string[], setSelectedIds: (ids: string[]) => void) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleApplyFilters = async () => {
  setLoading(true);
  setError(null);

  try {
    const params: FilterSnackPlacesParams = {
      priceFrom: priceFrom ? parseInt(priceFrom, 10) : 0,
      priceTo: priceTo ? parseInt(priceTo, 10) : Number.MAX_SAFE_INTEGER,
      tasteIds: selectedTasteIds,
      dietIds: selectedDietIds,
      foodTypeIds: selectedFoodTypeIds,
    };
    console.log('Filter parameters:', params); // Log the parameters
    const response = await filterSnackPlaces(params);
    if (response.status === 200 && Array.isArray(response.data)) {
      setSnackPlaces(response.data);
    } else {
      setSnackPlaces([]);
      setError('Không tìm thấy kết quả');
    }
  } catch (err) {
    console.error('Error filtering snack places:', err);
    setSnackPlaces([]);
    setError('Không tìm thấy kết quả');
  } finally {
    setLoading(false);
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

  const renderChip = (item: Attribute, selectedIds: string[], onPress: (id: string) => void) => (
    <TouchableOpacity
      style={[
        styles.chip,
        selectedIds.includes(item.id) && { backgroundColor: Colors[colorScheme].primaryText },
      ]}
      onPress={() => onPress(item.id)}
    >
      <ThemedText
        style={[styles.chipText, selectedIds.includes(item.id) && { color: Colors[colorScheme].background }]}
      >
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: SnackPlaceData }) => (
    <TouchableOpacity onPress={() => handleCardPress(item.snackPlaceId)}>
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

  if (attributesLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].primaryText} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].primaryText} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Bộ lọc</ThemedText>
      </View>
      <FlatList
        ListHeaderComponent={
          <>
            <ThemedText style={styles.sectionTitle}>Khoảng giá (VND)</ThemedText>
            <View style={styles.priceRangeContainer}>
              <TextInput
                style={[styles.priceInput, { borderColor: Colors[colorScheme].blackText }]}
                placeholder="Từ"
                keyboardType="numeric"
                value={priceFrom}
                onChangeText={setPriceFrom}
              />
              <ThemedText style={styles.priceSeparator}> - </ThemedText>
              <TextInput
                style={[styles.priceInput, { borderColor: Colors[colorScheme].blackText }]}
                placeholder="Đến"
                keyboardType="numeric"
                value={priceTo}
                onChangeText={setPriceTo}
              />
            </View>
            <ThemedText style={styles.sectionTitle}>Hương vị</ThemedText>
            <View style={styles.chipContainer}>
              {tastes.map((taste) =>
                renderChip(taste, selectedTasteIds, (id) =>
                  toggleSelection(id, selectedTasteIds, setSelectedTasteIds),
                ),
              )}
            </View>
            <ThemedText style={styles.sectionTitle}>Chế độ ăn</ThemedText>
            <View style={styles.chipContainer}>
              {diets.map((diet) =>
                renderChip(diet, selectedDietIds, (id) =>
                  toggleSelection(id, selectedDietIds, setSelectedDietIds),
                ),
              )}
            </View>
            <ThemedText style={styles.sectionTitle}>Loại món ăn</ThemedText>
            <View style={styles.chipContainer}>
              {foodTypes.map((foodType) =>
                renderChip(foodType, selectedFoodTypeIds, (id) =>
                  toggleSelection(id, selectedFoodTypeIds, setSelectedFoodTypeIds),
                ),
              )}
            </View>
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
              <ThemedText style={styles.applyButtonText}>Áp dụng bộ lọc</ThemedText>
            </TouchableOpacity>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors[colorScheme].primaryText} />
              </View>
            )}
            {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
          </>
        }
        data={snackPlaces}
        renderItem={renderItem}
        keyExtractor={(item) => item.snackPlaceId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          snackPlaces.length === 0 && !loading && !error ? (
            <ThemedText style={styles.emptyText}>Vui lòng áp dụng bộ lọc để xem kết quả</ThemedText>
          ) : null
        }
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  header: {
    marginTop :40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  } as TextStyle,
  sectionTitle: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  } as TextStyle,
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
  },
  priceSeparator: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
  } as TextStyle,
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  chipText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
  } as TextStyle,
  applyButton: {
    backgroundColor: Colors.light.primaryText,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  applyButtonText: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 16,
    color: Colors.light.background,
  } as TextStyle,
  listContainer: {
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
  } as TextStyle,
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
  errorText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    color: Colors.light.error || '#FF0000',
    textAlign: 'center',
    marginTop: 20,
  } as TextStyle,
});

export default FilterScreen;