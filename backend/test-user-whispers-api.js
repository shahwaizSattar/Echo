// Test the user whispers API endpoint
const axios = require('axios');

const userId = '6925c9085cac41571559e1fa'; // Your user ID
const apiUrl = `http://localhost:5000/api/whisperwall/user/${userId}`;

console.log('🔄 Testing API endpoint:', apiUrl);

axios.get(apiUrl)
  .then(response => {
    console.log('✅ API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log(`\n✅ Found ${response.data.whispers?.length || 0} whispers`);
  })
  .catch(error => {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('❌ Response:', error.response.data);
    }
  });
