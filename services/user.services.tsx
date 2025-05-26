import { defaultAxiosInstance, skipNotiAxiosInstance } from '@/config/axios.customize';

const CreateUserApi = async (data: { fullName: string; email: string; userName: string; password: string; }) => {
    const response = await defaultAxiosInstance.post('/api/users/create', data);
    return response.data;
};

const LoginUserApi = async (data: { userName: string; password: string; }) => {
    const response = await skipNotiAxiosInstance.post('/api/users/login', data);
    return response.data;
};

const GetCurrentUserApi = async () => {
    const response = await skipNotiAxiosInstance.get('/api/users/get-current-login');
    return response.data;
};

const ForgotPasswordApi = async (data: { email: string; }) => {
    const response = await defaultAxiosInstance.post('/api/users/forgot-password', data);
    return response.data;
};

const ResetPasswordApi = async (data: { email: string; otp: string; newPassword: string; }) => {
    const response = await defaultAxiosInstance.post('/api/users/reset-password', data);
    return response.data;
};

const RefreshTokenApi = async (data: { accessToken: string; refreshToken: string; }) => {
    const response = await skipNotiAxiosInstance.post('/api/users/refresh-token', data);
    return response.data;
};

const GetUserByIdApi = async (id: string) => {
    const response = await skipNotiAxiosInstance.get(`/api/users/getById?id=${id}`);
    return response.data;
};

const UpdateUserApi = async (data: { id: string; phoneNumber: string; fullname: string; image: string; dateOfBirth: string; }) => {
    const response = await defaultAxiosInstance.put('/api/users/update', data);
    return response.data;
};
const ChangePasswordApi = async (data: { oldPassword: string; newPassword: string; }) => {
    const response = await defaultAxiosInstance.post('/api/users/change-password', data);
    return response.data;
};
export {
    ChangePasswordApi,
    CreateUserApi,
    ForgotPasswordApi,
    GetCurrentUserApi,
    GetUserByIdApi,
    LoginUserApi,
    RefreshTokenApi,
    ResetPasswordApi,
    UpdateUserApi
};

