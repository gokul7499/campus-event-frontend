// API Endpoints utility with fallback support
import config from '../config/config';

// Helper function to try multiple endpoint variations
export const tryEndpoints = async (axios, baseEndpoint, data = null, method = 'GET') => {
  const endpoints = [
    baseEndpoint, // Try without /api prefix first
    `/api${baseEndpoint}` // Then try with /api prefix
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Trying endpoint: ${config.api.baseURL}${endpoint}`);
      
      let response;
      switch (method.toUpperCase()) {
        case 'POST':
          response = await axios.post(endpoint, data);
          break;
        case 'PUT':
          response = await axios.put(endpoint, data);
          break;
        case 'DELETE':
          response = await axios.delete(endpoint);
          break;
        case 'GET':
        default:
          response = await axios.get(endpoint);
          break;
      }
      
      console.log(`✅ Success with endpoint: ${config.api.baseURL}${endpoint}`);
      return response;
      
    } catch (error) {
      console.log(`❌ Failed with endpoint: ${config.api.baseURL}${endpoint}`, error.response?.status);
      lastError = error;
      
      // If it's not a 404, don't try the next endpoint
      if (error.response?.status !== 404) {
        throw error;
      }
    }
  }

  // If we get here, all endpoints failed
  console.error('🚫 All endpoint variations failed');
  throw lastError;
};

// Wrapper functions for common API calls
export const apiCall = {
  get: (axios, endpoint) => tryEndpoints(axios, endpoint, null, 'GET'),
  post: (axios, endpoint, data) => tryEndpoints(axios, endpoint, data, 'POST'),
  put: (axios, endpoint, data) => tryEndpoints(axios, endpoint, data, 'PUT'),
  delete: (axios, endpoint) => tryEndpoints(axios, endpoint, null, 'DELETE'),
};

const apiUtils = { tryEndpoints, apiCall };
export default apiUtils;
