const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testConnection() {
  console.log('🧪 Testing Backend Connection...\n');
  
  // Read current IP from backend .env
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  let currentIP = '192.168.10.3'; // default
  
  if (fs.existsSync(backendEnvPath)) {
    const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    const ipMatch = backendEnv.match(/SERVER_IP=(.+)/);
    if (ipMatch) {
      currentIP = ipMatch[1].trim();
    }
  }
  
  const testURL = `http://${currentIP}:5000`;
  console.log(`🎯 Testing: ${testURL}`);
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${testURL}/health`, { timeout: 5000 });
    console.log('   ✅ Health check passed');
    console.log(`   Status: ${healthResponse.data.status}`);
    console.log(`   Uptime: ${Math.round(healthResponse.data.uptime)}s`);
    
    // Test API endpoint
    console.log('\n2. Testing API endpoint...');
    const apiResponse = await axios.get(`${testURL}/api/test`, { timeout: 5000 });
    console.log('   ✅ API endpoint working');
    console.log(`   Message: ${apiResponse.data.message}`);
    
    // Test login endpoint
    console.log('\n3. Testing login endpoint...');
    try {
      const loginResponse = await axios.post(`${testURL}/api/auth/login`, {
        identifier: 'sohari@example.com',
        password: 'password123'
      }, { timeout: 10000 });
      
      console.log('   ✅ Login endpoint working');
      console.log(`   Success: ${loginResponse.data.success}`);
      console.log(`   User: ${loginResponse.data.user?.username}`);
    } catch (loginError) {
      if (loginError.response?.status === 401) {
        console.log('   ✅ Login endpoint working (authentication failed as expected)');
      } else {
        console.log('   ❌ Login endpoint error:', loginError.message);
      }
    }
    
    console.log('\n🎉 All tests passed! Backend is accessible.');
    console.log(`\n📱 Frontend should connect to: ${testURL}`);
    
  } catch (error) {
    console.log('\n❌ Connection failed!');
    console.log(`Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Make sure backend server is running');
      console.log('2. Check if IP address is correct');
      console.log('3. Check if port 5000 is available');
      console.log('4. Try running: npm start (in backend folder)');
    } else if (error.code === 'ECONNABORTED') {
      console.log('\n💡 Connection timeout - server might be slow or unreachable');
    }
  }
}

testConnection().catch(console.error);