const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return '192.168.1.100'; // fallback
}

function changeIP(newIP) {
  console.log(`🔄 Changing IP configuration to: ${newIP}\n`);
  
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
  
  // Update backend/.env
  if (fs.existsSync(backendEnvPath)) {
    let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    
    // Update SERVER_IP
    if (backendEnv.includes('SERVER_IP=')) {
      backendEnv = backendEnv.replace(/SERVER_IP=.+/, `SERVER_IP=${newIP}`);
    } else {
      backendEnv += `\nSERVER_IP=${newIP}`;
    }
    
    fs.writeFileSync(backendEnvPath, backendEnv);
    console.log(`✅ Updated backend/.env:`);
    console.log(`   SERVER_IP=${newIP}`);
  } else {
    console.log('❌ backend/.env not found');
  }
  
  // Update frontend/.env
  if (fs.existsSync(frontendEnvPath)) {
    let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    
    // Update all IP references
    frontendEnv = frontendEnv.replace(/EXPO_PUBLIC_SERVER_IP=.+/, `EXPO_PUBLIC_SERVER_IP=${newIP}`);
    frontendEnv = frontendEnv.replace(/EXPO_PUBLIC_API_BASE=.+/, `EXPO_PUBLIC_API_BASE=http://${newIP}:5000`);
    
    fs.writeFileSync(frontendEnvPath, frontendEnv);
    console.log(`✅ Updated frontend/.env:`);
    console.log(`   EXPO_PUBLIC_SERVER_IP=${newIP}`);
    console.log(`   EXPO_PUBLIC_API_BASE=http://${newIP}:5000`);
  } else {
    console.log('❌ frontend/.env not found');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Restart your backend server');
  console.log('2. Restart your frontend/mobile app');
  console.log('3. Test connection with: node test-connection.js');
}

// Get command line argument or auto-detect IP
const newIP = process.argv[2];

if (newIP) {
  // Manual IP provided
  console.log(`🎯 Using provided IP: ${newIP}`);
  changeIP(newIP);
} else {
  // Auto-detect local IP
  const detectedIP = getLocalIP();
  console.log(`🔍 Auto-detected local IP: ${detectedIP}`);
  console.log('Do you want to use this IP? (Press Enter to confirm, or Ctrl+C to cancel)');
  
  process.stdin.once('data', () => {
    changeIP(detectedIP);
    process.exit(0);
  });
}