# Deployment Quick Reference

## Your Current Setup ✅

- **Local Development**: `http://172.20.10.2:5000`
- **Production Backend**: `https://whisperecho-backend-production.up.railway.app` ✅ Working

## When You Deploy Your App

### 🚀 For Production App Build

**Step 1: Switch to Production Configuration**
```bash
switch-to-production.bat
```

**Step 2: Build Your App**
```bash
cd frontend
npm run build
eas build --platform all
```

**Step 3: Switch Back to Development (Optional)**
```bash
switch-to-development.bat
```

### 🔧 Manual Configuration (Alternative)

**For Production**: Update `frontend/.env`
```env
EXPO_PUBLIC_API_BASE=https://whisperecho-backend-production.up.railway.app
```

**For Development**: Update `frontend/.env`
```env
EXPO_PUBLIC_SERVER_IP=172.20.10.2
EXPO_PUBLIC_SERVER_PORT=5000
EXPO_PUBLIC_API_BASE=http://172.20.10.2:5000
```

## What Changes When You Deploy

### ✅ Backend (No Changes Needed)
- Already deployed on Railway
- Environment variables handled automatically
- Media serving works automatically

### 🔄 Frontend (Only Configuration Changes)
- **Development**: Uses local IP (`172.20.10.2:5000`)
- **Production**: Uses Railway URL (`https://whisperecho-backend-production.up.railway.app`)

## Quick Commands

```bash
# Switch to production and build
switch-to-production.bat
cd frontend && npm run build

# Switch back to development
switch-to-development.bat

# Test current configuration
verify-ip-config.bat

# Update IP for development
update-server-ip.bat 192.168.1.100
```

## The Magic ✨

Your code automatically detects the environment:

```typescript
if (!__DEV__) {
  return 'https://whisperecho-backend-production.up.railway.app';
}
```

This means production builds automatically use the right URL without any code changes!

## Summary

**For deployment, you only need to:**
1. Run `switch-to-production.bat`
2. Build your app
3. Deploy to app stores

**No backend changes needed** - it's already deployed and working! 🎉