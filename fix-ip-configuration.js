const fs = require('fs');
const path = require('path');

function fixIPConfiguration() {
  console.log('🔧 Fixing IP Configuration...\n');
  
  // Read current backend .env
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
  
  console.log('📖 Current Configuration:');
  
  // Read backend .env
  if (fs.existsSync(backendEnvPath)) {
    const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    const serverIPMatch = backendEnv.match(/SERVER_IP=(.+)/);
    const currentBackendIP = serverIPMatch ? serverIPMatch[1] : 'Not set';
    console.log(`   Backend IP: ${currentBackendIP}`);
  }
  
  // Read frontend .env
  if (fs.existsSync(frontendEnvPath)) {
    const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    const serverIPMatch = frontendEnv.match(/EXPO_PUBLIC_SERVER_IP=(.+)/);
    const currentFrontendIP = serverIPMatch ? serverIPMatch[1] : 'Not set';
    console.log(`   Frontend IP: ${currentFrontendIP}`);
  }
  
  console.log('\n🎯 Solution: Use the working IP (192.168.10.3) for both\n');
  
  // Update backend .env
  if (fs.existsSync(backendEnvPath)) {
    let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    
    // Update SERVER_IP
    if (backendEnv.includes('SERVER_IP=')) {
      backendEnv = backendEnv.replace(/SERVER_IP=.+/, 'SERVER_IP=192.168.10.3');
    } else {
      backendEnv += '\nSERVER_IP=192.168.10.3';
    }
    
    fs.writeFileSync(backendEnvPath, backendEnv);
    console.log('✅ Updated backend/.env with SERVER_IP=192.168.10.3');
  }
  
  // Update frontend .env
  if (fs.existsSync(frontendEnvPath)) {
    let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    
    // Update all IP references
    frontendEnv = frontendEnv.replace(/EXPO_PUBLIC_SERVER_IP=.+/, 'EXPO_PUBLIC_SERVER_IP=192.168.10.3');
    frontendEnv = frontendEnv.replace(/EXPO_PUBLIC_API_BASE=.+/, 'EXPO_PUBLIC_API_BASE=http://192.168.10.3:5000');
    
    fs.writeFileSync(frontendEnvPath, frontendEnv);
    console.log('✅ Updated frontend/.env with correct IP configuration');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Restart your backend server');
  console.log('2. Restart your frontend/mobile app');
  console.log('3. Try logging in with:');
  console.log('   - Email: shalabel@gmail.com or soha12@gmail.com');
  console.log('   - Username: shalabell or sohario');
  console.log('   - Password: [your registration password]');
  console.log('\n4. For dummy data, try:');
  console.log('   - Email: sohari@example.com');
  console.log('   - Password: password123');
}

fixIPConfiguration();