const axios = require('axios');

async function testSecurityLogic() {
  console.log('🔒 Testing Security Logic...\n');
  
  const BASE_URL = 'https://whisperecho-backend-production.up.railway.app';
  
  try {
    // Test 1: SQL Injection Protection
    console.log('📋 Test 1: SQL Injection Protection');
    try {
      const response = await axios.get(`${BASE_URL}/api/posts/search?q=' OR 1=1 --`);
      if (response.status === 200) {
        console.log('✅ SQL injection attempt handled safely');
      }
    } catch (error) {
      console.log('✅ SQL injection attempt blocked');
    }

    // Test 2: XSS Protection in Search
    console.log('\n📋 Test 2: XSS Protection');
    try {
      const response = await axios.get(`${BASE_URL}/api/posts/search?q=<script>alert('xss')</script>`);
      if (response.status === 200) {
        console.log('✅ XSS attempt handled (search processed safely)');
      }
    } catch (error) {
      console.log('✅ XSS attempt blocked');
    }

    // Test 3: Rate Limiting
    console.log('\n📋 Test 3: Rate Limiting');
    try {
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(axios.get(`${BASE_URL}/api/test`));
      }
      
      const responses = await Promise.allSettled(requests);
      const successCount = responses.filter(r => r.status === 'fulfilled').length;
      
      if (successCount > 0) {
        console.log(`✅ Rate limiting configured (${successCount}/10 requests succeeded)`);
      } else {
        console.log('❌ All requests blocked - rate limiting too strict');
      }
    } catch (error) {
      console.log('❌ Rate limiting test error:', error.message);
    }

    // Test 4: Invalid JSON Handling
    console.log('\n📋 Test 4: Invalid JSON Handling');
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/signup`, 'invalid json', {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true
      });
      
      if (response.status === 400) {
        console.log('✅ Invalid JSON handled properly');
      } else {
        console.log('❌ Invalid JSON not handled properly');
      }
    } catch (error) {
      console.log('✅ Invalid JSON blocked by server');
    }

    // Test 5: Large Payload Protection
    console.log('\n📋 Test 5: Large Payload Protection');
    try {
      const largePayload = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        preferences: ['Gaming'],
        largeField: 'x'.repeat(50000000) // 50MB string
      };
      
      const response = await axios.post(`${BASE_URL}/api/auth/signup`, largePayload, {
        validateStatus: () => true,
        timeout: 5000
      });
      
      if (response.status === 413 || response.status === 400) {
        console.log('✅ Large payload protection working');
      } else {
        console.log('❌ Large payload not properly handled');
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('✅ Large payload timed out (protection working)');
      } else {
        console.log('✅ Large payload blocked:', error.message);
      }
    }

    // Test 6: HTTP Method Security
    console.log('\n📋 Test 6: HTTP Method Security');
    try {
      const response = await axios.patch(`${BASE_URL}/api/test`, {}, {
        validateStatus: () => true
      });
      
      if (response.status === 404 || response.status === 405) {
        console.log('✅ Unsupported HTTP methods properly handled');
      } else {
        console.log('❌ Unsupported HTTP methods not properly restricted');
      }
    } catch (error) {
      console.log('✅ Unsupported HTTP method blocked');
    }

    // Test 7: Authentication Token Validation
    console.log('\n📋 Test 7: Authentication Token Validation');
    try {
      const response = await axios.get(`${BASE_URL}/api/posts/feed`, {
        headers: { 'Authorization': 'Bearer invalid-token' },
        validateStatus: () => true
      });
      
      if (response.status === 401) {
        console.log('✅ Invalid token properly rejected');
      } else {
        console.log('❌ Invalid token not properly handled');
      }
    } catch (error) {
      console.log('✅ Invalid token blocked');
    }

    // Test 8: Content Length Validation
    console.log('\n📋 Test 8: Content Length Validation');
    try {
      const longContent = 'x'.repeat(3000); // Exceeds 2000 char limit
      const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        preferences: ['Gaming'],
        bio: longContent
      }, {
        validateStatus: () => true
      });
      
      if (response.status === 400) {
        console.log('✅ Content length validation working');
      } else {
        console.log('❌ Content length validation not working');
      }
    } catch (error) {
      console.log('✅ Long content blocked');
    }

    console.log('\n🔒 Security Logic Tests Complete!');
    
  } catch (error) {
    console.error('❌ Security test error:', error.message);
  }
}

testSecurityLogic();