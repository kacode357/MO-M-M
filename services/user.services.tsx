import { defaultAxiosInstance, SkipAlertAxiosInstance } from '@/config/axios.customize';

const CreateUserApi = async (data: { fullName: string; email: string; userName: string; password: string; }) => {
    const response = await defaultAxiosInstance.post('/api/users/create', data);
    return response;
};
const LoginUserApi = async (data: { userName: string; password: string; }) => {
    const response = await SkipAlertAxiosInstance.post('/api/users/login', data);
    return response;
};
const GetCurrentUserApi = async () => {
    const response = await SkipAlertAxiosInstance.get('/api/users/get-current-login');
    console.log('GetCurrentUserApi response:', response);
    return response;
};
const ForgotPasswordApi = async (data: { email: string; }) => {
    const response = await defaultAxiosInstance.post('/api/users/forgot-password', data);
    return response;
};
const ResetPasswordApi = async (data: { email: string; otp: string; newPassword: string; }) => {
    const response = await defaultAxiosInstance.post('/api/users/reset-password', data);
    return response;
};
const GetCurrentLoginApi = async () => {
    const response = await defaultAxiosInstance.get('/api/users/get-current-login');
    return response;
};
export { CreateUserApi, ForgotPasswordApi, GetCurrentLoginApi, GetCurrentUserApi, LoginUserApi, ResetPasswordApi };

