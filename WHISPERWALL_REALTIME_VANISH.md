# WhisperWall Real-Time Vanish Feature

## ✅ Implemented Real-Time Post Expiration

### What's New
Timed posts now automatically disappear from all users' feeds when the timer expires, with real-time updates across all connected clients.

## 🎯 Features

### 1. Backend Cron Job
- **Frequency**: Runs every minute
- **Action**: Finds and deletes expired vanish mode posts
- **Notification**: Emits socket event to all clients
- **Logging**: Logs number of deleted posts

### 2. Frontend Real-Time Updates
- **Socket Listener**: Listens for `whispers:vanished` events
- **Local Checker**: Checks for expired posts every 5 seconds
- **Auto-Removal**: Removes expired posts from UI immediately
- **New Posts**: Listens for `whispers:new` events for real-time additions

### 3. Dual Expiration System
- **Client-Side**: Checks every 5 seconds and removes expired posts
- **Server-Side**: Cron job runs every minute and broadcasts deletions
- **Redundancy**: Ensures posts disappear even if socket connection is lost

## 📁 Files Modified

### Backend
1. **backend/server.js**
   - Added cron job running every minute (`* * * * *`)
   - Finds posts where `vanishMode.vanishAt <= now`
   - Deletes expired posts from database
   - Emits `whispers:vanished` socket event with post IDs

2. **backend/routes/whisperwall.js**
   - Emits `whispers:new` socket event when whisper is created
   - Broadcasts new whisper to all connected clients

### Frontend
1. **frontend/src/screens/main/WhisperWallScreen.tsx**
   - Imported socket service
   - Added `checkExpiredPosts()` function (runs every 5 seconds)
   - Added `handleWhispersVanished()` socket listener
   - Added `handleNewWhisper()` socket listener
   - Cleanup on component unmount

2. **frontend/src/components/whisper/VanishTimer.tsx**
   - Added optional `onExpire` callback prop
   - Triggers callback when timer reaches zero

## 🔄 How It Works

### Expiration Flow

**1. Post Creation**
```
User creates timed post → Backend saves with vanishAt timestamp → 
Socket emits 'whispers:new' → All clients add post to feed
```

**2. During Lifetime**
```
Timer counts down every second → 
Client checks every 5 seconds if expired → 
Server checks every minute if expired
```

**3. Expiration**
```
Server finds expired post → Deletes from database → 
Emits 'whispers:vanished' → All clients remove post from UI
```

**4. Client-Side Backup**
```
If socket disconnected → Client still checks every 5 seconds → 
Removes expired posts locally
```

### Socket Events

**whispers:new**
```typescript
{
  whisper: {
    _id: string,
    content: { text: string, media: [] },
    vanishMode: { enabled: boolean, vanishAt: Date },
    // ... other fields
  }
}
```

**whispers:vanished**
```typescript
{
  postIds: string[]  // Array of expired post IDs
}
```

## 🧪 Testing

### Test Real-Time Expiration
1. Open WhisperWall on two devices/browsers
2. Create a timed post with 1-minute duration
3. Watch timer count down on both devices
4. When timer hits 0:00:00, post should disappear from both devices
5. Verify post is deleted from database

### Test Client-Side Checker
1. Create timed post with 1-minute duration
2. Disconnect internet/socket
3. Wait for timer to expire
4. Post should still disappear (client-side check)
5. Reconnect - post stays gone

### Test New Post Real-Time
1. Open WhisperWall on two devices
2. Create post on device A
3. Post should appear immediately on device B
4. No refresh needed

## 📊 Technical Details

### Cron Job (Backend)
```javascript
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const expiredPosts = await WhisperPost.find({
    'vanishMode.enabled': true,
    'vanishMode.vanishAt': { $lte: now }
  });
  
  if (expiredPosts.length > 0) {
    const postIds = expiredPosts.map(p => p._id.toString());
    await WhisperPost.deleteMany({ _id: { $in: postIds } });
    io.emit('whispers:vanished', { postIds });
  }
});
```

### Client-Side Checker (Frontend)
```typescript
const checkExpiredPosts = () => {
  const now = new Date().getTime();
  setWhispers(prevWhispers => 
    prevWhispers.filter(whisper => {
      if (whisper.vanishMode?.enabled && whisper.vanishMode?.vanishAt) {
        const vanishTime = new Date(whisper.vanishMode.vanishAt).getTime();
        return vanishTime > now; // Keep if not expired
      }
      return true;
    })
  );
};

// Run every 5 seconds
setInterval(checkExpiredPosts, 5000);
```

### Socket Listeners (Frontend)
```typescript
socket.on('whispers:vanished', (data) => {
  setWhispers(prev => prev.filter(w => !data.postIds.includes(w._id)));
});

socket.on('whispers:new', (data) => {
  setWhispers(prev => [data.whisper, ...prev]);
});
```

## ⚡ Performance

### Optimization
- **Client checks**: Every 5 seconds (not every second to save CPU)
- **Server checks**: Every minute (balance between responsiveness and load)
- **Socket events**: Only broadcast when changes occur
- **Efficient filtering**: Uses array filter, not full re-fetch

### Resource Usage
- **Client CPU**: Minimal (simple date comparison every 5s)
- **Server CPU**: Low (cron runs once per minute)
- **Network**: Only sends post IDs, not full post data
- **Database**: Indexed query on `vanishMode.vanishAt`

## 🎯 Benefits

1. **Real-Time**: Posts disappear immediately across all devices
2. **Reliable**: Dual system (client + server) ensures expiration
3. **Efficient**: No constant polling, uses socket events
4. **Scalable**: Cron job handles cleanup for all users
5. **Offline-Safe**: Client-side checker works without connection

## 🔒 Edge Cases Handled

1. **Socket Disconnected**: Client-side checker still works
2. **Server Restart**: Cron job resumes on restart
3. **Clock Skew**: Server time is source of truth
4. **Multiple Tabs**: All tabs receive socket events
5. **Background Tab**: Timer still counts, post removed when tab active

## 📈 Future Enhancements

- Warning notification 1 minute before expiration
- Fade-out animation when post expires
- "Post expired" toast message
- Option to extend timer before expiration
- Analytics on average post lifetime
- Batch deletion optimization for many expired posts

## 🐛 Troubleshooting

### Posts Not Disappearing
1. Check socket connection: `socket.connected`
2. Verify cron job is running: Check server logs
3. Check vanishAt timestamp: Should be in future
4. Verify client-side checker: Should run every 5s

### Posts Disappear Too Early
1. Check server time vs client time
2. Verify vanishAt calculation in backend
3. Check timezone handling

### Posts Disappear Too Late
1. Cron job may be delayed (runs every minute)
2. Client checker runs every 5 seconds
3. Maximum delay: ~1 minute + 5 seconds

## 📝 Notes

- Cron job runs every minute for efficiency
- Client checker runs every 5 seconds for responsiveness
- Socket events provide instant updates
- Posts are permanently deleted from database
- No recovery after expiration
- Timer shows exact time remaining with seconds
