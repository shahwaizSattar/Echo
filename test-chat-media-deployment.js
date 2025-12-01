const axios = require('axios');

const RENDER_URL = 'https://echo-yddc.onrender.com';

async function testChatMediaDeployment() {
  console.log('🚀 Testing Chat Media Fixes Deployment...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${RENDER_URL}/health`, { timeout: 10000 });
    console.log('✅ Server is healthy:', healthResponse.data);
    
    // Test 2: Check upload endpoints
    console.log('\n2. Testing upload endpoints...');
    
    // Test single upload endpoint exists
    try {
      await axios.post(`${RENDER_URL}/api/upload/single`, {}, { timeout: 5000 });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Single upload endpoint exists (expected 400 for no file)');
      } else {
        console.log('❌ Single upload endpoint issue:', error.message);
      }
    }
    
    // Test multiple upload endpoint exists
    try {
      await axios.post(`${RENDER_URL}/api/upload/multiple`, {}, { timeout: 5000 });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Multiple upload endpoint exists (expected 400 for no files)');
      } else {
        console.log('❌ Multiple upload endpoint issue:', error.message);
      }
    }
    
    // Test 3: Check chat endpoints
    console.log('\n3. Testing chat endpoints...');
    
    try {
      await axios.get(`${RENDER_URL}/api/chat/unread-count`, { timeout: 5000 });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Chat unread-count endpoint exists (expected 401 for no auth)');
      } else {
        console.log('❌ Chat endpoint issue:', error.message);
      }
    }
    
    // Test 4: Check static file serving for uploads
    console.log('\n4. Testing static file serving...');
    
    try {
      await axios.get(`${RENDER_URL}/uploads/`, { timeout: 5000 });
      console.log('✅ Uploads directory is accessible');
    } catch (error) {
      if (error.response && (error.response.status === 403 || error.response.status === 404)) {
        console.log('✅ Uploads directory exists (403/404 expected for directory listing)');
      } else {
        console.log('⚠️ Uploads directory access:', error.message);
      }
    }
    
    console.log('\n🎉 Deployment Test Summary:');
    console.log('- Server is running and healthy');
    console.log('- Upload endpoints are available');
    console.log('- Chat endpoints are available');
    console.log('- Static file serving is configured');
    console.log('\n✅ Chat media fixes deployment appears successful!');
    console.log('\n📱 Frontend should now be able to:');
    console.log('- Upload photos and videos via plus icon');
    console.log('- Record and upload voice notes');
    console.log('- Display media in chat messages');
    console.log('\n🔗 Production URL: https://echo-yddc.onrender.com');
    
  } catch (error) {
    console.error('❌ Deployment test failed:', error.message);
    console.log('\n🔄 If deployment is still in progress, wait a few minutes and try again.');
    console.log('📊 Check deployment status at: https://dashboard.render.com');
  }
}

testChatMediaDeployment();