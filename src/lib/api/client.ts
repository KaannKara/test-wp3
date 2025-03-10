import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Base API URL - change this to your actual backend URL in production
export const API_URL = import.meta.env.VITE_API_URL;

// Flag to prevent multiple redirections
let isRedirecting = false;

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for adding token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle token expiration
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      console.log('Token geçersiz oldu veya yetkilendirme hatası - Çıkış yapılıyor');
      localStorage.removeItem('userToken');
      
      // Reset the flag after a brief delay to prevent weird edge cases
      setTimeout(() => {
        isRedirecting = false;
      }, 1000);
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    // Log error details
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// Generic GET request with retry
export const get = async <T>(url: string, config?: AxiosRequestConfig, retries = 2): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.get(url, config);
    return response.data;
  } catch (error) {
    if (retries > 0 && axios.isAxiosError(error) && error.response?.status === 404) {
      console.log(`Retrying GET request to ${url}, ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return get(url, config, retries - 1);
    }
    throw error;
  }
};

// Generic POST request
export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.post(url, data, config);
  return response.data;
};

// Generic PUT request
export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.put(url, data, config);
  return response.data;
};

// Generic DELETE request
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.delete(url, config);
  return response.data;
};

export default apiClient; 