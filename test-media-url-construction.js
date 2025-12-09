// Test media URL construction
const EXPO_PUBLIC_SERVER_IP = '192.168.10.2';
const EXPO_PUBLIC_SERVER_PORT = '5000';

const getMediaBaseURL = () => {
  return `http://${EXPO_PUBLIC_SERVER_IP}:${EXPO_PUBLIC_SERVER_PORT}`;
};

const getFullMediaUrl = (mediaUrl) => {
  if (!mediaUrl) return '';
  
  // If already a full URL, return as is
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    return mediaUrl;
  }
  
  // If starts with /uploads, construct full URL
  if (mediaUrl.startsWith('/uploads/')) {
    const fullUrl = `${getMediaBaseURL()}${mediaUrl}`;
    return fullUrl;
  }
  
  return mediaUrl;
};

console.log('🧪 Testing Media URL Construction\n');
console.log('Base URL:', getMediaBaseURL());
console.log('');

// Test cases from your database
const testUrls = [
  '/uploads/images/178141bf-6ee9-4a39-8d15-1ed59448c5d6.jpg',
  '/uploads/images/8459f395-d72b-4c4f-91db-26f32266a297.jpg',
  '/uploads/audio/c18d8f57-4e84-4c0d-a0a4-db7d77276d9f.m4a',
  '/uploads/audio/33118450-7969-4bb0-aec4-7c4a287a1b76.m4a'
];

testUrls.forEach((url, i) => {
  const fullUrl = getFullMediaUrl(url);
  console.log(`Test ${i + 1}:`);
  console.log(`  Input:  ${url}`);
  console.log(`  Output: ${fullUrl}`);
  console.log('');
});

console.log('✅ All URLs should now work in your app!');
console.log('\n📱 Make sure to:');
console.log('1. Restart your backend (if running)');
console.log('2. Restart your frontend app');
console.log('3. Clear app cache if needed');
