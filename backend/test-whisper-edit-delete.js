const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials - replace with your actual test user
const TEST_USER = {
  username: 'uiuuii',
  password: 'your_password_here' // Replace with actual password
};

let authToken = '';
let testWhisperId = '';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    authToken = response.data.token;
    console.log('✅ Login successful');
    console.log('   Token:', authToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function createTestWhisper() {
  try {
    console.log('\n📝 Creating test whisper...');
    const response = await axios.post(
      `${BASE_URL}/whisperwall`,
      {
        content: { text: 'Test whisper for edit/delete - ' + Date.now() },
        category: 'Random',
        tags: ['test'],
        backgroundAnimation: 'none',
        vanishMode: { enabled: false },
        oneTime: { enabled: false }
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    testWhisperId = response.data.whisper._id;
    console.log('✅ Whisper created');
    console.log('   ID:', testWhisperId);
    console.log('   Text:', response.data.whisper.content.text);
    console.log('   Category:', response.data.whisper.category);
    return true;
  } catch (error) {
    console.error('❌ Create whisper failed:', error.response?.data || error.message);
    return false;
  }
}

async function testEditWhisper() {
  try {
    console.log('\n✏️ Testing edit whisper...');
    const response = await axios.put(
      `${BASE_URL}/whisperwall/${testWhisperId}`,
      {
        content: { text: 'EDITED: This whisper has been updated!' },
        category: 'Advice'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Whisper edited successfully');
    console.log('   New text:', response.data.whisper.content.text);
    console.log('   New category:', response.data.whisper.category);
    return true;
  } catch (error) {
    console.error('❌ Edit whisper failed:', error.response?.data || error.message);
    console.error('   Status:', error.response?.status);
    console.error('   Headers sent:', error.config?.headers);
    return false;
  }
}

async function testDeleteWhisper() {
  try {
    console.log('\n🗑️ Testing delete whisper...');
    const response = await axios.delete(
      `${BASE_URL}/whisperwall/${testWhisperId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Whisper deleted successfully');
    console.log('   Message:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Delete whisper failed:', error.response?.data || error.message);
    console.error('   Status:', error.response?.status);
    return false;
  }
}

async function testUnauthorizedEdit() {
  try {
    console.log('\n🔒 Testing unauthorized edit (should fail)...');
    const response = await axios.put(
      `${BASE_URL}/whisperwall/${testWhisperId}`,
      {
        content: { text: 'Trying to edit without auth' },
        category: 'Random'
      }
      // No auth header
    );
    
    console.log('❌ SECURITY ISSUE: Edit succeeded without auth!');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Unauthorized edit correctly blocked');
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data.message);
      return true;
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function runTests() {
  console.log('🧪 Starting Whisper Edit/Delete Tests\n');
  console.log('=' .repeat(50));
  
  // Step 1: Login
  if (!await login()) {
    console.log('\n❌ Tests aborted: Login failed');
    console.log('   Please update TEST_USER credentials in the script');
    return;
  }
  
  // Step 2: Create test whisper
  if (!await createTestWhisper()) {
    console.log('\n❌ Tests aborted: Could not create test whisper');
    return;
  }
  
  // Step 3: Test edit
  const editSuccess = await testEditWhisper();
  
  // Step 4: Test unauthorized edit (create new whisper first)
  if (editSuccess) {
    await createTestWhisper(); // Create another one for unauthorized test
    await testUnauthorizedEdit();
  }
  
  // Step 5: Test delete
  await testDeleteWhisper();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Tests completed\n');
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test suite error:', error);
});
