const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whisperecho', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB\n');
  
  try {
    const Conversation = mongoose.connection.collection('conversations');
    
    // Find the conversation with your uploaded media
    const convo = await Conversation.findOne({ _id: new mongoose.Types.ObjectId('693711d626aa553cd7e4ad55') });
    
    if (convo) {
      console.log('📱 Found your conversation!\n');
      
      const messagesWithMedia = convo.messages.filter(m => m.media && m.media.length > 0);
      
      console.log(`Found ${messagesWithMedia.length} messages with media\n`);
      
      messagesWithMedia.forEach((msg, i) => {
        console.log(`Message ${i + 1}:`);
        msg.media.forEach((media, j) => {
          console.log(`  Media ${j + 1}:`);
          console.log(`    URL in DB: ${media.url}`);
          
          // Check if file exists
          if (media.url.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, media.url);
            const exists = fs.existsSync(filePath);
            console.log(`    File exists: ${exists ? '✅ YES' : '❌ NO'}`);
            console.log(`    Full path: ${filePath}`);
            
            if (exists) {
              const stats = fs.statSync(filePath);
              console.log(`    File size: ${(stats.size / 1024).toFixed(2)} KB`);
            }
          }
          console.log('');
        });
      });
      
      // Show what the frontend should construct
      console.log('\n🔧 Frontend should construct URLs like:');
      console.log(`http://192.168.10.2:5000/uploads/images/178141bf-6ee9-4a39-8d15-1ed59448c5d6.jpg`);
      
    } else {
      console.log('❌ Conversation not found');
    }
    
    // Check Post with voice note
    console.log('\n\n🎤 Checking Post with voice note...');
    const Post = mongoose.connection.collection('posts');
    const postWithVoice = await Post.findOne({ 
      'content.voiceNote.url': { $regex: '33118450-7969-4bb0-aec4-7c4a287a1b76' }
    });
    
    if (postWithVoice) {
      console.log('Found post with voice note!');
      console.log(`Voice URL in DB: ${postWithVoice.content.voiceNote.url}`);
      
      if (postWithVoice.content.voiceNote.url.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, postWithVoice.content.voiceNote.url);
        const exists = fs.existsSync(filePath);
        console.log(`File exists: ${exists ? '✅ YES' : '❌ NO'}`);
        console.log(`Full path: ${filePath}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
});
