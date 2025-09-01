import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from '../utils/axios';
import config from '../config/config';
import { apiCall } from '../utils/apiEndpoints';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_PROFILE_SUCCESS: 'UPDATE_PROFILE_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
    case AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Token is automatically handled by axios interceptor

  // Load user on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('🔐 Initializing auth, token exists:', !!token);
      
      if (token) {
        try {
          console.log('🔄 Loading user with existing token...');
          await loadUser();
          console.log('✅ User loaded successfully');
        } catch (error) {
          console.error('❌ Failed to load user:', error);
          // Only remove token if it's definitely invalid
          if (error.response?.status === 401) {
            console.log('🚫 Token expired, removing from localStorage');
            localStorage.removeItem('token');
            dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: 'Token expired' });
          } else {
            dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: 'Failed to load user' });
          }
        }
      } else {
        console.log('ℹ️ No token found, user not authenticated');
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: 'No token found' });
      }
    };

    initializeAuth();
  }, []); // Remove dependency on state.token to prevent infinite loops

  // Load user
  const loadUser = async () => {
    dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
    
    try {
      const response = await apiCall.get(axios, config.api.endpoints.auth.me);
      
      if (response.data.success && response.data.data.user) {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: response.data.data
        });
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Load user error:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: 'Token expired, please login again'
        });
      } else if (error.response?.status >= 500) {
        // Server error, don't remove token
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: 'Server error, please try again later'
        });
      } else {
        // Other errors
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: error.response?.data?.message || 'Failed to load user'
        });
      }
      
      // Re-throw the error so the calling function can handle it
      throw error;
    }
  };

  // Login
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await apiCall.post(axios, config.api.endpoints.auth.login, { email, password });
      
      // Validate response format
      if (response.data.success && response.data.token && response.data.data?.user) {
        // Store token first
        localStorage.setItem('token', response.data.token);
        
        // Update state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            token: response.data.token,
            user: response.data.data.user
          }
        });
        
        return { success: true };
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Register
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      console.log('🚀 Attempting registration with data:', userData);
      console.log('🔗 Using endpoint:', config.api.endpoints.auth.register);
      console.log('🌐 Full URL will be:', `${config.api.baseURL}${config.api.endpoints.auth.register}`);
      
      const response = await apiCall.post(axios, config.api.endpoints.auth.register, userData);
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: {
          token: response.data.token,
          user: response.data.data.user
        }
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      let errorMessage = 'Registration failed';
      
      if (error.response?.status === 404) {
        errorMessage = 'Backend service not available. Please try again later.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post(config.api.endpoints.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(config.api.endpoints.auth.updateProfile, profileData);
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS,
        payload: response.data.data
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      const response = await axios.put(config.api.endpoints.auth.updatePassword, passwordData);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          token: response.data.token,
          user: response.data.data.user
        }
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await axios.post(config.api.endpoints.auth.forgotPassword, { email });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      const response = await axios.put(`${config.api.endpoints.auth.resetPassword}/${token}`, { password });
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          token: response.data.token,
          user: response.data.data.user
        }
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Validate token
  const validateToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const response = await axios.get(config.api.endpoints.auth.me);
      return response.data.success && response.data.data.user;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        return false;
      }
      return false;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(state.token && state.user);
  };

  // Get user role
  const getUserRole = () => {
    return state.user?.role;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return state.user?.permissions?.includes(permission);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    clearError,
    hasPermission,
    hasRole,
    loadUser,
    validateToken,
    isAuthenticated,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
