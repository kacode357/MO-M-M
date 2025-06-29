import { defaultAxiosInstance, skipAllNotiAxiosInstance, skipNotiAxiosInstance } from '@/config/axios.customize';

interface CreateSnackPlaceParams {
  userId: string;
  placeName: string;
  ownerName: string;
  address: string;
  email: string;
  coordinates: string;
  openingHour: string;
  averagePrice: number;
  image: string;
  mainDish: string;
  phoneNumber: string;
  businessModelId: string;
  tasteIds: string[];
  dietIds: string[];
  foodTypeIds: string[];
}

interface SearchSnackPlacesParams {
  pageNum: number;
  pageSize: number;
  searchKeyword: string;
  status: boolean;
}

const createSnackPlace = async (params: CreateSnackPlaceParams) => {
  const response = await defaultAxiosInstance.post('/api/SnackPlaces/create', params);
  return response.data;
};

const searchSnackPlaces = async (params: SearchSnackPlacesParams) => {
  const response = await skipNotiAxiosInstance.post('/api/SnackPlaces/search-snackplaces', params);
  return response.data;
};
const getSnackPlaceById = async (id: string) => {
  const response = await skipNotiAxiosInstance.get(`/api/SnackPlaces/getById`, {
    params: { id },
  });
  return response.data;
};
const getSnackPlaceByIdSkipAll = async (id: string) => {
  const response = await skipAllNotiAxiosInstance.get(`/api/SnackPlaces/getById`, {
    params: { id },
  });
  return response.data;
};
const recordSnackPlaceClick = async (userId: string, snackPlaceId: string) => {
  const response = await skipNotiAxiosInstance.post('/api/SnackPlaces/click', {
    userId,
    snackPlaceId,
  });
  return response.data;
};
const getAllSnackPlaceAttributes = async () => {
  const response = await skipNotiAxiosInstance.get('/api/SnackPlaces/getAllAttributes');
  return response.data;
};
interface FilterSnackPlacesParams {
  priceFrom: number;
  priceTo: number;
  tasteIds: string[];
  dietIds: string[];
  foodTypeIds: string[];
}

const filterSnackPlaces = async (params: FilterSnackPlacesParams) => {
  const response = await skipNotiAxiosInstance.post('/api/SnackPlaces/filter', params);
  return response.data;
};
export { createSnackPlace, filterSnackPlaces, getAllSnackPlaceAttributes, getSnackPlaceById, getSnackPlaceByIdSkipAll, recordSnackPlaceClick, searchSnackPlaces };

