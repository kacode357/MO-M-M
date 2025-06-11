import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { getReviewsBySnackPlaceId, recommendReview } from '@/services/review.services';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Review {
  id: string;
  snackPlaceId: string;
  userId: string;
  userName: string;
  taste: number;
  price: number;
  sanitary: number;
  texture: number;
  convenience: number;
  image: string;
  comment: string;
  date: string;
  recommendCount: number;
  isRecommend: boolean;
  status: boolean;
}

const Comments = () => {
  const { snackPlaceId } = useLocalSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      setCurrentUserId(userId);
      return userId;
    } catch (err) {
      setError('Không thể lấy thông tin người dùng.');
      return null;
    }
  };

  const fetchReviews = async (id: string, userId: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getReviewsBySnackPlaceId(id, userId || '');
      console.log('Fetch reviews response:', response);
      if (response.status === 200 && response.data) {
        setReviews(response.data);
      } else {
        setError('Không thể tải đánh giá.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommend = async (reviewId: string, isRecommend: boolean) => {
    if (!currentUserId) {
      setError('Vui lòng đăng nhập để khuyên dùng.');
      return;
    }
    try {
      console.log('Sending recommend request:', {
        reviewId,
        currentUserId,
        payload: { params: { reviewId, userId: currentUserId } },
      });
      const response = await recommendReview(reviewId, currentUserId);
      if (response.status === 200) {
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review.id === reviewId
              ? {
                  ...review,
                  recommendCount: isRecommend
                    ? review.recommendCount - 1
                    : review.recommendCount + 1,
                  isRecommend: !isRecommend,
                }
              : review
          )
        );
      } else {
        setError('Không thể gửi khuyến nghị.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi gửi khuyến nghị.');
    }
  };

  useEffect(() => {
    if (typeof snackPlaceId !== 'string') {
      setError('ID quán không hợp lệ.');
      setLoading(false);
      return;
    }

    const initialize = async () => {
      const userId = await fetchUserId();
      if (userId !== null || !error) {
        await fetchReviews(snackPlaceId, userId);
      } else {
        setLoading(false);
      }
    };

    initialize();
  }, [snackPlaceId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <Ionicons
            name="person-circle"
            size={24}
            color={Colors.light.primaryText}
            style={styles.avatarIcon}
          />
          <View style={styles.userText}>
            <ThemedText style={styles.userName}>{item.userName}</ThemedText>
            <ThemedText style={styles.comment}>{item.comment || 'Không có bình luận'}</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.date}>{formatDate(item.date)}</ThemedText>
      </View>
      <View style={styles.ratingsContainer}>
        <View style={styles.ratingRow}>
          <ThemedText style={styles.ratingLabel}>Hương vị:</ThemedText>
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={`taste-${index}`}
                name={index < item.taste ? 'star' : 'star-outline'}
                size={16}
                color={Colors.light.primaryText}
              />
            ))}
          </View>
        </View>
        <View style={styles.ratingRow}>
          <ThemedText style={styles.ratingLabel}>Giá cả:</ThemedText>
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={`price-${index}`}
                name={index < item.price ? 'star' : 'star-outline'}
                size={16}
                color={Colors.light.primaryText}
              />
            ))}
          </View>
        </View>
        <View style={styles.ratingRow}>
          <ThemedText style={styles.ratingLabel}>Vệ sinh:</ThemedText>
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={`sanitary-${index}`}
                name={index < item.sanitary ? 'star' : 'star-outline'}
                size={16}
                color={Colors.light.primaryText}
              />
            ))}
          </View>
        </View>
        <View style={styles.ratingRow}>
          <ThemedText style={styles.ratingLabel}>Kết cấu:</ThemedText>
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={`texture-${index}`}
                name={index < item.texture ? 'star' : 'star-outline'}
                size={16}
                color={Colors.light.primaryText}
              />
            ))}
          </View>
        </View>
        <View style={styles.ratingRow}>
          <ThemedText style={styles.ratingLabel}>Tiện lợi:</ThemedText>
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={`convenience-${index}`}
                name={index < item.convenience ? 'star' : 'star-outline'}
                size={16}
                color={Colors.light.primaryText}
              />
            ))}
          </View>
        </View>
      </View>
      {item.image && item.image !== 'string' && (
        <Image source={{ uri: item.image }} style={styles.reviewImage} />
      )}
      <TouchableOpacity
        style={styles.recommendContainer}
        onPress={() => handleRecommend(item.id, item.isRecommend)}
      >
        <Ionicons
          name={item.isRecommend ? 'thumbs-up' : 'thumbs-up-outline'}
          size={16}
          color={item.isRecommend ? Colors.light.tint : Colors.light.icon}
        />
        <ThemedText style={styles.recommendText}>
          {item.recommendCount} lượt khuyên dùng
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={router.back}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.whiteText} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Bình luận</ThemedText>
      </View>
      {loading ? (
        <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
      ) : error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : reviews.length === 0 ? (
        <ThemedText style={styles.noReviewsText}>Chưa có bình luận nào.</ThemedText>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ThemedView>
  );
};

Comments.displayName = 'Comments';

// Styles remain unchanged
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
    backgroundColor: Colors.light.whiteText,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.26)',
    borderRadius: 35,
    padding: 8,
  },
  headerTitle: {
    fontFamily: Fonts.Baloo2.ExtraBold,
    fontSize: 24,
    color: Colors.light.primaryText,
    marginLeft: 20,
  },
  listContainer: { padding: 20 },
  reviewItem: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.light.primaryText,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatarIcon: {
    marginRight: 8,
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 5,
  },
  comment: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.text,
  },
  date: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 12,
    color: Colors.light.icon,
    marginLeft: 10,
    textAlign: 'right',
  },
  ratingsContainer: { marginBottom: 10 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingLabel: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.text,
    width: 80,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  reviewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  recommendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 14,
    color: Colors.light.icon,
    marginLeft: 5,
  },
  loadingText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: Colors.light.text,
  },
  errorText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
    marginTop: 20,
  },
  noReviewsText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Comments;