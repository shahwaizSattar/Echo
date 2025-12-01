// Test connection to backend API
const axios = require('axios');

const testConnection = async () => {
  const baseUrl = 'http://172.20.10.2:5000';
  
  console.log('🔍 Testing backend connection...');
  console.log('📍 Base URL:', baseUrl);
  
  try {
    // Test health endpoint
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test API endpoint
    console.log('\n2️⃣ Testing API endpoint...');
    const apiResponse = await axios.post(`${baseUrl}/api/auth/verify-token`, 
      { token: 'test' }, 
      { 
        timeout: 5000,
        validateStatus: () => true // Accept any status code
      }
    );
    console.log('✅ API endpoint accessible:', apiResponse.data);
    
    console.log('\n🎉 Backend is accessible! Your frontend should be able to connect.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: npm run dev (in backend folder)');
    console.log('2. Check if IP address is correct: ipconfig');
    console.log('3. Check firewall settings');
  }
};

testConnection();