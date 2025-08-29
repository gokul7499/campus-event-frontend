// Test login functionality
import axios from './axios';

export const testLogin = async () => {
  try {
    console.log('🧪 Testing login functionality...');
    
    // Test login with default admin user
    const loginData = {
      email: 'admin@campus.edu',
      password: 'Admin123!'
    };
    
    console.log('📤 Sending login request...');
    const response = await axios.post('/api/auth/login', loginData);
    
    console.log('✅ Login response received:', {
      success: response.data.success,
      hasToken: !!response.data.token,
      hasUser: !!response.data.data?.user,
      userEmail: response.data.data?.user?.email,
      userRole: response.data.data?.user?.role
    });
    
    // Test getting user info
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      console.log('📤 Testing /me endpoint...');
      const meResponse = await axios.get('/api/auth/me');
      
      console.log('✅ User info received:', {
        success: meResponse.data.success,
        userEmail: meResponse.data.data?.user?.email,
        userRole: meResponse.data.data?.user?.role
      });
    }
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error('❌ Login test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return { success: false, error: error.message };
  }
};

// Run test if called directly
if (typeof window !== 'undefined' && window.testLogin) {
  window.testLogin = testLogin;
}
