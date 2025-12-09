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
  console.log('✅ Connected to MongoDB');
  
  try {
    // Fix URLs in Posts collection
    console.log('\n📝 Fixing Post media URLs...');
    const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));
    
    // Find posts with media (including external URLs that we should skip)
    const posts = await Post.find({
      $or: [
        { 'content.media': { $exists: true, $ne: [] } },
        { 'content.voiceNote.url': { $exists: true } }
      ]
    });
    
    let postsFixed = 0;
    for (const post of posts) {
      let modified = false;
      
      if (post.content && post.content.media && Array.isArray(post.content.media)) {
        post.content.media = post.content.media.map(media => {
          if (media.url && (media.url.startsWith('http://') || media.url.startsWith('https://'))) {
            // Only convert URLs that point to our uploads folder (skip external URLs)
            const match = media.url.match(/\/uploads\/.+$/);
            if (match) {
              console.log(`  Converting: ${media.url} -> ${match[0]}`);
              media.url = match[0];
              modified = true;
            } else {
              // Skip external URLs (picsum, googleapis, etc.)
              console.log(`  Skipping external URL: ${media.url.substring(0, 50)}...`);
            }
          }
          return media;
        });
      }
      
      // Fix voice note URLs
      if (post.content && post.content.voiceNote && post.content.voiceNote.url) {
        const voiceUrl = post.content.voiceNote.url;
        if (voiceUrl.startsWith('http://') || voiceUrl.startsWith('https://')) {
          const match = voiceUrl.match(/\/uploads\/.+$/);
          if (match) {
            console.log(`  Converting voice note: ${voiceUrl} -> ${match[0]}`);
            post.content.voiceNote.url = match[0];
            modified = true;
          } else {
            console.log(`  Skipping external voice URL: ${voiceUrl.substring(0, 50)}...`);
          }
        }
      }
      
      if (modified) {
        try {
          await post.save();
          postsFixed++;
        } catch (err) {
          console.log(`  ⚠️ Error saving post ${post._id}: ${err.message}`);
        }
      }
    }
    
    console.log(`✅ Fixed ${postsFixed} posts`);
    
    // Fix URLs in Conversations collection
    console.log('\n💬 Fixing Chat message media URLs...');
    const Conversation = mongoose.model('Conversation', new mongoose.Schema({}, { strict: false }));
    const conversations = await Conversation.find({
      $or: [
        { 'messages.media': { $exists: true, $ne: [] } },
        { 'messages.media.url': { $regex: '/uploads/' } }
      ]
    });
    
    let conversationsFixed = 0;
    for (const convo of conversations) {
      let modified = false;
      
      if (convo.messages && Array.isArray(convo.messages)) {
        convo.messages.forEach(message => {
          if (message.media && Array.isArray(message.media)) {
            message.media = message.media.map(media => {
              if (media.url && (media.url.startsWith('http://') || media.url.startsWith('https://'))) {
                const match = media.url.match(/\/uploads\/.+$/);
                if (match) {
                  console.log(`  Converting: ${media.url} -> ${match[0]}`);
                  media.url = match[0];
                  modified = true;
                } else {
                  console.log(`  Skipping external URL: ${media.url.substring(0, 50)}...`);
                }
              }
              return media;
            });
          }
        });
      }
      
      if (modified) {
        try {
          await convo.save();
          conversationsFixed++;
        } catch (err) {
          console.log(`  ⚠️ Error saving conversation ${convo._id}: ${err.message}`);
        }
      }
    }
    
    console.log(`✅ Fixed ${conversationsFixed} conversations`);
    
    // Fix URLs in WhisperPost collection
    console.log('\n🔮 Fixing WhisperPost media URLs...');
    const WhisperPost = mongoose.model('WhisperPost', new mongoose.Schema({}, { strict: false }));
    const whispers = await WhisperPost.find({ 'content.media': { $exists: true, $ne: [] } });
    
    let whispersFixed = 0;
    for (const whisper of whispers) {
      let modified = false;
      
      if (whisper.content && whisper.content.media && Array.isArray(whisper.content.media)) {
        whisper.content.media = whisper.content.media.map(media => {
          if (media.url && (media.url.startsWith('http://') || media.url.startsWith('https://'))) {
            const match = media.url.match(/\/uploads\/.+$/);
            if (match) {
              console.log(`  Converting: ${media.url} -> ${match[0]}`);
              media.url = match[0];
              modified = true;
            }
          }
          return media;
        });
      }
      
      if (modified) {
        await whisper.save();
        whispersFixed++;
      }
    }
    
    console.log(`✅ Fixed ${whispersFixed} whisper posts`);
    
    // Fix URLs in User avatars
    console.log('\n👤 Fixing User avatar URLs...');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find({ 
      avatar: { 
        $regex: '^http', 
        $options: 'i' 
      } 
    });
    
    let usersFixed = 0;
    for (const user of users) {
      if (user.avatar && (user.avatar.startsWith('http://') || user.avatar.startsWith('https://'))) {
        const match = user.avatar.match(/\/uploads\/.+$/);
        if (match) {
          console.log(`  Converting: ${user.avatar} -> ${match[0]}`);
          user.avatar = match[0];
          await user.save();
          usersFixed++;
        }
      }
    }
    
    console.log(`✅ Fixed ${usersFixed} user avatars`);
    
    console.log('\n🎉 All media URLs have been converted to relative paths!');
    console.log('📱 Your media will now work with any IP address.');
    
  } catch (error) {
    console.error('❌ Error fixing media URLs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
});
