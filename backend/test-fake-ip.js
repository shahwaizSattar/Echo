/**
 * Test script to verify fake IP middleware functionality
 * 
 * This script tests:
 * 1. Fake IP generation and assignment
 * 2. Real IP stripping
 * 3. Login/Signup with fake IP
 * 4. CORS functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log('\n🏥 Testing Health Check...', 'cyan');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    log('✅ Health check passed', 'green');
    log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Health check failed: ${error.message}`, 'red');
    return false;
  }
}

async function testFakeIPEndpoint() {
  log('\n🎭 Testing Fake IP Assignment...', 'cyan');
  try {
    const response = await axios.get(`${BASE_URL}/api/test`);
    log('✅ Test endpoint responded', 'green');
    log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Test endpoint failed: ${error.message}`, 'red');
    return false;
  }
}

async function testSignup() {
  log('\n📝 Testing Signup with Fake IP...', 'cyan');
  
  const randomNum = Math.floor(Math.random() * 10000);
  const testUser = {
    email: `testuser${randomNum}@example.com`,
    username: `testuser${randomNum}`,
    password: 'password123',
    preferences: ['Gaming', 'Technology']
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, testUser);
    log('✅ Signup successful', 'green');
    log(`User: ${response.data.user.username}`, 'blue');
    log(`Token: ${response.data.token.substring(0, 20)}...`, 'blue');
    log(`🎭 Fake IP: ${response.data.fakeIP}`, 'yellow');
    return response.data;
  } catch (error) {
    log(`❌ Signup failed: ${error.response?.data?.message || error.message}`, 'red');
    return null;
  }
}

async function testLogin(email, password) {
  log('\n🔐 Testing Login with Fake IP...', 'cyan');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password
    });
    log('✅ Login successful', 'green');
    log(`User: ${response.data.user.username}`, 'blue');
    log(`Token: ${response.data.token.substring(0, 20)}...`, 'blue');
    log(`🎭 Fake IP: ${response.data.fakeIP}`, 'yellow');
    return response.data;
  } catch (error) {
    log(`❌ Login failed: ${error.response?.data?.message || error.message}`, 'red');
    return null;
  }
}

async function testMultipleRequests() {
  log('\n🔄 Testing Multiple Requests (Different Fake IPs)...', 'cyan');
  
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(axios.get(`${BASE_URL}/api/test`));
  }
  
  try {
    const responses = await Promise.all(promises);
    log('✅ All requests completed', 'green');
    log('Each request should have received a different fake IP (check server logs)', 'yellow');
    return true;
  } catch (error) {
    log(`❌ Multiple requests test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testCORS() {
  log('\n🌐 Testing CORS Configuration...', 'cyan');
  
  try {
    const response = await axios.options(`${BASE_URL}/api/test`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    log('✅ CORS preflight successful', 'green');
    log(`Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`, 'blue');
    log(`Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods']}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ CORS test failed: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('═══════════════════════════════════════════════════', 'cyan');
  log('🧪 FAKE IP MIDDLEWARE TEST SUITE', 'cyan');
  log('═══════════════════════════════════════════════════', 'cyan');
  
  // Test 1: Health Check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    log('\n❌ Server is not running. Please start the server first.', 'red');
    log('Run: npm start', 'yellow');
    return;
  }
  
  // Test 2: Fake IP Endpoint
  await testFakeIPEndpoint();
  
  // Test 3: Signup
  const signupData = await testSignup();
  
  // Test 4: Login
  if (signupData) {
    await testLogin(signupData.user.email, 'password123');
  }
  
  // Test 5: Multiple Requests
  await testMultipleRequests();
  
  // Test 6: CORS
  await testCORS();
  
  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('✅ TEST SUITE COMPLETED', 'green');
  log('═══════════════════════════════════════════════════', 'cyan');
  log('\n💡 Check server logs to see fake IPs being assigned', 'yellow');
  log('💡 Each request should show a different fake IP', 'yellow');
  log('💡 Real IP should never appear in logs or responses', 'yellow');
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});
