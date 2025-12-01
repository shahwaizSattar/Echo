# Centralized IP Configuration Guide

## Overview

All IP addresses are now centralized using environment variables. This makes it easy to update the server IP address across the entire application.

## Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development
SERVER_IP=172.20.10.2
SERVER_HOST=0.0.0.0
```

### Frontend (.env)
```env
# API Configuration
EXPO_PUBLIC_SERVER_IP=172.20.10.2
EXPO_PUBLIC_SERVER_PORT=5000
EXPO_PUBLIC_API_BASE=http://172.20.10.2:5000
```

## Quick IP Update

### Method 1: Use the Update Script
```bash
# Update to a new IP address
update-server-ip.bat 192.168.1.100
```

### Method 2: Manual Update
1. **Backend**: Update `SERVER_IP` in `backend/.env`
2. **Frontend**: Update `EXPO_PUBLIC_SERVER_IP` and `EXPO_PUBLIC_API_BASE` in `frontend/.env`
3. Restart both servers

## Files Updated

### Backend Files Using Environment Variables:
- ✅ `backend/server.js` - Main server file
- ✅ `backend/server-simple.js` - Simple server variant
- ✅ `backend/server-file.js` - File server variant
- ✅ `backend/server-atlas.js` - Atlas server variant
- ✅ `backend/scripts/fixMediaUrls.js` - Media URL fix script
- ✅ `backend/fix-media-urls-db.js` - Database URL fix script

### Frontend Files Using Environment Variables:
- ✅ `frontend/src/services/api.ts` - API service
- ✅ `frontend/src/utils/mediaUtils.ts` - Media utilities

## Configuration Examples

### For Different Network Setups:

#### Home WiFi Network
```env
SERVER_IP=192.168.1.100
```

#### Office Network
```env
SERVER_IP=10.0.0.50
```

#### Mobile Hotspot
```env
SERVER_IP=172.20.10.2
```

#### Docker/Container Setup
```env
SERVER_IP=localhost
SERVER_HOST=0.0.0.0
```

## Platform-Specific Behavior

The configuration automatically handles different platforms:

### Web Browser
- Uses: `http://{SERVER_IP}:{PORT}`
- Example: `http://172.20.10.2:5000`

### Android Emulator
- Uses: `http://10.0.2.2:{PORT}` (special emulator loopback)
- Example: `http://10.0.2.2:5000`

### iOS Simulator / Physical Device
- Uses: `http://{SERVER_IP}:{PORT}`
- Example: `http://172.20.10.2:5000`

## Finding Your IP Address

### Windows
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

### macOS/Linux
```bash
ifconfig
```
Look for "inet" address under your active network interface.

## Troubleshooting

### 1. IP Address Changed
```bash
# Quick update
update-server-ip.bat [NEW_IP]

# Then restart servers
cd backend && npm run dev
cd frontend && npm start
```

### 2. Environment Variables Not Loading
- Restart development servers
- Clear browser cache (Ctrl+F5)
- Check `.env` file format (no spaces around =)

### 3. Mobile Device Can't Connect
- Ensure mobile device is on same network
- Check firewall settings
- Verify IP address is correct
- Test with: `curl http://{SERVER_IP}:5000/health`

## Production Deployment

For production, the system automatically uses:
```
https://whisperecho-backend-production.up.railway.app
```

No IP configuration needed for production builds.

## Benefits

✅ **Single Source of Truth**: All IP addresses managed in one place
✅ **Easy Updates**: Change IP once, applies everywhere
✅ **Environment Specific**: Different IPs for different environments
✅ **Platform Aware**: Automatic handling for web/mobile/emulator
✅ **Production Ready**: Seamless switch to production URLs