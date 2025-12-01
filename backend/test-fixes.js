const axios = require('axios');

async function testFixes() {
  console.log('🔧 Testing Backend Fixes...\n');
  
  const BASE_URL = 'https://whisperecho-backend-production.up.railway.app';
  
  try {
    // Test 1: JWT Error Handling Fix
    console.log('📋 Test 1: JWT Error Handling Fix');
    try {
      const response = await axios.get(`${BASE_URL}/api/posts/feed`, {
        headers: { 'Authorization': 'Bearer invalid-jwt-token' },
        validateStatus: () => true
      });
      
      if (response.status === 401) {
        console.log('✅ JWT error handling fixed - returns 401 for invalid token');
      } else {
        console.log(`❌ JWT error handling not fixed - returns ${response.status}`);
      }
    } catch (error) {
      console.log('❌ JWT test error:', error.message);
    }

    // Test 2: Content Length Validation
    console.log('\n📋 Test 2: Content Length Validation');
    try {
      const longBio = 'x'.repeat(600); // Exceeds 500 char limit
      const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        preferences: ['Gaming'],
        bio: longBio
      }, {
        validateStatus: () => true
      });
      
      if (response.status === 400 && response.data.message.includes('Validation failed')) {
        console.log('✅ Content length validation working');
      } else {
        console.log('❌ Content length validation not working');
      }
    } catch (error) {
      console.log('❌ Content validation test error:', error.message);
    }

    // Test 3: Input Sanitization
    console.log('\n📋 Test 3: Input Sanitization');
    try {
      const xssPayload = '<script>alert("xss")</script>Hello World';
      const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
        email: 'xss@test.com',
        password: 'password123',
        username: 'xsstest',
        preferences: ['Gaming'],
        bio: xssPayload
      }, {
        validateStatus: () => true
      });
      
      // Should either sanitize or reject
      if (response.status === 400 || (response.status === 201 && !response.data.user?.bio?.includes('<script>'))) {
        console.log('✅ Input sanitization working');
      } else {
        console.log('❌ Input sanitization not working');
      }
    } catch (error) {
      console.log('❌ Sanitization test error:', error.message);
    }

    // Test 4: Category Validation
    console.log('\n📋 Test 4: Enhanced Category Validation');
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
        email: 'category@test.com',
        password: 'password123',
        username: 'categorytest',
        preferences: ['InvalidCategory', 'Gaming']
      }, {
        validateStatus: () => true
      });
      
      if (response.status === 400) {
        console.log('✅ Enhanced category validation working');
      } else {
        console.log('❌ Enhanced category validation not working');
      }
    } catch (error) {
      console.log('❌ Category validation test error:', error.message);
    }

    console.log('\n🎯 Fix Tests Complete!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testFixes();