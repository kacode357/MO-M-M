import AlertModal from '@/components/AlertModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { createReview } from '@/services/review.services';
import { pickAndUploadImage } from '@/utils/pickAndUploadImage';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';

const Review = () => {
  const { snackPlaceId } = useLocalSearchParams();
  const [tasteRating, setTasteRating] = useState<number>(0);
  const [priceRating, setPriceRating] = useState<number>(0);
  const [sanitaryRating, setSanitaryRating] = useState<number>(0);
  const [textureRating, setTextureRating] = useState<number>(0);
  const [convenienceRating, setConvenienceRating] = useState<number>(0);
  const [image, setImage] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isSubmissionSuccess, setIsSubmissionSuccess] = useState<boolean>(false);

  const handleStarPress = (
    rating: number,
    setter: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    setter(rating);
  };

  const handleImagePick = async () => {
    const result = await pickAndUploadImage(setIsUploading);
    if (result.imageUrl) {
      setImage(result.imageUrl);
    }
  };

  const handleSubmit = async () => {
    if (isUploading) {
      return;
    }

    if (
      !tasteRating ||
      !priceRating ||
      !sanitaryRating ||
      !textureRating ||
      !convenienceRating ||
      !comment.trim()
    ) {
      setAlertTitle('Lỗi');
      setAlertMessage('Vui lòng chọn số sao cho tất cả hạng mục và nhập nhận xét.');
      setIsSubmissionSuccess(false);
      setShowAlertModal(true);
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        setAlertTitle('Lỗi');
        setAlertMessage('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        setIsSubmissionSuccess(false);
        setShowAlertModal(true);
        return;
      }

      const reviewData = {
        snackPlaceId: typeof snackPlaceId === 'string' ? snackPlaceId : '',
        userId,
        tasteRating,
        priceRating,
        sanitaryRating,
        textureRating,
        convenienceRating,
        image: image.trim() || '',
        comment,
      };
      await createReview(reviewData);

      setAlertTitle('Thành công');
      setAlertMessage('Đánh giá của bạn đã được gửi thành công!');
      setIsSubmissionSuccess(true);
      setShowAlertModal(true);
    } catch (error: any) {
      setAlertTitle('Lỗi');
      setAlertMessage(error.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
      setIsSubmissionSuccess(false);
      setShowAlertModal(true);
    }
  };

  const handleAlertConfirm = () => {
    setShowAlertModal(false);
    if (isSubmissionSuccess) {
      router.push({
        pathname: '/snack-place-detail',
        params: { snackPlaceId },
      });
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTasteRating(0);
    setPriceRating(0);
    setSanitaryRating(0);
    setTextureRating(0);
    setConvenienceRating(0);
    setImage('');
    setComment('');
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderStarRating = (
    label: string,
    rating: number,
    setRating: React.Dispatch<React.SetStateAction<number>>,
  ) => (
    <View style={styles.ratingContainer}>
      <ThemedText style={styles.label}>{label}:</ThemedText>
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star, setRating)}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={24}
              color={star <= rating ? Colors.light.primaryText : Colors.light.icon}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)')}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.whiteText} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Đánh giá quán</ThemedText>
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.light.primaryText}
            />
          }
        >
          {renderStarRating('Hương vị', tasteRating, setTasteRating)}
          {renderStarRating('Giá cả', priceRating, setPriceRating)}
          {renderStarRating('Vệ sinh', sanitaryRating, setSanitaryRating)}
          {renderStarRating('Kết cấu', textureRating, setTextureRating)}
          {renderStarRating('Tiện lợi', convenienceRating, setConvenienceRating)}
          <ThemedText style={styles.label}>Nhận xét:</ThemedText>
          <TextInput
            style={[styles.textInput, styles.commentInput]}
            multiline
            numberOfLines={5}
            placeholder="Nhập nhận xét của bạn..."
            placeholderTextColor={Colors.light.icon}
            value={comment}
            onChangeText={setComment}
          />
          <ThemedText style={styles.label}>Hình ảnh (tùy chọn):</ThemedText>
          <TouchableOpacity
            style={[styles.imagePickerContainer, isUploading && styles.disabledContainer]}
            onPress={handleImagePick}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="large" color={Colors.light.primaryText} />
            ) : image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} />
            ) : (
              <View style={styles.placeholderContent}>
                <Ionicons name="camera-outline" size={32} color={Colors.light.icon} />
                <ThemedText style={styles.placeholderText}>Thêm ảnh</ThemedText>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, isUploading && styles.disabledContainer]}
            onPress={handleSubmit}
            disabled={isUploading}
          >
            <ThemedText style={styles.submitButtonText}>Gửi đánh giá</ThemedText>
          </TouchableOpacity>
        </ScrollView>
        <AlertModal
          visible={showAlertModal}
          title={alertTitle}
          message={alertMessage}
          isSuccess={isSubmissionSuccess}
          confirmText="OK"
          onConfirm={handleAlertConfirm}
        />
      </ThemedView>
    </GestureHandlerRootView>
  );
};

Review.displayName = 'Review';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 24,
    color: Colors.light.text,
    marginLeft: 20,
    lineHeight: 32,
  },
  content: { flex: 1, padding: 20 },
  contentContainer: { paddingBottom: 20 },
  ratingContainer: { marginBottom: 20 },
  label: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 10,
    lineHeight: 24,
  },
  starContainer: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 10,
  },
  textInput: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.primaryText,
    borderRadius: 8,
    padding: 10,
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 20,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  commentInput: {
    textAlignVertical: 'top',
    height: 200,
  },
  imagePickerContainer: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.light.primaryText,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  placeholderContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: Fonts.Comfortaa.Regular,
    fontSize: 12,
    color: Colors.light.icon,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: Colors.light.primaryText,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: Fonts.Comfortaa.Bold,
    fontSize: 16,
    color: Colors.light.whiteText,
    lineHeight: 24,
  },
});

export default Review;