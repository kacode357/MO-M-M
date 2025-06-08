import { defaultAxiosInstance, skipAllNotiAxiosInstance, skipNotiAxiosInstance } from '@/config/axios.customize';
const createDish = async (data: { name: string; description: string; image: string; price: number; snackPlaceId: string }) => {
    const response = await defaultAxiosInstance.post('/api/Dish/create', data);
    return response.data;
};
const getDishesBySnackPlace = async (snackPlaceId: string) => {
    const response = await skipNotiAxiosInstance.get(`/api/Dish/getBySnackPlace`, {
        params: { snackPlaceId }
    });
    return response.data;
};
const getNoNotiDishesBySnackPlace = async (snackPlaceId: string) => {
    const response = await skipAllNotiAxiosInstance.get(`/api/Dish/getBySnackPlace`, {
        params: { snackPlaceId }
    });
    return response.data;
};
const updateDish = async (data: { dishId: string; name: string; description: string; image: string; price: number; snackPlaceId: string }) => {
    const response = await defaultAxiosInstance.put('/api/Dish/update', data);
    return response.data;
};
export { createDish, getDishesBySnackPlace, getNoNotiDishesBySnackPlace, updateDish };

