import { triggerAlert } from "@/utils/alertHandler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

interface ApiResponse {
  type?: string;
  title?: string;
  status: number;
  message?: string;
  errors?: { [key: string]: string[] };
  traceId?: string;
}

// Shared Axios configuration
const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      "content-type": "application/json",
    },
    timeout: 30000,
    timeoutErrorMessage: "Connection timeout exceeded",
  });

  // Request interceptor to attach accessToken
  instance.interceptors.request.use(
    async (config) => {
      console.log(`Request to ${config.url} with method ${config.method}`); // Log request
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

// Default Axios instance with alerts for both success and error
const defaultAxiosInstance: AxiosInstance = createAxiosInstance(
  "https://mammap-dxapa6h5c2ctd9hz.southeastasia-01.azurewebsites.net"
);

defaultAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data as ApiResponse;
    console.log(`defaultAxiosInstance success response for ${response.config.url}:`, {
      status: response.status,
      data,
    });
    // Handle success responses (200 or 201) with a message
    if ((response.status === 200 || response.status === 201) && data?.message) {
      console.log("Triggering success alert from defaultAxiosInstance:", data.message);
      triggerAlert({
        title: "Thành công",
        message: data.message,
        confirmText: "OK",
        showCancel: false,
        isSuccess: true,
      });
    }
    return response.data;
  },
  (err: AxiosError<ApiResponse>) => {
    const { response } = err;
    console.error(`defaultAxiosInstance error response for ${err.config?.url}:`, response?.data);
    if (response) {
      handleErrorByNotification(err);
    }
    return Promise.reject(err);
  }
);

// Skip Alert Axios instance (no success alerts, but error alerts)
const SkipAlertAxiosInstance: AxiosInstance = createAxiosInstance(
  "https://mammap-dxapa6h5c2ctd9hz.southeastasia-01.azurewebsites.net"
);

SkipAlertAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`SkipAlertAxiosInstance success response for ${response.config.url}:`, {
      status: response.status,
      data: response.data,
    });
    return response.data; // No alerts for success
  },
  (err: AxiosError<ApiResponse>) => {
    const { response } = err;
    console.error(`SkipAlertAxiosInstance error response for ${err.config?.url}:`, response?.data);
    if (response) {
      handleErrorByNotification(err); // Trigger error notification
    }
    return Promise.reject(err); // Pass error
  }
);

// Error handler for both instances
const handleErrorByNotification = (errors: AxiosError<ApiResponse>) => {
  const data = errors.response?.data as ApiResponse;
  console.error("handleErrorByNotification processing error:", data);

  // Default title and message
  let errorTitle = data?.title || "Lỗi";
  let errorMessage = data?.message || "Đã xảy ra lỗi";

  // Handle validation errors if present
  if (data?.errors) {
    errorTitle = "Lỗi xác thực";
    errorMessage = Object.values(data.errors)
      .flat()
      .map((msg) => `• ${msg}`)
      .join("\n");
  }

  console.log("Triggering error alert from handleErrorByNotification:", {
    title: errorTitle,
    message: errorMessage,
  });
  // Trigger alert
  triggerAlert({
    title: errorTitle,
    message: errorMessage,
    confirmText: "OK",
    showCancel: false,
    isSuccess: false,
  });

  return errorMessage;
};

export { defaultAxiosInstance, SkipAlertAxiosInstance };
