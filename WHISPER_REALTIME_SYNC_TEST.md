# Whisper Real-time Sync Test Guide

## Overview
This guide helps you test that whisper edits and deletes sync in real-time across all screens.

## Test Setup

### Requirements
- Two devices/browsers (or two browser tabs)
- Same user logged in on both
- Backend server running
- Socket.io connection active

## Test Scenarios

### Test 1: Edit Whisper - Profile to WhisperWall Sync

**Steps:**
1. **Device A**: Open WhisperWall screen
2. **Device B**: Open Profile → Whispers tab
3. **Device B**: Tap menu on a whisper → Edit Whisper
4. **Device B**: Change text to "EDITED: Real-time test"
5. **Device B**: Change category to different one
6. **Device B**: Tap Save

**Expected Result:**
- ✅ Device A (WhisperWall) should instantly show the updated text and category
- ✅ If Device A has the whisper detail modal open, it should update
- ✅ No page refresh needed

**Check Backend Logs:**
```
📝 Edit whisper request: [whisper-id]
✅ Whisper updated successfully
🔌 Emitting whispers:updated event
```

**Check Frontend Console (Device A):**
```
🔔 Whisper updated event: [whisper object]
```

---

### Test 2: Delete Whisper - Profile to WhisperWall Sync

**Steps:**
1. **Device A**: Open WhisperWall screen
2. **Device A**: Find a specific whisper (note its text)
3. **Device B**: Open Profile → Whispers tab
4. **Device B**: Find the same whisper
5. **Device B**: Tap menu → Delete Whisper

**Expected Result:**
- ✅ Device A (WhisperWall) should instantly remove the whisper
- ✅ If Device A has the whisper detail modal open, modal should close
- ✅ Whisper disappears from the list

**Check Backend Logs:**
```
🗑️ Delete whisper request: [whisper-id]
✅ Whisper deleted successfully
🔌 Emitting whispers:deleted event
```

**Check Frontend Console (Device A):**
```
🔔 Whisper deleted event: [whisper-id]
```

---

### Test 3: Edit While Viewing Detail Modal

**Steps:**
1. **Device A**: Open WhisperWall screen
2. **Device A**: Tap on a whisper to open detail modal
3. **Device B**: Open Profile → Whispers tab
4. **Device B**: Edit the SAME whisper that Device A is viewing
5. **Device B**: Change text and save

**Expected Result:**
- ✅ Device A's detail modal should update with new text
- ✅ Category badge should update if changed
- ✅ Modal stays open (doesn't close)
- ✅ User can continue reading the updated content

---

### Test 4: Delete While Viewing Detail Modal

**Steps:**
1. **Device A**: Open WhisperWall screen
2. **Device A**: Tap on a whisper to open detail modal
3. **Device B**: Open Profile → Whispers tab
4. **Device B**: Delete the SAME whisper that Device A is viewing

**Expected Result:**
- ✅ Device A's detail modal should close automatically
- ✅ Whisper disappears from WhisperWall list
- ✅ No error messages shown

---

### Test 5: Multiple Users Viewing Same Whisper

**Setup:** Two different users logged in

**Steps:**
1. **User A - Device 1**: Create a whisper on WhisperWall
2. **User B - Device 2**: Open WhisperWall, see User A's whisper
3. **User A - Device 1**: Go to Profile → Edit the whisper
4. **User A - Device 1**: Change text and save

**Expected Result:**
- ✅ User B sees the updated whisper text instantly
- ✅ Works even though User B didn't create the whisper
- ✅ Real-time sync works for all users

---

## Troubleshooting

### Updates Not Syncing

**Check 1: Socket Connection**
```javascript
// In browser console
const socket = require('./services/socket').getSocket();
console.log('Socket connected:', socket.connected);
```

**Check 2: Backend Socket Emission**
Look for these logs in backend:
```
🔌 Emitting whispers:updated event
🔌 Emitting whispers:deleted event
```

If missing, check:
- `global.io` is defined in server.js
- Socket.io is properly initialized

**Check 3: Frontend Event Listeners**
In WhisperWallScreen.tsx, verify:
```typescript
socket.on('whispers:updated', handleWhisperUpdated);
socket.on('whispers:deleted', handleWhisperDeleted);
```

### Modal Not Updating

**Issue:** Detail modal shows old content after edit

**Solution:** Check that `handleWhisperUpdated` updates `selectedWhisper`:
```typescript
setSelectedWhisper((prev: any) => 
  prev?._id === data.whisper._id ? data.whisper : prev
);
```

### Modal Not Closing After Delete

**Issue:** Modal stays open after whisper is deleted

**Solution:** Check that `handleWhisperDeleted` closes modal:
```typescript
setSelectedWhisper((prev: any) => 
  prev?._id === data.postId ? null : prev
);
```

---

## Performance Test

### Test Many Rapid Edits

**Steps:**
1. Open WhisperWall on Device A
2. On Device B, rapidly edit the same whisper 5 times
3. Change text each time

**Expected Result:**
- ✅ Device A shows all updates
- ✅ No lag or freezing
- ✅ Final state matches last edit
- ✅ No duplicate whispers in list

---

## Socket Event Flow

### Edit Flow
```
1. User taps "Save" in EditWhisperModal
2. Frontend calls whisperWallAPI.editWhisper()
3. Backend PUT /api/whisperwall/:postId
4. Backend saves to database
5. Backend emits: global.io.emit('whispers:updated', { whisper })
6. All connected clients receive event
7. WhisperWallScreen.handleWhisperUpdated() updates state
8. UI re-renders with new data
```

### Delete Flow
```
1. User taps "Delete Whisper"
2. Frontend calls whisperWallAPI.deleteWhisper()
3. Backend DELETE /api/whisperwall/:postId
4. Backend removes from database
5. Backend emits: global.io.emit('whispers:deleted', { postId })
6. All connected clients receive event
7. WhisperWallScreen.handleWhisperDeleted() removes from state
8. UI re-renders without deleted whisper
```

---

## Success Criteria

All tests should pass:
- [x] Edit syncs to WhisperWall
- [x] Delete syncs to WhisperWall
- [x] Detail modal updates on edit
- [x] Detail modal closes on delete
- [x] Multiple users see updates
- [x] No errors in console
- [x] No backend errors
- [x] Fast response time (<500ms)

---

## Debug Mode

Enable verbose logging:

**Backend (server.js):**
```javascript
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});
```

**Frontend (WhisperWallScreen.tsx):**
```typescript
const handleWhisperUpdated = (data: { whisper: any }) => {
  console.log('🔔 Whisper updated event:', data.whisper);
  console.log('   Current whispers count:', whispers.length);
  console.log('   Updated whisper ID:', data.whisper._id);
  // ... rest of handler
};
```

---

## Notes

- Socket events are broadcast to ALL connected clients
- Updates happen even if user is on different screen
- ProfileScreen doesn't need socket listeners (it reloads after operations)
- WhisperWall is the main screen that needs real-time updates
- Socket connection is maintained throughout app lifecycle
