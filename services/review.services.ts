import { defaultAxiosInstance, skipAllNotiAxiosInstance, skipNotiAxiosInstance } from '@/config/axios.customize';

const createReview = async (data: { snackPlaceId: string; userId: string; tasteRating: number; priceRating: number; sanitaryRating: number; textureRating: number; convenienceRating: number; image: string; comment: string }) => {
    const response = await defaultAxiosInstance.post('/api/reviews/create', data);
    return response.data;
};
const getAverageRate = async (snackPlaceId: string) => {
    const response = await skipAllNotiAxiosInstance.get(`/api/reviews/getAverageRate`, {
        params: { snackPlaceId },
    });
    return response.data;
};
const getReviewsBySnackPlaceId = async (snackPlaceId: string, currentUserId: string) => {
    const response = await skipNotiAxiosInstance.get(`/api/reviews/getBySnackPlaceId`, {
        params: { snackPlaceId, currentUserId },
    });
    return response.data;
};
const recommendReview = async (reviewId: string, userId: string) => {
    const response = await skipNotiAxiosInstance.post(`/api/reviews/recommend`, null, {
        params: { reviewId, userId },
    });
    return response.data;
};
export { createReview, getAverageRate, getReviewsBySnackPlaceId, recommendReview };

