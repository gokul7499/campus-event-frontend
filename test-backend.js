// Test Backend Connectivity from Frontend
const testBackend = async () => {
  const BASE_URL = 'https://campus-event-backend.onrender.com';
  
  console.log('🧪 Testing Backend Connectivity...\n');
  console.log(`📍 Backend URL: ${BASE_URL}\n`);

  const tests = [
    {
      name: 'Health Check',
      url: '/api/health',
      method: 'GET'
    },
    {
      name: 'Test Endpoint',
      url: '/api/test',
      method: 'GET'
    },
    {
      name: 'Auth Register',
      url: '/api/auth/register',
      method: 'POST',
      data: { test: true }
    },
    {
      name: 'Auth Login',
      url: '/api/auth/login',
      method: 'POST',
      data: { test: true }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      console.log(`📝 ${test.method} ${test.url}`);
      
      const response = await fetch(`${BASE_URL}${test.url}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        },
        ...(test.data && { body: JSON.stringify(test.data) })
      });
      
      console.log(`✅ Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 Response:`, data);
      } else {
        const errorData = await response.json();
        console.log(`❌ Error Response:`, errorData);
      }
      
      console.log('─'.repeat(50));
      
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
      console.log('─'.repeat(50));
    }
  }
};

// Run tests if in browser
if (typeof window !== 'undefined') {
  window.testBackend = testBackend;
  console.log('🧪 Backend test function available as: window.testBackend()');
} else {
  // Node.js environment
  testBackend().catch(console.error);
}
