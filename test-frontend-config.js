// Test script to verify frontend API configuration

// Simulate the getBaseURL function
const getBaseURL = () => {
  // Check environment variable
  const envBase = process.env.EXPO_PUBLIC_API_BASE;
  console.log('🔍 EXPO_PUBLIC_API_BASE:', envBase);
  
  if (envBase) {
    const result = envBase.endsWith('/api') ? envBase : `${envBase}/api`;
    console.log('✅ Using env variable:', result);
    return result;
  }

  console.log('⚠️ No env variable found, using defaults');
  
  // Development defaults per platform
  const YOUR_COMPUTER_IP = '172.20.10.2';

  // Simulate different platforms
  console.log('🌐 Testing different platforms:');
  console.log('  Web:', `http://localhost:5000/api`);
  console.log('  Android:', `http://10.0.2.2:5000/api`);
  console.log('  iOS:', `http://${YOUR_COMPUTER_IP}:5000/api`);
  
  return `http://${YOUR_COMPUTER_IP}:5000/api`;
};

console.log('🚀 Final API URL:', getBaseURL());