# Quick Start Guide

Get your app running in 5 minutes!

## Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Configure IP Address

**Option A: Automatic (Recommended)**
```bash
# Run from project root
set-ip.bat
```

**Option B: Manual**
1. Find your IP: Run `ipconfig` in CMD
2. Create `frontend/.env`:
   ```
   EXPO_PUBLIC_API_BASE=http://YOUR_IP:5000
   ```

## Step 3: Configure Backend

1. Copy `backend/env.example` to `backend/.env`
2. Update MongoDB URI if needed (default works for local MongoDB)

## Step 4: Start Backend

```bash
cd backend
node server.js
```

You should see:
```
✅ MongoDB connected successfully!
🚀 Server running on port 5000
```

## Step 5: Start Frontend

```bash
cd frontend
npm start
```

Press:
- `w` for web
- `a` for Android
- `i` for iOS

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Check port 5000 is not in use

### Frontend can't connect
- Check `frontend/.env` has correct IP
- Check backend is running
- Try `http://localhost:5000/health` in browser

### Media not loading
- Run `update-ip.bat` if your IP changed
- Check firewall isn't blocking port 5000

## Next Steps

- Read [IP_CONFIGURATION_GUIDE.md](./IP_CONFIGURATION_GUIDE.md) for IP management
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- See [README.md](./README.md) for full documentation

## Helper Scripts

- `set-ip.bat` - Quick IP setup
- `update-ip.bat` - Update IP and migrate database
