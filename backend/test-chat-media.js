const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual token

// Test media upload
async function testMediaUpload() {
  console.log('🧪 Testing media upload...');
  
  try {
    // Create a simple test file
    const testFilePath = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for media upload');
    
    const formData = new FormData();
    formData.append('media', fs.createReadStream(testFilePath), {
      filename: 'test-image.txt',
      contentType: 'text/plain'
    });
    
    const response = await axios.post(`${BASE_URL}/upload/single`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    console.log('✅ Upload successful:', response.data);
    
    // Clean up
    fs.unlinkSync(testFilePath);
    
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
  }
}

// Test chat message with media
async function testChatMessage() {
  console.log('🧪 Testing chat message...');
  
  try {
    const response = await axios.post(`${BASE_URL}/chat/messages/test-peer-id`, {
      text: 'Test message',
      media: [{
        url: '/uploads/images/test.jpg',
        type: 'image',
        filename: 'test.jpg',
        originalName: 'test.jpg',
        size: 1024
      }]
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Chat message successful:', response.data);
    
  } catch (error) {
    console.error('❌ Chat message failed:', error.response?.data || error.message);
  }
}

// Test server health
async function testServerHealth() {
  console.log('🧪 Testing server health...');
  
  try {
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Server is healthy:', response.data);
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting chat media tests...\n');
  
  await testServerHealth();
  console.log('');
  
  await testMediaUpload();
  console.log('');
  
  // Note: This will fail without proper authentication
  // await testChatMessage();
  
  console.log('🏁 Tests completed!');
}

if (require.main === module) {
  runTests();
}

module.exports = { testMediaUpload, testChatMessage, testServerHealth };