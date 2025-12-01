# 🚀 Local Backend Deployment Guide

## Why Run Backend Locally?

Running your backend locally instead of on Render gives you:
- **Instant response times** (no network latency)
- **Free hosting** (no monthly costs)
- **Full control** over the server
- **Easy debugging** with direct console access
- **No cold starts** or sleep modes

## Quick Start (3 Steps)

### 1. Setup Backend (First Time Only)
```cmd
setup-backend.bat
```

This will:
- Check Node.js installation
- Install all dependencies
- Create upload directories
- Verify .env configuration

### 2. Start Backend Server
```cmd
start-backend.bat
```

The server will start on:
- **Local**: http://localhost:5000
- **Network**: http://192.168.10.2:5000

### 3. Update Frontend Configuration

Your frontend is already configured to use:
```
API_URL=http://192.168.10.2:5000
```

No changes needed if you're using the same IP!

## Manual Commands

If you prefer to run commands manually:

```cmd
cd backend
npm install
node server.js
```

## Troubleshooting

### Port Already in Use
If port 5000 is busy, edit `backend/.env`:
```
PORT=5001
```

Then update frontend `.env`:
```
API_URL=http://192.168.10.2:5001
```

### MongoDB Connection Issues
Check your `backend/.env` file has:
```
MONGODB_URI=mongodb+srv://user:Acer.112@blog-app.zi3j2.mongodb.net/whisper-echo?retryWrites=true&w=majority&appName=blog-app
```

### Can't Access from Phone
1. Make sure your computer and phone are on the same WiFi
2. Check Windows Firewall allows Node.js
3. Verify your IP address with: `ipconfig`
4. Update the IP in both backend and frontend `.env` files

## Keeping Backend Running

### Option 1: Keep Terminal Open
Just leave the terminal window running. Press Ctrl+C to stop.

### Option 2: Run as Background Service (Advanced)
Install PM2 globally:
```cmd
npm install -g pm2
cd backend
pm2 start server.js --name whisper-backend
pm2 save
pm2 startup
```

To stop:
```cmd
pm2 stop whisper-backend
```

## Performance Comparison

| Metric | Render (Free) | Local |
|--------|---------------|-------|
| Response Time | 500-2000ms | 10-50ms |
| Cold Start | 30-60s | 0s |
| Uptime | Sleep after 15min | Always on |
| Cost | Free (limited) | Free |
| Speed | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## Next Steps

1. Run `setup-backend.bat` (first time only)
2. Run `start-backend.bat` to start server
3. Test with: http://localhost:5000/health
4. Start your Expo app and enjoy fast responses!

## Notes

- The backend uses MongoDB Atlas (cloud database) so your data is still safe
- Only the API server runs locally
- You can switch back to Render anytime by changing the API_URL
- Keep the terminal window open while using the app
