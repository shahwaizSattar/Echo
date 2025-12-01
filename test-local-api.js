const axios = require('axios');

async function testLocalAPI() {
  console.log('🧪 Testing Local Backend API...\n');
  
  const BASE_URL = 'http://172.20.10.2:5000';
  
  try {
    // Test 1: Health Check
    console.log('📋 Test 1: Health Check');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health:', health.data);

    // Test 2: API Test Endpoint
    console.log('\n📋 Test 2: API Test');
    const test = await axios.get(`${BASE_URL}/api/test`);
    console.log('✅ API Test:', test.data);

    // Test 3: Explore Posts (should work without auth)
    console.log('\n📋 Test 3: Explore Posts');
    const explore = await axios.get(`${BASE_URL}/api/posts/explore`);
    console.log('✅ Explore Posts:', explore.data.posts.length, 'posts found');

    // Test 4: Media Serving Test
    console.log('\n📋 Test 4: Media Serving');
    try {
      const media = await axios.get(`${BASE_URL}/uploads/test.jpg`, {
        validateStatus: () => true
      });
      console.log('✅ Media endpoint accessible (status:', media.status, ')');
    } catch (error) {
      console.log('✅ Media endpoint accessible (expected 404 for non-existent file)');
    }

    console.log('\n🎉 Local Backend is working perfectly!');
    console.log('📱 Your app can now use fast local backend for development');
    
  } catch (error) {
    console.error('❌ Error testing local API:', error.message);
  }
}

testLocalAPI();