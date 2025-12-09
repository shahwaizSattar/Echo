const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whisperecho', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB\n');
  
  try {
    // Check Posts
    console.log('📝 Checking Post media URLs...');
    const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));
    const posts = await Post.find({ 'content.media': { $exists: true, $ne: [] } }).limit(5);
    
    posts.forEach((post, i) => {
      console.log(`\nPost ${i + 1}:`);
      if (post.content?.media) {
        post.content.media.forEach((media, j) => {
          console.log(`  Media ${j + 1}: ${media.url}`);
        });
      }
      if (post.content?.voiceNote?.url) {
        console.log(`  Voice Note: ${post.content.voiceNote.url}`);
      }
    });
    
    // Check Conversations
    console.log('\n\n💬 Checking Chat message media URLs...');
    const Conversation = mongoose.model('Conversation', new mongoose.Schema({}, { strict: false }));
    const conversations = await Conversation.find({ 'messages.media': { $exists: true, $ne: [] } }).limit(3);
    
    conversations.forEach((convo, i) => {
      console.log(`\nConversation ${i + 1}:`);
      const messagesWithMedia = convo.messages.filter(m => m.media && m.media.length > 0);
      messagesWithMedia.slice(0, 3).forEach((msg, j) => {
        console.log(`  Message ${j + 1}:`);
        msg.media.forEach((media, k) => {
          console.log(`    Media ${k + 1}: ${media.url}`);
        });
      });
    });
    
    // Check for any remaining absolute URLs
    console.log('\n\n🔍 Searching for remaining absolute URLs...');
    
    const postsWithAbsoluteUrls = await Post.find({
      $or: [
        { 'content.media.url': { $regex: '^http', $options: 'i' } },
        { 'content.voiceNote.url': { $regex: '^http', $options: 'i' } }
      ]
    }).limit(10);
    
    if (postsWithAbsoluteUrls.length > 0) {
      console.log(`❌ Found ${postsWithAbsoluteUrls.length} posts with absolute URLs:`);
      postsWithAbsoluteUrls.forEach((post, i) => {
        console.log(`\n  Post ${i + 1} (ID: ${post._id}):`);
        if (post.content?.media) {
          post.content.media.forEach(m => {
            if (m.url?.startsWith('http')) {
              console.log(`    ❌ ${m.url}`);
            }
          });
        }
        if (post.content?.voiceNote?.url?.startsWith('http')) {
          console.log(`    ❌ Voice: ${post.content.voiceNote.url}`);
        }
      });
    } else {
      console.log('✅ No posts with absolute URLs found!');
    }
    
    const convosWithAbsoluteUrls = await Conversation.find({
      'messages.media.url': { $regex: '^http', $options: 'i' }
    }).limit(10);
    
    if (convosWithAbsoluteUrls.length > 0) {
      console.log(`\n❌ Found ${convosWithAbsoluteUrls.length} conversations with absolute URLs`);
      convosWithAbsoluteUrls.forEach((convo, i) => {
        console.log(`\n  Conversation ${i + 1} (ID: ${convo._id}):`);
        convo.messages.forEach((msg, j) => {
          if (msg.media) {
            msg.media.forEach(m => {
              if (m.url?.startsWith('http')) {
                console.log(`    Message ${j + 1}: ❌ ${m.url}`);
              }
            });
          }
        });
      });
    } else {
      console.log('✅ No conversations with absolute URLs found!');
    }
    
    // Check current IP in frontend .env
    console.log('\n\n📱 Checking frontend configuration...');
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '../frontend/.env');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const ipMatch = envContent.match(/EXPO_PUBLIC_SERVER_IP=(.+)/);
      const portMatch = envContent.match(/EXPO_PUBLIC_SERVER_PORT=(.+)/);
      
      if (ipMatch) {
        console.log(`Current IP: ${ipMatch[1]}`);
      }
      if (portMatch) {
        console.log(`Current Port: ${portMatch[1]}`);
      }
    }
    
    // Check if files exist on disk
    console.log('\n\n📁 Checking if media files exist on disk...');
    const uploadsPath = path.join(__dirname, 'uploads');
    
    if (fs.existsSync(uploadsPath)) {
      const imagesPath = path.join(uploadsPath, 'images');
      const videosPath = path.join(uploadsPath, 'videos');
      const audioPath = path.join(uploadsPath, 'audio');
      
      const imageCount = fs.existsSync(imagesPath) ? fs.readdirSync(imagesPath).length : 0;
      const videoCount = fs.existsSync(videosPath) ? fs.readdirSync(videosPath).length : 0;
      const audioCount = fs.existsSync(audioPath) ? fs.readdirSync(audioPath).length : 0;
      
      console.log(`Images: ${imageCount} files`);
      console.log(`Videos: ${videoCount} files`);
      console.log(`Audio: ${audioCount} files`);
      
      if (imageCount > 0) {
        console.log('\nSample image files:');
        const images = fs.readdirSync(imagesPath).slice(0, 3);
        images.forEach(img => console.log(`  - ${img}`));
      }
      
      if (audioCount > 0) {
        console.log('\nSample audio files:');
        const audios = fs.readdirSync(audioPath).slice(0, 3);
        audios.forEach(audio => console.log(`  - ${audio}`));
      }
    } else {
      console.log('❌ Uploads directory not found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Done');
    process.exit(0);
  }
});
