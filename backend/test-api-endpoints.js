const axios = require('axios');

// Test API endpoints
async function testAPIEndpoints() {
  console.log('🌐 Testing API Endpoints...\n');
  
  const BASE_URL = 'https://whisperecho-backend-production.up.railway.app';
  
  try {
    // Test 1: Health Check
    console.log('📋 Test 1: Health Check');
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      if (response.status === 200 && response.data.status === 'OK') {
        console.log('✅ Health check passed');
      } else {
        console.log('❌ Health check failed');
      }
    } catch (error) {
      console.log('❌ Health check error:', error.message);
    }

    // Test 2: Test Endpoint
    console.log('\n📋 Test 2: Test Endpoint');
    try {
      const response = await axios.get(`${BASE_URL}/api/test`);
      if (response.status === 200 && response.data.success) {
        console.log('✅ Test endpoint passed');
      } else {
        console.log('❌ Test endpoint failed');
      }
    } catch (error) {
      console.log('❌ Test endpoint error:', error.message);
    }

    // Test 3: Auth Signup (with invalid data)
    console.log('\n📋 Test 3: Auth Validation');
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
        email: 'invalid-email',
        password: '123', // Too short
        username: 'ab', // Too short
        preferences: []
      });
      console.log('❌ Validation should have failed');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Auth validation working - rejected invalid data');
      } else {
        console.log('❌ Unexpected auth error:', error.message);
      }
    }

    // Test 4: Posts Feed (without auth)
    console.log('\n📋 Test 4: Posts Feed (Unauthorized)');
    try {
      const response = await axios.get(`${BASE_URL}/api/posts/feed`);
      console.log('❌ Should require authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Authentication protection working');
      } else {
        console.log('❌ Unexpected feed error:', error.message);
      }
    }

    // Test 5: Explore Posts (public)
    console.log('\n📋 Test 5: Explore Posts (Public)');
    try {
      const response = await axios.get(`${BASE_URL}/api/posts/explore`);
      if (response.status === 200 && response.data.success) {
        console.log('✅ Explore posts endpoint working');
        console.log(`📊 Found ${response.data.posts.length} posts`);
      } else {
        console.log('❌ Explore posts failed');
      }
    } catch (error) {
      console.log('❌ Explore posts error:', error.message);
    }

    // Test 6: Search Posts (public)
    console.log('\n📋 Test 6: Search Posts');
    try {
      const response = await axios.get(`${BASE_URL}/api/posts/search?q=test`);
      if (response.status === 200 && response.data.success) {
        console.log('✅ Search posts endpoint working');
        console.log(`📊 Found ${response.data.posts.length} posts for "test"`);
      } else {
        console.log('❌ Search posts failed');
      }
    } catch (error) {
      console.log('❌ Search posts error:', error.message);
    }

    // Test 7: Invalid Search Query
    console.log('\n📋 Test 7: Invalid Search Query');
    try {
      const response = await axios.get(`${BASE_URL}/api/posts/search?q=`);
      console.log('❌ Should reject empty search query');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Search validation working - rejected empty query');
      } else {
        console.log('❌ Unexpected search error:', error.message);
      }
    }

    // Test 8: CORS Headers
    console.log('\n📋 Test 8: CORS Headers');
    try {
      const response = await axios.options(`${BASE_URL}/api/test`);
      const corsHeader = response.headers['access-control-allow-origin'];
      if (corsHeader === '*') {
        console.log('✅ CORS headers configured correctly');
      } else {
        console.log('❌ CORS headers missing or incorrect');
      }
    } catch (error) {
      console.log('❌ CORS test error:', error.message);
    }

    // Test 9: Media Serving
    console.log('\n📋 Test 9: Media Serving');
    try {
      const response = await axios.get(`${BASE_URL}/uploads/test.jpg`, {
        validateStatus: () => true // Don't throw on 404
      });
      
      if (response.status === 404) {
        console.log('✅ Media serving endpoint accessible (404 expected for non-existent file)');
      } else if (response.status === 200) {
        console.log('✅ Media serving working (found test file)');
      } else {
        console.log(`❌ Unexpected media response: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Media serving error:', error.message);
    }

    console.log('\n🎯 API Endpoint Tests Complete!');
    
  } catch (error) {
    console.error('❌ Test setup error:', error.message);
  }
}

// Run tests
testAPIEndpoints();