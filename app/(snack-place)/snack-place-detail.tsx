import AlertModal from '@/components/AlertModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { getNoNotiDishesBySnackPlace } from '@/services/dish.services';
import { getAverageRate } from '@/services/review.services';
import { getSnackPlaceByIdSkipAll } from '@/services/snackplace.services';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SnackPlaceDetailData {
  snackPlaceId: string;
  placeName: string;
  address: string;
  openingHour: string;
  image: string;
  description: string;
}

interface Dish {
  dishId: string;
  name: string;
  price: number;
  description: string;
  image?: string;
}

interface RatingData {
  averageRating: number;
  totalRatingsCount: number;
  recommendPercent: number;
  ratingDistributionPercent: { [key: string]: number };
}

const SnackPlaceDetail = () => {
  const { snackPlaceId } = useLocalSearchParams();
  const [snackPlace, setSnackPlace] = useState<SnackPlaceDetailData | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'dishes'>('overview');
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

  const fetchSnackPlaceDetail = async (id: string) => {
    setLoading(true);
    const { status, data } = await getSnackPlaceByIdSkipAll(id);
    setSnackPlace(status === 200 && data ? data : null);
    setLoading(false);
  };

  const fetchDishes = async (id: string) => {
    setLoadingDishes(true);
    const { status, data } = await getNoNotiDishesBySnackPlace(id);
    console.log('Dishes data:', status, data);
    setDishes(status === 200 && data ? data : []);
    setLoadingDishes(false);
  };

  const fetchRatings = async (id: string) => {
    setLoadingRatings(true);
    try {
      const data = await getAverageRate(id);
      console.log('Rating data:', data);
      setRatingData(data.data);
    } catch (error) {
      setRatingData(null);
    } finally {
      setLoadingRatings(false);
    }
  };

  useEffect(() => {
    if (typeof snackPlaceId === 'string') {
      fetchSnackPlaceDetail(snackPlaceId);
      fetchDishes(snackPlaceId);
      fetchRatings(snackPlaceId);
    } else {
      setLoading(false);
    }
  }, [snackPlaceId]);

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

  const handleCopyAddress = async (address: string) => {
    await Clipboard.setStringAsync(address);
    setModalConfig({
      title: 'Thành công',
      message: 'Địa chỉ đã được sao chép!',
      isSuccess: true,
      onConfirm: () => setModalVisible(false),
    });
    setModalVisible(true);
  };

  const handleReviewNavigation = async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
      setModalConfig({
        title: 'Thông báo',
        message: 'Bạn cần đăng nhập để thực hiện đánh giá.',
        isSuccess: false,
        onConfirm: () => setModalVisible(false),
      });
      setModalVisible(true);
      return;
    }
    if (typeof snackPlaceId === 'string') {
      router.push({
        pathname: '/review',
        params: { snackPlaceId },
      });
    }
  };

  const handleCommentsNavigation = () => {
    if (typeof snackPlaceId === 'string') {
      router.push({
        pathname: '/comments',
        params: { snackPlaceId },
      });
    }
  };

  const handleMapNavigation = (address: string) => {
    router.push({
      pathname: '/(snack-place)/map-location',
      params: { address },
    });
  };

  const renderDishItem = ({ item }: { item: Dish }) => (
    <View style={styles.dishItem}>
      <View style={styles.dishImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.dishImage} />
        ) : (
          <View style={[styles.dishImage, styles.placeholderImage]} />
        )}
      </View>
      <View style={styles.dishInfo}>
        <ThemedText style={styles.dishName}>{item.name}</ThemedText>
        <ThemedText style={styles.dishPrice}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
        </ThemedText>
        <ThemedText style={styles.dishDescription}>{item.description}</ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <View style={styles.paddedContent}>
          <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
        </View>
      ) : !snackPlace ? (
        <View style={styles.paddedContent}>
          <ThemedText style={styles.errorText}>Không có dữ liệu</ThemedText>
        </View>
      ) : (
        <>
          <View style={styles.imageContainer}>
            <Image source={{ uri: snackPlace.image }} style={styles.image} />
            <TouchableOpacity style={styles.backButton} onPress={router.back}>
              <Ionicons name="arrow-back" size={24} color={Colors.light.whiteText} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <View style={styles.paddedContent}>
              <ThemedText style={styles.title}>{snackPlace.placeName}</ThemedText>
              {loadingRatings ? (
                <ThemedText style={styles.loadingText}>Đang tải đánh giá...</ThemedText>
              ) : ratingData ? (
                <View style={styles.ratingContainer}>
                  <View style={styles.ratingRowContainer}>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={20} color={Colors.light.primaryText} style={styles.ratingIcon} />
                      <ThemedText style={styles.ratingText}>
                        {ratingData.averageRating.toFixed(1)} ({ratingData.totalRatingsCount} đánh giá)
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.commaSeparator}>, </ThemedText>
                    <ThemedText style={styles.recommendText}>
                      {ratingData.recommendPercent.toFixed(2)}% khuyên dùng
                    </ThemedText>
                    <TouchableOpacity onPress={handleCommentsNavigation}>
                      <ThemedText style={styles.commentsLink}>(xem bình luận)</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.distributionContainer}>
                    {[5, 4, 3, 2, 1].map(star => (
                      <View key={star} style={styles.distributionRow}>
                        <ThemedText style={styles.distributionLabel}>{star} sao</ThemedText>
                        <View style={styles.barContainer}>
                          <View
                            style={[
                              styles.bar,
                              {
                                width: `${ratingData.ratingDistributionPercent[star.toString()]}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <ThemedText style={styles.noRatingText}>Chưa có đánh giá</ThemedText>
              )}
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={24} color={Colors.light.text} style={styles.icon} />
                <View style={styles.addressContainer}>
  <TouchableOpacity
    style={styles.addressWrapper}
    onPress={() => handleMapNavigation(snackPlace.address)}
  >
    <ThemedText style={styles.addressText} numberOfLines={2} ellipsizeMode="tail">
      {snackPlace.address}
    </ThemedText>
  </TouchableOpacity>
  <TouchableOpacity
    style={styles.inlineCopyButton}
    onPress={() => handleCopyAddress(snackPlace.address)}
  >
    <Ionicons name="copy-outline" size={15} color={Colors.light.text} />
  </TouchableOpacity>
</View>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={24} color={Colors.light.text} style={styles.icon} />
                <ThemedText style={styles.detail}>{formatTime(snackPlace.openingHour)}</ThemedText>
              </View>
              <TouchableOpacity style={styles.reviewButton} onPress={handleReviewNavigation}>
                <ThemedText style={styles.reviewButtonText}>Đánh giá cho quán</ThemedText>
              </TouchableOpacity>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                  onPress={() => setActiveTab('overview')}
                >
                  <ThemedText style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                    Tổng quan
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'dishes' && styles.activeTab]}
                  onPress={() => setActiveTab('dishes')}
                >
                  <ThemedText style={[styles.tabText, activeTab === 'dishes' && styles.activeTabText]}>
                    Món ăn
                  </ThemedText>
                </TouchableOpacity>
              </View>
              {activeTab === 'overview' ? (
                <View style={styles.tabContent}>
                  <ThemedText style={styles.description}>{snackPlace.description || 'Không có mô tả'}</ThemedText>
                </View>
              ) : (
                <View style={styles.tabContent}>
                  {loadingDishes ? (
                    <ThemedText style={styles.loadingText}>Đang tải món...</ThemedText>
                  ) : dishes.length ? (
                    <FlatList
                      data={dishes}
                      renderItem={renderDishItem}
                      keyExtractor={item => item.dishId}
                      style={styles.dishList}
                      scrollEnabled={false}
                    />
                  ) : (
                    <ThemedText style={styles.errorText}>Không có món ăn</ThemedText>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
          <AlertModal
            visible={modalVisible}
            title={modalConfig.title}
            message={modalConfig.message}
            isSuccess={modalConfig.isSuccess}
            showCancel={false}
            confirmText="OK"
            onConfirm={modalConfig.onConfirm}
          />
        </>
      )}
    </ThemedView>
  );
};

SnackPlaceDetail.displayName = 'SnackPlaceDetail';

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 200 },
  backButton: { position: 'absolute', top: 40, left: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.26)', borderRadius: 35, padding: 8 },
  content: { flex: 1 },
  contentContainer: { paddingBottom: 20 },
  paddedContent: { padding: 20 },
  title: { fontFamily: Fonts.Baloo2.ExtraBold, fontSize: 30, color: Colors.light.text, marginBottom: 10, lineHeight: 32, paddingVertical: 2 },
  ratingContainer: { marginBottom: 20 },
  ratingRowContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingIcon: { marginRight: 5 },
  ratingText: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 16, color: Colors.light.text },
  commaSeparator: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 16, color: Colors.light.text, marginHorizontal: 5 },
  recommendText: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 16, color: Colors.light.icon },
  commentsLink: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 16, color: Colors.light.primaryText, textDecorationLine: 'underline' },
  distributionContainer: { flexDirection: 'column' },
  distributionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  distributionLabel: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 12, color: Colors.light.text, width: 50 },
  barContainer: { flex: 1, height: 8, backgroundColor: Colors.light.background, borderRadius: 4, marginHorizontal: 10 },
  bar: { height: '100%', backgroundColor: Colors.light.primaryText, borderRadius: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5 },
  addressContainer: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  addressWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  addressText: { fontFamily: Fonts.Comfortaa.Bold, fontSize: 13, color: Colors.light.primaryText, flexShrink: 1, maxWidth: '90%' },
  detail: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 13, color: Colors.light.icon },
  icon: { marginRight: 8 },
  inlineCopyButton: { padding: 4, marginTop: -15, marginLeft: 8 },
  reviewButton: { backgroundColor: Colors.light.primaryText, padding: 8, borderRadius: 4, alignItems: 'center', marginBottom: 10 },
  reviewButtonText: { fontFamily: Fonts.Comfortaa.Bold, fontSize: 12, color: Colors.light.whiteText },
  loadingText: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 16, textAlign: 'center', marginTop: 20 },
  errorText: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 16, color: Colors.light.error, textAlign: 'center', marginTop: 20 },
  noRatingText: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 16, color: Colors.light.icon, marginBottom: 20 },
  tabContainer: { flexDirection: 'row', marginVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.light.primaryText },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: Colors.light.tint },
  tabText: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 16, color: Colors.light.icon },
  activeTabText: { fontFamily: Fonts.Comfortaa.Bold, color: Colors.light.text },
  tabContent: { marginTop: 10 },
  description: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 16, color: Colors.light.text, lineHeight: 24 },
  dishList: { flexGrow: 0 },
  dishItem: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: Colors.light.primaryText, marginBottom: 10, alignItems: 'center' },
  dishImageContainer: { width: 100, marginRight: 10 },
  dishImage: { width: 100, height: 100, borderRadius: 8 },
  placeholderImage: { backgroundColor: Colors.light.blackText },
  dishInfo: { flex: 1 },
  dishName: { fontFamily: Fonts.Comfortaa.Bold, fontSize: 16, color: Colors.light.text },
  dishPrice: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 14, color: Colors.light.icon, marginTop: 5 },
  dishDescription: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 14, color: Colors.light.icon, marginTop: 5 }
});

export default SnackPlaceDetail;