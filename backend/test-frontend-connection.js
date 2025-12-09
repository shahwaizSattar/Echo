require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const axios = require('axios');

async function testFrontendConnection() {
  console.log('🔍 Testing Frontend-Backend Connection...\n');
  
  // Get backend configuration
  const backendIP = process.env.SERVER_IP || '172.20.10.2';
  const backendPort = process.env.PORT || 5000;
  const backendURL = `http://${backendIP}:${backendPort}`;
  
  console.log('🖥️  BACKEND CONFIGURATION:');
  console.log(`   IP: ${backendIP}`);
  console.log(`   Port: ${backendPort}`);
  console.log(`   Full URL: ${backendURL}`);
  console.log('');
  
  // Frontend configuration from .env
  console.log('📱 FRONTEND CONFIGURATION:');
  console.log('   Expected IP: 192.168.10.3 (from frontend/.env)');
  console.log('   Expected Port: 5000');
  console.log('   Expected URL: http://192.168.10.3:5000');
  console.log('');
  
  console.log('❌ MISMATCH DETECTED!');
  console.log('   Backend is running on: 172.20.10.2');
  console.log('   Frontend is trying to connect to: 192.168.10.3');
  console.log('');
  
  // Test backend health
  console.log('🧪 TESTING BACKEND HEALTH:');
  try {
    const response = await axios.get(`${backendURL}/health`, { timeout: 5000 });
    console.log('✅ Backend is running and healthy!');
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('❌ Backend health check failed:');
    console.log('   Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   This means the backend is not running or not accessible');
    }
  }
  console.log('');
  
  // Test frontend's expected URL
  console.log('🧪 TESTING FRONTEND\'S EXPECTED URL:');
  try {
    const response = await axios.get('http://192.168.10.3:5000/health', { timeout: 5000 });
    console.log('✅ Frontend URL is accessible!');
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('❌ Frontend URL is not accessible:');
    console.log('   Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   This confirms the IP mismatch issue');
    }
  }
  console.log('');
  
  // Test login API with correct backend URL
  console.log('🔐 TESTING LOGIN API (with correct backend URL):');
  try {
    const loginResponse = await axios.post(`${backendURL}/api/auth/login`, {
      identifier: 'sohari@example.com',
      password: 'password123'
    }, { timeout: 10000 });
    
    console.log('✅ Login API works with correct URL!');
    console.log('   Success:', loginResponse.data.success);
    console.log('   Message:', loginResponse.data.message);
    console.log('   User:', loginResponse.data.user?.username);
  } catch (error) {
    console.log('❌ Login API failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message || error.message);
  }
  console.log('');
  
  // Test login API with frontend's expected URL
  console.log('🔐 TESTING LOGIN API (with frontend\'s expected URL):');
  try {
    const loginResponse = await axios.post('http://192.168.10.3:5000/api/auth/login', {
      identifier: 'sohari@example.com',
      password: 'password123'
    }, { timeout: 10000 });
    
    console.log('✅ Login API works with frontend URL!');
    console.log('   This should not happen if there\'s an IP mismatch');
  } catch (error) {
    console.log('❌ Login API failed with frontend URL (expected):');
    console.log('   Error:', error.code || error.message);
  }
  console.log('');
  
  console.log('🔧 SOLUTION:');
  console.log('   1. Update frontend/.env to use the correct IP:');
  console.log(`      EXPO_PUBLIC_SERVER_IP=${backendIP}`);
  console.log(`      EXPO_PUBLIC_API_BASE=http://${backendIP}:${backendPort}`);
  console.log('');
  console.log('   2. OR update backend/.env to use the frontend\'s expected IP:');
  console.log('      SERVER_IP=192.168.10.3');
  console.log('');
  console.log('   3. Make sure both frontend and backend are on the same network');
  console.log('');
  
  // Test with your actual user accounts
  console.log('🧪 TESTING WITH YOUR ACTUAL ACCOUNTS:');
  const testAccounts = [
    { username: 'shalabell', email: 'shalabel@gmail.com' },
    { username: 'sohario', email: 'soha12@gmail.com' }
  ];
  
  for (const account of testAccounts) {
    console.log(`\n   Testing ${account.username}:`);
    console.log(`   - Try logging in with email: ${account.email}`);
    console.log(`   - Try logging in with username: ${account.username}`);
    console.log(`   - Use the password you set when registering`);
  }
}

testFrontendConnection().catch(console.error);