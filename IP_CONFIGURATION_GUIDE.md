# IP Configuration Guide

This guide explains how to configure your IP address for the app to work properly.

## Quick Setup

### 1. Find Your IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.10.2`)

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" under your network interface

### 2. Configure Frontend

Edit `frontend/.env`:
```
EXPO_PUBLIC_API_BASE=http://YOUR_IP_HERE:5000
```

Example:
```
EXPO_PUBLIC_API_BASE=http://192.168.10.2:5000
```

### 3. Restart Frontend

```bash
cd frontend
npm start
```

Press `r` to reload or restart the app completely.

---

## When Your IP Changes

If your IP address changes (e.g., you connect to a different network), follow these steps:

### Option 1: Use the Automated Script (Recommended)

1. Double-click `update-ip.bat` in the project root
2. Enter your old IP (if you have existing media)
3. Enter your new IP
4. Restart backend and frontend

### Option 2: Manual Update

**Step 1: Update Frontend Configuration**

Edit `frontend/.env`:
```
EXPO_PUBLIC_API_BASE=http://NEW_IP:5000
```

**Step 2: Migrate Database URLs (if you have existing media)**

```bash
node backend/scripts/fixMediaUrls.js OLD_IP NEW_IP
```

Example:
```bash
node backend/scripts/fixMediaUrls.js 192.168.10.2 192.168.10.15
```

**Step 3: Restart Servers**

Backend:
```bash
cd backend
node server.js
```

Frontend:
```bash
cd frontend
npm start
```

**Step 4: Clear Cache**
- Web: Hard refresh (Ctrl+Shift+R)
- Mobile: Close and reopen the app

---

## Troubleshooting

### Media Not Loading

If images/videos don't load after changing IP:

1. Check `frontend/.env` has the correct IP
2. Run the database migration script:
   ```bash
   node backend/scripts/fixMediaUrls.js OLD_IP NEW_IP
   ```
3. Restart both backend and frontend
4. Clear app cache

### Connection Refused Error

If you see `ERR_CONNECTION_REFUSED`:

1. Make sure backend is running:
   ```bash
   cd backend
   node server.js
   ```
2. Check firewall isn't blocking port 5000
3. Verify IP address is correct in `frontend/.env`

### Testing Connection

Test if backend is accessible:
```
http://YOUR_IP:5000/health
```

Should return:
```json
{"status":"OK","timestamp":"..."}
```

---

## Platform-Specific Notes

### Web Development
Use `localhost` instead of IP:
```
EXPO_PUBLIC_API_BASE=http://localhost:5000
```

### Android Emulator
Android emulator uses special IP `10.0.2.2` to access host machine:
```
EXPO_PUBLIC_API_BASE=http://10.0.2.2:5000
```

### iOS Simulator
iOS simulator can use `localhost`:
```
EXPO_PUBLIC_API_BASE=http://localhost:5000
```

### Physical Devices
Must use your computer's LAN IP address (e.g., `192.168.10.2`)

---

## Files That Use IP Configuration

1. **Frontend:**
   - `frontend/.env` - Main configuration (change this!)
   - `frontend/src/services/api.ts` - Reads from .env

2. **Database:**
   - Media URLs stored in MongoDB include full URLs with IP
   - Use migration script when IP changes

3. **Backend:**
   - Backend automatically binds to `0.0.0.0` (all interfaces)
   - No IP configuration needed on backend side

---

## Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use `.env.example` as template** - Copy and modify for your setup
3. **Document your IP** - Keep track of which IP you're using
4. **Run migration script** - Always migrate database URLs when IP changes
5. **Test after changes** - Verify media loads correctly

---

## Quick Reference

| Scenario | IP to Use |
|----------|-----------|
| Web browser development | `localhost` or `127.0.0.1` |
| Android emulator | `10.0.2.2` |
| iOS simulator | `localhost` |
| Physical device (same WiFi) | Your LAN IP (e.g., `192.168.10.2`) |
| Production | Your domain name or public IP |

---

## Need Help?

1. Check backend is running: `http://YOUR_IP:5000/health`
2. Check frontend can connect: Look for "🌐 API Base URL" in console
3. Check media URLs: `http://YOUR_IP:5000/api/test-video`
4. Run migration if needed: `node backend/scripts/fixMediaUrls.js OLD_IP NEW_IP`
