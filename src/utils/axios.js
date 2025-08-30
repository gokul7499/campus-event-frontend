import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only handle 401 errors for non-auth endpoints
    if (error.response?.status === 401 && !error.config.url.includes('/api/auth/')) {
      // Token expired or invalid for protected routes
      localStorage.removeItem('token');
      // Don't redirect immediately, let the component handle it
      console.warn('Token expired, please login again');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
