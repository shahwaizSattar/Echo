# Deploy Backend to Render (Free)

## Quick Deploy Steps

### 1. Prepare Your Code

Your backend is ready! The `render.yaml` file has been created.

### 2. Push to GitHub (if not already)

```bash
# Initialize git if needed
git init
git add .
git commit -m "Prepare for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 3. Deploy to Render

1. Go to https://render.com and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select your repository
5. Render will detect the `render.yaml` file automatically
6. Configure:
   - **Name**: whisperecho-backend (or your choice)
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 4. Add Environment Variables

In Render dashboard, add these environment variables:

```
MONGODB_URI=mongodb+srv://user:Acer.112@blog-app.zi3j2.mongodb.net/whisper-echo?retryWrites=true&w=majority&appName=blog-app
JWT_SECRET=Acer.112
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
MAX_FILE_SIZE=10485760
```

### 5. Deploy

Click **"Create Web Service"** and wait for deployment (5-10 minutes).

You'll get a URL like: `https://whisperecho-backend.onrender.com`

### 6. Test Backend

Open in browser:
```
https://your-backend-url.onrender.com/api/health
```

Should return: `{"status":"ok"}`

### 7. Update Frontend

Update `frontend/.env`:
```env
EXPO_PUBLIC_API_BASE=https://your-backend-url.onrender.com
```

## Alternative: Deploy to Railway

### Railway Steps:

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Add environment variables (same as above)
6. Railway will auto-deploy
7. Get your URL from Railway dashboard

## Alternative: Use ngrok (Testing Only)

For quick testing without deployment:

```bash
# Install ngrok
npm install -g ngrok

# Start your backend
cd backend
npm start

# In another terminal
ngrok http 5000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and use it in `frontend/.env`

⚠️ **Note**: ngrok URLs expire when you close the terminal. Use cloud deployment for production.

## Verify Deployment

Test these endpoints:
- `GET /api/health` - Should return status ok
- `POST /api/auth/register` - Should accept registration
- `GET /api/posts` - Should return posts (may be empty)

## Next: Build APK

Once backend is deployed and working:
1. Update `frontend/.env` with your backend URL
2. Follow the APK_BUILD_GUIDE.md to build your APK
