# 💬 Messages & Notifications Seeding Guide

## Overview
This script creates test messages with media (images, videos, audio) and notifications (reactions, comments) for testing the chat and notification features.

## What Gets Created

### 💬 Messages (Conversations)

#### For Each User (4 conversations with sohari)
Each conversation includes:
- **3 text messages** - Back and forth conversation
- **1 image message** - Photo sharing
- **1 video message** - Video sharing (first 2 conversations)
- **1 audio message** - Voice note (first 2 conversations)
- **Message reactions** - Love reactions on some messages

**Total**: ~20-25 messages across all conversations

### 🔔 Notifications

#### For Sohari Account
- **5 reaction notifications** - From different users
  - Funny 😂
  - Love ❤️
  - Shock 😱
  - Relatable 💯
  - Thinking 🤔
- **5 comment notifications** - From different users
  - Various comment texts
  - Some marked as read, some unread

#### For Other Users
- **Reaction notifications from sohari** - On their posts
- **Comment notifications from sohari** - On their posts

**Total**: 10+ notifications

## Prerequisites

⚠️ **Important**: Run the main seeding script first!

```bash
cd backend
node seed-comprehensive-data.js
```

This creates the users and posts needed for messages and notifications.

## How to Run

### Method 1: Using Batch File (Windows)
```bash
cd backend
seed-messages.bat
```

### Method 2: Direct Node Command
```bash
cd backend
node seed-messages-notifications.js
```

### Method 3: From Project Root
```bash
node backend/seed-messages-notifications.js
```

## What You'll See

### Messages Screen
```
💬 Conversations

alex_tech
  Check out this photo! 📸
  2 mins ago

sarah_music
  Listen to this! 🎵
  5 mins ago

mike_fitness
  You have to watch this! 🎥
  10 mins ago
```

### Inside a Conversation
```
alex_tech: Hey! How are you doing? 👋
sohari: Did you see the latest post?
alex_tech: That was hilarious! 😂
alex_tech: Check out this photo! 📸
  [Image preview]
sohari: You have to watch this! 🎥
  [Video preview]
alex_tech: Listen to this! 🎵
  [Audio player]
```

### Notifications Bell
```
🔔 Notifications (8 unread)

❤️ alex_tech reacted to your post
   2 mins ago

💬 sarah_music commented on your post
   "Great post!"
   5 mins ago

😂 mike_fitness reacted to your post
   10 mins ago
```

## Media Types

### Images
- Sample photos from Picsum
- Displayed as thumbnails in chat
- Clickable to view full size

### Videos
- Sample videos from Google test videos
- Video player with controls
- Thumbnail preview

### Audio
- Sample audio from SoundHelix
- Audio player with waveform
- Play/pause controls

## Testing Scenarios

### Scenario 1: View Messages
1. Login as sohari
2. Go to Messages screen
3. See 4 conversations
4. Open a conversation
5. Scroll through messages
6. See text, images, videos, and audio

### Scenario 2: View Notifications
1. Login as sohari
2. Click notification bell
3. See 8 unread notifications
4. See reaction and comment notifications
5. Click a notification
6. Navigate to the post

### Scenario 3: Send a Message
1. Open a conversation
2. Type a message
3. Send it
4. See it appear in the chat

### Scenario 4: React to Message
1. Long-press a message
2. See reaction options
3. Select a reaction
4. See it appear on the message

### Scenario 5: View Media
1. Click on an image message
2. View full-screen image
3. Click on a video message
4. Play the video
5. Click on an audio message
6. Play the audio

## Message Structure

### Text Message
```javascript
{
  sender: userId,
  text: "Hey! How are you doing? 👋",
  media: [],
  createdAt: Date,
  readBy: [userId],
}
```

### Image Message
```javascript
{
  sender: userId,
  text: "Check out this photo! 📸",
  media: [{
    url: "https://picsum.photos/800/600",
    type: "image",
    filename: "chat-image-1.jpg",
    size: 1024000
  }],
  createdAt: Date,
  readBy: [userId],
}
```

### Video Message
```javascript
{
  sender: userId,
  text: "You have to watch this! 🎥",
  media: [{
    url: "http://sample-video.mp4",
    type: "video",
    filename: "chat-video-1.mp4",
    size: 5024000
  }],
  createdAt: Date,
  readBy: [userId],
}
```

### Audio Message
```javascript
{
  sender: userId,
  text: "Listen to this! 🎵",
  media: [{
    url: "https://sample-audio.mp3",
    type: "audio",
    filename: "voice-note-1.mp3",
    size: 512000
  }],
  createdAt: Date,
  readBy: [userId],
}
```

## Notification Structure

### Reaction Notification
```javascript
{
  user: sohariId,
  actor: otherUserId,
  type: "reaction",
  post: postId,
  reactionType: "love",
  read: false,
  createdAt: Date
}
```

### Comment Notification
```javascript
{
  user: sohariId,
  actor: otherUserId,
  type: "comment",
  post: postId,
  metadata: {
    commentContent: "Great post!"
  },
  read: false,
  createdAt: Date
}
```

## Customization

### Add More Messages
Edit `messageTexts` object in the script:
```javascript
const messageTexts = {
  text: [
    'Your custom message here!',
    'Another message',
  ],
  // ...
};
```

### Change Media URLs
Edit the sample media arrays:
```javascript
const sampleImages = [
  'https://your-image-url.jpg',
  // ...
];
```

### Add More Conversations
Modify the loop in the script:
```javascript
for (let i = 1; i < users.length; i++) {
  // Create more conversations
}
```

## Troubleshooting

### No Users Found
**Problem**: "Not enough users found"
**Solution**: Run `seed-comprehensive-data.js` first
```bash
cd backend
node seed-comprehensive-data.js
```

### No Posts Found
**Problem**: "No posts found"
**Solution**: Run `seed-comprehensive-data.js` first

### Messages Not Showing
**Problem**: Messages don't appear in app
**Solution**:
1. Check if backend is running
2. Verify MongoDB connection
3. Check console for errors
4. Reload the app

### Notifications Not Showing
**Problem**: Notifications don't appear
**Solution**:
1. Check notification bell icon
2. Verify user is logged in as sohari
3. Check backend logs
4. Ensure Socket.IO is connected

## Features Tested

### Messages
- ✅ Text messages
- ✅ Image messages
- ✅ Video messages
- ✅ Audio messages
- ✅ Message reactions
- ✅ Read receipts
- ✅ Timestamps
- ✅ Conversation list
- ✅ Unread indicators

### Notifications
- ✅ Reaction notifications
- ✅ Comment notifications
- ✅ Unread count
- ✅ Read/unread status
- ✅ Notification bell
- ✅ Real-time updates
- ✅ Navigation to posts

## Summary

✅ **4 conversations** with sohari
✅ **20-25 messages** total
✅ **Text, image, video, and audio** messages
✅ **Message reactions** on some messages
✅ **10+ notifications** (reactions and comments)
✅ **Unread indicators** for testing
✅ **Real-time updates** ready

---

## Quick Commands

```bash
# Seed users and posts first
cd backend
node seed-comprehensive-data.js

# Then seed messages and notifications
node seed-messages-notifications.js

# Start backend
npm start

# Start frontend (new terminal)
cd frontend
npm start

# Login
Email: sohari@example.com
Password: password123
```

## Next Steps

1. **Run the seeding script**
2. **Start the app**
3. **Login as sohari**
4. **Test messages** - Open conversations, view media
5. **Test notifications** - Check notification bell
6. **Send messages** - Try sending your own
7. **React to messages** - Add reactions

Enjoy testing the messaging and notification features! 💬🔔
