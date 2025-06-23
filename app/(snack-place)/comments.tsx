import AlertModal from '@/components/AlertModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { createReply, deleteReview, getAllReviewsAndRepliesBySnackPlaceId, recommendReview } from '@/services/review.services';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- INTERFACES ĐÃ CẬP NHẬT ---
interface Reply {
  replyId: string;
  reviewId: string;
  userId: string;
  userName: string;
  image: string | null;
  comment: string;
  createdAt: string;
  replies: Reply[];
}

interface ReviewWithReplies {
  reviewId: string;
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
  replies: Reply[];
}

// --- HELPER FUNCTION ---
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }).format(date);
};

// --- COMPONENT CON ĐỂ HIỂN THỊ REPLY ---
const ReplyItem = ({ reply, onReplyPress, level = 0 }: { reply: Reply; onReplyPress: (reviewId: string, parentReplyId: string) => void; level?: number }) => (
    <View style={{ marginLeft: level * 15, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
        <View style={styles.userInfo}>
            <Ionicons name={level === 0 ? "storefront-outline" : "person-circle"} size={24} color={Colors.light.primaryText} style={styles.avatarIcon} />
            <View style={styles.userText}>
                <ThemedText style={styles.userName}>{reply.userName}</ThemedText>
                <ThemedText style={styles.comment}>{reply.comment}</ThemedText>
            </View>
        </View>
        <View style={styles.replyActions}>
            <ThemedText style={styles.date}>{formatDate(reply.createdAt)}</ThemedText>
            <TouchableOpacity onPress={() => onReplyPress(reply.reviewId, reply.replyId)}>
                <ThemedText style={styles.replyLink}>Trả lời</ThemedText>
            </TouchableOpacity>
        </View>

        {reply.replies?.map(childReply => (
            <ReplyItem key={childReply.replyId} reply={childReply} onReplyPress={onReplyPress} level={level + 1} />
        ))}
    </View>
);

// --- COMPONENT CHÍNH ---
const Comments = () => {
    const { snackPlaceId } = useLocalSearchParams();
    const [reviews, setReviews] = useState<ReviewWithReplies[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [reviewIdToDelete, setReviewIdToDelete] = useState<string | null>(null);

    // State cho modal trả lời
    const [isModalVisible, setModalVisible] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ reviewId: string; parentReplyId: string | null } | null>(null);

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

    const fetchReviews = useCallback(async (id: string, userId: string | null) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllReviewsAndRepliesBySnackPlaceId(id);
            if (response.status === 200 && Array.isArray(response.data)) {
                setReviews(response.data);
            } else {
                setError('Không thể tải đánh giá.');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi khi tải đánh giá.');
        } finally {
            setLoading(false);
        }
    }, []);

    const openReplyModal = (reviewId: string, parentReplyId: string | null = null) => {
        if (!currentUserId) {
            alert('Vui lòng đăng nhập để trả lời.');
            return;
        }
        setReplyingTo({ reviewId, parentReplyId });
        setModalVisible(true);
    };

      const handleSendReply = async () => {
        if (!replyContent.trim() || !replyingTo || !currentUserId) return;

        setSubmitting(true);

        // === TAO SỬA LẠI LOGIC TẠO PAYLOAD Ở ĐÂY ===

        // 1. Tạo một payload duy nhất, luôn có đủ các trường theo yêu cầu của service
        const payload = {
            // Quy tắc: Nếu đang trả lời reply khác (có parentReplyId) thì reviewId là null.
            // Ngược lại, nếu trả lời review gốc thì gán reviewId.
            reviewId: !replyingTo.parentReplyId ? replyingTo.reviewId : null,

            // Gán parentReplyId (nếu có, nếu không thì nó là null sẵn rồi)
            parentReplyId: replyingTo.parentReplyId,

            // Đổi tên 'comment' thành 'content' cho khớp với yêu cầu của hàm
            content: replyContent, 
            
            userId: currentUserId,
        };

        // In ra để kiểm tra
        console.log("Chuẩn bị gửi payload (đã sửa):", JSON.stringify(payload, null, 2));

        try {
            // 2. Gửi payload đã chuẩn đi
            await createReply(payload);
            
            // Tải lại dữ liệu để cập nhật
            await fetchReviews(snackPlaceId as string, currentUserId);
            
            setModalVisible(false);
            setReplyContent('');
        } catch (e) {
            alert('Gửi phản hồi thất bại!');
            console.error("Lỗi khi gửi reply:", e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRecommend = async (reviewId: string, isRecommend: boolean) => {
        if (!currentUserId) {
            setError('Vui lòng đăng nhập để khuyên dùng.');
            return;
        }
        try {
            const response = await recommendReview(reviewId, currentUserId);
            if (response.status === 200) {
                setReviews(prevReviews =>
                    prevReviews.map(review =>
                        review.reviewId === reviewId
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

    const handleDelete = (reviewId: string) => {
        if (!currentUserId) {
            setError('Vui lòng đăng nhập để xóa đánh giá.');
            return;
        }
        setReviewIdToDelete(reviewId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!reviewIdToDelete) return;

        setDeletingId(reviewIdToDelete);
        try {
            await deleteReview(reviewIdToDelete);
            setReviews(prevReviews => prevReviews.filter(review => review.reviewId !== reviewIdToDelete));
            setShowDeleteModal(false);
        } catch (error: any) {
            setError(error.message || 'Không thể xóa đánh giá. Vui lòng thử lại.');
        } finally {
            setDeletingId(null);
            setReviewIdToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setReviewIdToDelete(null);
    };

    useEffect(() => {
        if (typeof snackPlaceId !== 'string') {
            setError('ID quán không hợp lệ.');
            setLoading(false);
            return;
        }
        const initialize = async () => {
            const userId = await fetchUserId();
            await fetchReviews(snackPlaceId, userId);
        };
        initialize();
    }, [snackPlaceId]);

    const renderReviewItem = ({ item }: { item: ReviewWithReplies }) => (
        <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <View style={styles.userInfo}>
                    <Ionicons name="person-circle" size={24} color={Colors.light.primaryText} style={styles.avatarIcon} />
                    <View style={styles.userText}>
                        <ThemedText style={styles.userName}>{item.userName}</ThemedText>
                        <ThemedText style={styles.comment}>{item.comment || 'Không có bình luận'}</ThemedText>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <ThemedText style={styles.date}>{formatDate(item.date)}</ThemedText>
                    {item.userId === currentUserId && (
                        <TouchableOpacity onPress={() => handleDelete(item.reviewId)} disabled={deletingId === item.reviewId} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={20} color={deletingId === item.reviewId ? Colors.light.icon : Colors.light.error} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.ratingsContainer}>
                <View style={styles.ratingRow}><ThemedText style={styles.ratingLabel}>Hương vị:</ThemedText><View style={styles.starsContainer}>{[...Array(5)].map((_, i) => (<Ionicons key={`taste-${item.reviewId}-${i}`} name={i < item.taste ? 'star' : 'star-outline'} size={16} color={Colors.light.primaryText} />))}</View></View>
                <View style={styles.ratingRow}><ThemedText style={styles.ratingLabel}>Giá cả:</ThemedText><View style={styles.starsContainer}>{[...Array(5)].map((_, i) => (<Ionicons key={`price-${item.reviewId}-${i}`} name={i < item.price ? 'star' : 'star-outline'} size={16} color={Colors.light.primaryText} />))}</View></View>
                <View style={styles.ratingRow}><ThemedText style={styles.ratingLabel}>Vệ sinh:</ThemedText><View style={styles.starsContainer}>{[...Array(5)].map((_, i) => (<Ionicons key={`sanitary-${item.reviewId}-${i}`} name={i < item.sanitary ? 'star' : 'star-outline'} size={16} color={Colors.light.primaryText} />))}</View></View>
                <View style={styles.ratingRow}><ThemedText style={styles.ratingLabel}>Kết cấu:</ThemedText><View style={styles.starsContainer}>{[...Array(5)].map((_, i) => (<Ionicons key={`texture-${item.reviewId}-${i}`} name={i < item.texture ? 'star' : 'star-outline'} size={16} color={Colors.light.primaryText} />))}</View></View>
                <View style={styles.ratingRow}><ThemedText style={styles.ratingLabel}>Tiện lợi:</ThemedText><View style={styles.starsContainer}>{[...Array(5)].map((_, i) => (<Ionicons key={`convenience-${item.reviewId}-${i}`} name={i < item.convenience ? 'star' : 'star-outline'} size={16} color={Colors.light.primaryText} />))}</View></View>
            </View>

            {item.image && item.image !== 'string' && (<Image source={{ uri: item.image }} style={styles.reviewImage} />)}

            <TouchableOpacity style={styles.recommendContainer} onPress={() => handleRecommend(item.reviewId, item.isRecommend)}>
                <Ionicons name={item.isRecommend ? 'thumbs-up' : 'thumbs-up-outline'} size={16} color={item.isRecommend ? Colors.light.tint : Colors.light.icon} />
                <ThemedText style={styles.recommendText}> {item.recommendCount} lượt khuyên dùng </ThemedText>
            </TouchableOpacity>

            {item.replies && item.replies.length > 0 && (
                <View style={styles.replySection}>
                    {item.replies.map(reply => (
                        <ReplyItem
                            key={reply.replyId}
                            reply={reply}
                            onReplyPress={openReplyModal}
                        />
                    ))}
                </View>
            )}
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

            {loading ? (<ActivityIndicator size="large" color={Colors.light.primaryText} style={{ marginTop: 20 }} />
            ) : error ? (<ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : reviews.length === 0 ? (<ThemedText style={styles.noReviewsText}>Chưa có bình luận nào.</ThemedText>
            ) : (
                <FlatList
                    data={reviews}
                    renderItem={renderReviewItem}
                    keyExtractor={item => item.reviewId}
                    contentContainerStyle={styles.listContainer}
                    onRefresh={() => fetchReviews(snackPlaceId as string, currentUserId)}
                    refreshing={loading}
                />
            )}
            <AlertModal
                visible={showDeleteModal}
                title="Xác nhận"
                message="Bạn có chắc chắn muốn xóa đánh giá này?"
                showCancel={true}
                cancelText="Hủy"
                confirmText="Xóa"
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <ThemedText style={styles.modalTitle}>Viết phản hồi</ThemedText>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nhập phản hồi của bạn..."
                            multiline
                            value={replyContent}
                            onChangeText={setReplyContent}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => { setModalVisible(false); setReplyContent(''); }}>
                                <Text>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.sendButton]} onPress={handleSendReply} disabled={isSubmitting}>
                                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>Gửi</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ThemedView>
    );
};

Comments.displayName = 'Comments';

// --- STYLESHEET ĐẦY ĐỦ ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, marginTop: 40, backgroundColor: Colors.light.whiteText, },
    backButton: { backgroundColor: 'rgba(0, 0, 0, 0.26)', borderRadius: 35, padding: 8, },
    headerTitle: { fontFamily: Fonts.Baloo2.ExtraBold, fontSize: 24, color: Colors.light.primaryText, marginLeft: 20, },
    listContainer: { padding: 20 },
    reviewItem: { padding: 15, borderRadius: 8, backgroundColor: Colors.light.background, marginBottom: 15, borderWidth: 1, borderColor: '#e0e0e0', },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, },
    userInfo: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, },
    headerRight: { flexDirection: 'row', alignItems: 'center', },
    avatarIcon: { marginRight: 8, },
    userText: { flex: 1, },
    userName: { fontFamily: Fonts.Comfortaa.Bold, fontSize: 16, color: Colors.light.text, marginBottom: 5, },
    comment: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 14, color: Colors.light.text, },
    date: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 12, color: Colors.light.icon, marginLeft: 10, },
    deleteButton: { padding: 5, marginLeft: 10, },
    ratingsContainer: { marginBottom: 10 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, },
    ratingLabel: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 14, color: Colors.light.text, width: 80, },
    starsContainer: { flexDirection: 'row', },
    reviewImage: { width: '100%', height: 150, borderRadius: 8, marginBottom: 10, },
    recommendContainer: { flexDirection: 'row', alignItems: 'center', },
    recommendText: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 14, color: Colors.light.icon, marginLeft: 5, },
    loadingText: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 16, textAlign: 'center', marginTop: 20, color: Colors.light.text, },
    errorText: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 16, color: Colors.light.error, textAlign: 'center', marginTop: 20, },
    noReviewsText: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 16, color: Colors.light.icon, textAlign: 'center', marginTop: 20, },
    replySection: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    replyActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    replyLink: { color: Colors.light.tint, fontFamily: Fonts.Comfortaa.Bold, fontSize: 13, padding: 5 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '90%', margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { fontSize: 20, fontFamily: Fonts.Baloo2.Bold, marginBottom: 15 },
    modalInput: { width: '100%', minHeight: 100, borderColor: '#ddd', borderWidth: 1, borderRadius: 10, padding: 10, textAlignVertical: 'top', marginBottom: 20 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    modalButton: { borderRadius: 10, padding: 10, elevation: 2, flex: 1, marginHorizontal: 5, alignItems: 'center', backgroundColor: '#f0f0f0' },
    sendButton: { backgroundColor: Colors.light.primaryText },
    sendButtonText: { color: 'white', fontFamily: Fonts.Comfortaa.Bold }
});

export default Comments;