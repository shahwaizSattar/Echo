# WhisperEcho - Anonymous Social Media App

An innovative social media platform that combines anonymity with authentic connection, featuring unique systems like WhisperWall, Echo following, and emotion-based reactions.

## 🌟 Key Features

### Core Functionality
- **Authentication**: Secure login/signup with JWT tokens and bcrypt password hashing
- **User Profiles**: Customizable profiles with bio, avatar, preferences, and stats
- **Preference-Based Feed**: Content customized based on user interests
- **Echo System**: Unique following mechanism with beautiful animations
- **Emotion Reactions**: Express yourself with 6 different emotion types
- **Karma System**: Build credibility through community engagement

### WhisperWall (Anonymous Features)
- **Anonymous Posting**: Share thoughts with randomly generated usernames
- **24-Hour Auto-Clear**: All posts automatically disappear after 24 hours
- **Whisper Chains**: Pass messages anonymously from user to user
- **Confession Rooms**: Time-limited themed chat rooms (30 minutes)
- **Mood Heatmap**: Visual representation of community emotions
- **Random Confession Roulette**: Discover random anonymous confessions

### Unique Features
- **Disguise Mode**: Post with animal avatars for pseudonymous sharing
- **Vanish Mode**: Auto-delete posts after 1 hour, 1 day, or 1 week
- **Echo Trails**: Discover users through anonymized connection networks
- **Memory Vault**: Private time capsules for future self
- **Streak System**: Daily posting streaks with badges
- **Multiple Themes**: Including "Neon Whisper" and "Mood Shift" themes

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt
- **Real-time**: Socket.io for live features
- **Security**: Helmet, CORS, rate limiting
- **Automation**: Node-cron for scheduled tasks
- **File Upload**: Multer with Sharp for image processing

### Frontend
- **Framework**: React Native
- **Navigation**: React Navigation 6
- **Animations**: React Native Reanimated 3
- **State Management**: Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **UI Components**: Custom components with gradient support
- **Themes**: Dynamic theming system with mood-based colors

## 📱 App Structure

### Backend Architecture
```
backend/
├── models/              # MongoDB schemas
│   ├── User.js         # User model with stats, preferences, streaks
│   ├── Post.js         # Regular posts with reactions, comments
│   └── WhisperPost.js  # Anonymous posts with random usernames
├── routes/             # API endpoints
│   ├── auth.js         # Authentication routes
│   ├── user.js         # User management routes
│   ├── posts.js        # Post CRUD operations
│   ├── whisperwall.js  # Anonymous posting features
│   └── reactions.js    # Emotion reactions and karma
├── middleware/         # Custom middleware
│   └── auth.js         # JWT authentication
└── server.js           # Main server file
```

### Frontend Architecture
```
frontend/src/
├── context/            # React contexts
│   ├── AuthContext.tsx # User authentication state
│   └── ThemeContext.tsx # Theme management
├── screens/            # App screens
│   ├── auth/           # Authentication screens
│   └── main/           # Main app screens
├── services/           # API services
│   └──           # HTTP client configuration
├── navigation/         # Navigation setup
└── utils/              # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)
- React Native development environment
- Android Studio / Xcode for mobile development

### Backend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp env.example .env

# Configure your environment variables
# MongoDB connection string, JWT secret, etc.

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure API endpoint
cp .env.example .env
# Edit .env and set your IP address:
# EXPO_PUBLIC_API_BASE=http://YOUR_IP:5000

# For iOS (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

> **📌 Important:** When your IP address changes, see [IP_CONFIGURATION_GUIDE.md](./IP_CONFIGURATION_GUIDE.md) for instructions.

### Environment Variables
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/whisper-echo
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

## 🎨 Theme System

The app features multiple themes:

- **Light Theme**: Clean, modern light interface
- **Dark Theme**: Easy on the eyes dark mode
- **AMOLED Theme**: Pure black for OLED displays
- **Neon Whisper**: Futuristic dark theme with neon accents
- **Mood Shift**: Dynamic theme that changes based on post emotions

### Theme Colors
```typescript
// Neon Whisper Theme Example
colors: {
  primary: '#00FFD1',      // Cyan accent
  secondary: '#A259FF',    // Purple accent
  accent: '#FF4D6D',       // Coral accent
  background: '#0B0F15',   // Dark blue-black
  surface: '#111827',      // Dark gray
  // ... more colors
}
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configured for security
- **Helmet Integration**: Security headers
- **Anonymous Session Tracking**: Safe anonymous user identification

