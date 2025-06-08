import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import Toast from "react-native-toast-message";

interface ApiResponse {
  status: number;
  message?: string;
  errors?: { [key: string]: string[] };
  data?: any;
}

// Shared Axios configuration
const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
    timeoutErrorMessage: "Connection timeout exceeded",
  });

  // Request interceptor to attach accessToken
  instance.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  return instance;
};

// Default Axios instance (shows both success and error toasts)
const defaultAxiosInstance: AxiosInstance = createAxiosInstance(
  "https://mammap-dxapa6h5c2ctd9hz.southeastasia-01.azurewebsites.net"
);

// Response interceptor for defaultAxiosInstance
defaultAxiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    if (response.data.message) {
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: response.data.message,
        position: "top",
      });
    }
    return response;
  },
  (err: AxiosError<ApiResponse>) => {
    const { response } = err;
    console.error(
      `defaultAxiosInstance error response for ${err.config?.url}:`,
      response?.data || err.message
    );
    if (response?.data?.message) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: response.data.message,
        position: "top",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Đã xảy ra lỗi không xác định.",
        position: "top",
      });
    }
    return Promise.reject(err);
  }
);

// Skip Notification Axios instance (shows only error toasts, skips success toasts)
const skipNotiAxiosInstance: AxiosInstance = createAxiosInstance(
  "https://mammap-dxapa6h5c2ctd9hz.southeastasia-01.azurewebsites.net"
);

// Response interceptor for skipNotiAxiosInstance
skipNotiAxiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  (err: AxiosError<ApiResponse>) => {
    const { response } = err;
    console.error(
      `skipNotiAxiosInstance error response for ${err.config?.url}:`,
      response?.data || err.message
    );
    if (response?.data?.message) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: response.data.message,
        position: "top",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Đã xảy ra lỗi không xác định.",
        position: "top",
      });
    }
    return Promise.reject(err);
  }
);

// Skip All Notifications Axios instance (skips both success and error toasts)
const skipAllNotiAxiosInstance: AxiosInstance = createAxiosInstance(
  "https://mammap-dxapa6h5c2ctd9hz.southeastasia-01.azurewebsites.net"
);

// Response interceptor for skipAllNotiAxiosInstance
skipAllNotiAxiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  (err: AxiosError<ApiResponse>) => {
    const { response } = err;
    console.error(
      `skipAllNotiAxiosInstance error response for ${err.config?.url}:`,
      response?.data || err.message
    );
    return Promise.reject(err);
  }
);

export { defaultAxiosInstance, skipAllNotiAxiosInstance, skipNotiAxiosInstance };

