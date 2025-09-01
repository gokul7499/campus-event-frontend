import axios from 'axios';
import config from '../config/config';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Debug logging
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown',
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      headers: error.response?.headers
    });

    // Handle specific error types
    if (error.response?.status === 404) {
      console.error('🚫 404 Error: API endpoint not found. Check if backend is running and endpoints are correct.');
      console.error('🔍 Attempted URL:', error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown');
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('🌐 Network Error: Unable to connect to backend server. Please check your internet connection and try again.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection Refused: Backend server is not running or not accessible.');
    }

    // Only handle 401 errors for non-auth endpoints  
    if (error.response?.status === 401 && !error.config.url.includes('/auth/')) {
      // Token expired or invalid for protected routes
      localStorage.removeItem('token');
      // Don't redirect immediately, let the component handle it
      console.warn('Token expired, please login again');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