## 📊 Database Schema

### User Model
```javascript
{
  email: String,
  username: String,
  password: String, // Hashed
  avatar: String,
  bio: String,
  preferences: [String],
  stats: {
    postsCount: Number,
    followersCount: Number,
    followingCount: Number,
    karmaScore: Number
  },
  streaks: {
    currentStreak: Number,
    longestStreak: Number,
    lastPostDate: Date
  },
  badges: [{ name: String, icon: String, earnedAt: Date }],
  settings: { theme: String, notifications: Object, privacy: Object }
}
```

### Post Model
```javascript
{
  author: ObjectId,
  content: { text: String, image: String, voiceNote: String },
  category: String,
  visibility: String, // 'normal' | 'disguise'
  reactions: { funny: [], rage: [], shock: [], relatable: [], love: [], thinking: [] },
  comments: [{ author: ObjectId, content: String, reactions: Object }],
  vanishMode: { enabled: Boolean, duration: String, vanishAt: Date },
  trending: { score: Number, lastCalculated: Date }
}
```

### WhisperPost Model
```javascript
{
  randomUsername: String, // Auto-generated
  content: { text: String, image: String, voiceNote: String },
  category: String,
  reactions: { funny: Number, rage: Number, ... }, // Only counts, no user IDs
  reactedUsers: [{ sessionId: String, reactionType: String }],
  expiresAt: Date, // Auto-delete after 24 hours
  isChainMessage: Boolean,
  chainId: String,
  confessionRoom: { roomId: String, theme: String, expiresAt: Date }
}
```

## 🔄 Real-time Features

- **Socket.io Integration**: Real-time updates for reactions, comments
- **WhisperWall Live Updates**: New anonymous posts appear instantly
- **Confession Room Chat**: Real-time anonymous conversations
- **Echo Animations**: Live follow/unfollow animations
- **Notification System**: Real-time push notifications

## 🎯 Unique Features Implementation

### Echo System
Replace traditional "following" with "Echo" - includes:
- Custom animations when echoing users
- Echo trails showing anonymized connection networks
- Echo roulette for random user discovery

### WhisperWall
Complete anonymous posting system:
- Random username generation from adjective + animal + number
- Session-based anonymous reactions
- Automatic 24-hour cleanup via cron jobs
- Anonymous comment threading

### Emotion Reactions
Six-emotion system instead of simple like/dislike:
- 😂 Funny, 😡 Rage, 😲 Shock, 🫶 Relatable, ❤️ Love, 🤔 Thinking
- Karma point system based on reaction types
- Trending algorithm incorporating emotional engagement

### Vanish Mode
Temporal posting system:
- Posts auto-delete after specified time
- Snapchat-like ephemeral conversations
- Database cleanup automation

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Configure environment variables for production
3. Deploy to services like Heroku, Railway, or DigitalOcean
4. Set up SSL certificates
5. Configure CORS for your frontend domain

### Frontend Deployment
1. Build the React Native app for production
2. Generate signed APK/AAB for Android
3. Create iOS archive for App Store
4. Configure deep linking and push notifications
5. Submit to app stores

## 🔮 Future Enhancements

### Planned Features
- **AI-Generated Art**: Optional AI-created images for posts
- **Voice Note Masking**: Voice modulation for anonymous audio posts
- **Group Goals**: Anonymous community challenges
- **Whisper Triggers**: Keyword-based animations and effects
- **Location-Based Features**: Anonymous city-level mood mapping
- **Advanced Moderation**: AI-powered content filtering
- **Analytics Dashboard**: User engagement insights

### Technical Improvements
- **Performance Optimization**: Image optimization, lazy loading
- **Offline Support**: Caching and offline post drafts
- **Push Notifications**: Firebase/APNs integration
- **Deep Linking**: Share posts and profiles
- **Accessibility**: Screen reader support, high contrast modes
- **Internationalization**: Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native community for excellent documentation
- MongoDB team for flexible database solutions
- Socket.io for real-time communication capabilities
- React Navigation for seamless navigation experience
- All the amazing open-source libraries that made this possible

---

**WhisperEcho** - Where voices find their echo and secrets find their home. 🌟
