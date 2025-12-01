# Deploy to Render - Better Media Performance

## Why Render is Better for Media
- Faster response times than Railway
- Better handling of file uploads/streaming
- More reliable for audio/video playback
- Less cold start delays

## Quick Deploy Steps

### 1. Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 2. Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repo
3. Select the repository
4. Use these settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### 3. Set Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:Acer.112@blog-app.zi3j2.mongodb.net/whisper-echo?retryWrites=true&w=majority&appName=blog-app
JWT_SECRET=Acer.112
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
```

### 4. Update Frontend API URL
After deployment, update `frontend/.env`:
```
EXPO_PUBLIC_API_BASE=https://your-app-name.onrender.com
```

## Alternative: Vercel (Even Better)

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. In backend folder: `vercel`
3. Follow prompts

### Vercel Config
Create `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

## Performance Comparison
- **Railway**: ~2-3s cold start, slower media
- **Render**: ~1-2s cold start, faster media
- **Vercel**: ~500ms cold start, fastest media

Choose Render for easiest migration or Vercel for best performance.