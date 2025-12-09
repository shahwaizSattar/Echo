# Chat Media Storage in MongoDB

## Yes, chat media is saved in MongoDB! Here's how:

### 📁 **File Storage Architecture**

**Two-Part Storage System:**
1. **Physical Files**: Stored on server disk in `/backend/uploads/` folders
2. **Metadata**: Stored in MongoDB with file references

### 🗄️ **MongoDB Schema Structure**

**Conversation Collection:**
```javascript
{
  _id: ObjectId,
  participants: [ObjectId, ObjectId], // User IDs
  messages: [
    {
      _id: ObjectId,
      sender: ObjectId, // User ID
      text: String,
      media: [  // ✅ MEDIA ARRAY STORED HERE
        {
          url: String,        // e.g., "/uploads/images/uuid.jpg"
          type: String,       // "image", "video", or "audio"
          filename: String,   // "uuid.jpg"
          originalName: String, // "photo.jpg"
          size: Number        // File size in bytes
        }
      ],
      createdAt: Date,
      readBy: [ObjectId],
      reactions: [...],
      editedAt: Date,
      deleted: Boolean
    }
  ],
  lastMessageAt: Date
}
```

### 📤 **Upload Flow**

1. **User selects media** → Frontend uploads to `/api/upload/multiple`
2. **Server saves file** → Physical file stored in `/backend/uploads/images/` (or videos/audio)
3. **Server returns metadata** → `{ url, type, filename, originalName, size }`
4. **Frontend sends message** → POST `/api/chat/messages/:peerId` with media array
5. **Server saves to MongoDB** → Media metadata stored in conversation.messages[].media[]

### 💾 **What's Stored Where**

**On Server Disk (`/backend/uploads/`):**
```
/backend/uploads/
├── images/
│   ├── a89b4c86-9528-422f-a731-3b7059533c06.jpg
│   └── b12c5d87-1234-567f-b890-4e7f8g9h0i1j.png
├── videos/
│   └── c23d6e98-5678-901f-c234-5f6g7h8i9j0k.mp4
└── audio/
    └── d34e7f09-9012-345f-d678-6g7h8i9j0k1l.m4a
```

**In MongoDB (`conversations` collection):**
```javascript
{
  "messages": [
    {
      "text": "Check out this photo!",
      "media": [
        {
          "url": "/uploads/images/a89b4c86-9528-422f-a731-3b7059533c06.jpg",
          "type": "image",
          "filename": "a89b4c86-9528-422f-a731-3b7059533c06.jpg",
          "originalName": "vacation_photo.jpg",
          "size": 2048576
        }
      ],
      "sender": "user123",
      "createdAt": "2024-12-08T10:30:00Z"
    }
  ]
}
```

### 🔄 **Retrieval Process**

1. **Frontend requests messages** → GET `/api/chat/messages/:peerId`
2. **Server queries MongoDB** → Finds conversation with media metadata
3. **Frontend displays media** → Uses `getFullMediaUrl()` to construct full URLs
4. **Media loads** → Server serves files from `/uploads/` directory

### 🌐 **URL Construction**

**Frontend constructs full URLs:**
```javascript
// MongoDB stores: "/uploads/images/uuid.jpg"
// Frontend creates: "http://server:5000/uploads/images/uuid.jpg"

const getFullMediaUrl = (url) => {
  return `${BASE_URL.replace('/api', '')}${url}`;
};
```

### 🔍 **Key Benefits**

1. **Persistence**: Media metadata survives server restarts
2. **Searchability**: Can query messages by media type, size, etc.
3. **Relationships**: Media tied to specific conversations and users
4. **Metadata**: Original filenames, sizes, upload dates preserved
5. **Reactions**: Users can react to media messages
6. **Read Status**: Track which users have seen media messages

### 📊 **Example Query**

**Find all image messages in a conversation:**
```javascript
db.conversations.find({
  "participants": { "$all": [userId1, userId2] },
  "messages.media.type": "image"
});
```

**Find large video files:**
```javascript
db.conversations.find({
  "messages.media": {
    "$elemMatch": {
      "type": "video",
      "size": { "$gt": 10485760 } // > 10MB
    }
  }
});
```

## Summary

✅ **Yes, chat media is fully stored in MongoDB** (metadata) + server disk (files)  
✅ **Persistent across sessions** - messages with media are permanently saved  
✅ **Searchable and queryable** - can find messages by media type, size, date  
✅ **Integrated with chat features** - reactions, read status, editing all work with media  
✅ **Scalable architecture** - separates file storage from metadata for performance