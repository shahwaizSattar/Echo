const axios = require('axios');

const userId = '6926aba9fb76b5ed6d711e65'; // sohari's user ID

async function testWhispers() {
  try {
    console.log('🔄 Testing API endpoint: http://localhost:5000/api/whisperwall/user/' + userId);
    
    const response = await axios.get(`http://localhost:5000/api/whisperwall/user/${userId}`);
    
    console.log('✅ API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n✅ Found', response.data.whispers?.length || 0, 'whispers');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testWhispers();
