import { defaultAxiosInstance } from '@/config/axios.customize';

// Tạo mới đánh giá ứng dụng
const createAppRating = async (data: { star: number; description: string; appType: string }) => {
    const response = await defaultAxiosInstance.post('/api/AppRating/create', data);
    return response.data;
};

// Lấy đánh giá theo user hiện tại
const getAppRatingByUserId = async () => {
    const response = await defaultAxiosInstance.get('/api/AppRating/getByUserId');
    return response.data;
};

// Tìm kiếm đánh giá theo điều kiện (appType, minStar, maxStar, pageNum, pageSize)
const searchAppRatings = async (params: {
    appType?: string;
    minStar?: number;
    maxStar?: number;
    pageNum?: number;
    pageSize?: number;
}) => {
    const response = await defaultAxiosInstance.get('/api/AppRating/search', { params });
    return response.data;
};

export { createAppRating, getAppRatingByUserId, searchAppRatings };

