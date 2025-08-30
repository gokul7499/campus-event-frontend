// Authentication Test Utility
// Use this in browser console to test authentication flow

export const testAuth = {
  // Check current authentication state
  checkState: () => {
    const token = localStorage.getItem('token');
    console.log('🔐 Current Auth State:');
    console.log('Token exists:', !!token);
    console.log('Token value:', token ? `${token.substring(0, 20)}...` : 'None');
    console.log('LocalStorage keys:', Object.keys(localStorage));
  },

  // Test token validation
  testToken: async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Token Test Result:');
      console.log('Status:', response.status);
      console.log('Response:', await response.json());
      
      return response.ok;
    } catch (error) {
      console.error('❌ Token test failed:', error);
      return false;
    }
  },

  // Clear authentication
  clearAuth: () => {
    localStorage.removeItem('token');
    console.log('🧹 Authentication cleared');
  },

  // Simulate login (for testing)
  simulateLogin: (testToken = 'test-token-123') => {
    localStorage.setItem('token', testToken);
    console.log('🎭 Simulated login with test token');
  }
};

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  window.testAuth = testAuth;
}
