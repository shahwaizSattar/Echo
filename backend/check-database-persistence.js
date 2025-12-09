require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');

// Import models
const User = require('./models/User');
const Post = require('./models/Post');
const WhisperPost = require('./models/WhisperPost');
const Conversation = require('./models/Conversation');
const Notification = require('./models/Notification');

async function checkDatabasePersistence() {
  try {
    console.log('🔍 Starting comprehensive database persistence check...\n');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whisper-echo';
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB successfully!');
    console.log('📊 Database name:', mongoose.connection.name);
    console.log('📊 Connection state:', mongoose.connection.readyState);
    console.log('📊 Host:', mongoose.connection.host);
    console.log('📊 Port:', mongoose.connection.port);
    console.log('');
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    console.log('');
    
    // Check Users
    console.log('👥 USERS CHECK:');
    const userCount = await User.countDocuments();
    console.log(`  Total users: ${userCount}`);
    
    if (userCount > 0) {
      const sampleUsers = await User.find().limit(3).select('username email createdAt');
      console.log('  Sample users:');
      sampleUsers.forEach(user => {
        console.log(`    - ${user.username} (${user.email}) - Created: ${user.createdAt}`);
      });
      
      // Check for users with media
      const usersWithMedia = await User.find({ 
        $or: [
          { 'avatar.url': { $exists: true, $ne: null } },
          { profilePicture: { $exists: true, $ne: null } }
        ]
      }).limit(5);
      console.log(`  Users with media: ${usersWithMedia.length}`);
    }
    console.log('');
    
    // Check Posts
    console.log('📝 POSTS CHECK:');
    const postCount = await Post.countDocuments();
    console.log(`  Total posts: ${postCount}`);
    
    if (postCount > 0) {
      const samplePosts = await Post.find().limit(3).select('content author createdAt media');
      console.log('  Sample posts:');
      samplePosts.forEach(post => {
        const contentPreview = typeof post.content === 'string' 
          ? post.content.substring(0, 50) 
          : JSON.stringify(post.content).substring(0, 50);
        console.log(`    - "${contentPreview}..." by ${post.author} - Created: ${post.createdAt}`);
        if (post.media && post.media.length > 0) {
          console.log(`      Media files: ${post.media.length}`);
          post.media.forEach(m => {
            console.log(`        - ${m.type}: ${m.url}`);
          });
        }
      });
      
      // Check for posts with media
      const postsWithMedia = await Post.find({ 
        'media.0': { $exists: true }
      });
      console.log(`  Posts with media: ${postsWithMedia.length}`);
      
      // Check media URLs
      if (postsWithMedia.length > 0) {
        console.log('  Media URL patterns:');
        const mediaUrls = [];
        postsWithMedia.forEach(post => {
          post.media.forEach(m => mediaUrls.push(m.url));
        });
        const uniquePatterns = [...new Set(mediaUrls.map(url => {
          if (url.includes('localhost')) return 'localhost';
          if (url.includes('172.20.10.2')) return 'IP-based';
          if (url.includes('http://')) return 'HTTP';
          if (url.includes('https://')) return 'HTTPS';
          return 'other';
        }))];
        uniquePatterns.forEach(pattern => {
          console.log(`    - ${pattern}`);
        });
      }
    }
    console.log('');
    
    // Check WhisperPosts
    console.log('🗣️ WHISPER POSTS CHECK:');
    const whisperCount = await WhisperPost.countDocuments();
    console.log(`  Total whisper posts: ${whisperCount}`);
    
    if (whisperCount > 0) {
      const sampleWhispers = await WhisperPost.find().limit(3).select('content userId createdAt');
      console.log('  Sample whisper posts:');
      sampleWhispers.forEach(whisper => {
        const contentPreview = whisper.content?.text 
          ? whisper.content.text.substring(0, 50) 
          : JSON.stringify(whisper.content).substring(0, 50);
        console.log(`    - "${contentPreview}..." by ${whisper.userId} - Created: ${whisper.createdAt}`);
      });
    }
    console.log('');
    
    // Check Conversations
    console.log('💬 CONVERSATIONS CHECK:');
    let conversationCount = 0;
    try {
      conversationCount = await Conversation.countDocuments();
      console.log(`  Total conversations: ${conversationCount}`);
      
      if (conversationCount > 0) {
        const sampleConversations = await Conversation.find().limit(3).select('participants messages createdAt');
        console.log('  Sample conversations:');
        sampleConversations.forEach(conv => {
          console.log(`    - ${conv.participants?.length || 0} participants, ${conv.messages?.length || 0} messages - ${conv.createdAt}`);
        });
      }
    } catch (error) {
      console.log('  ⚠️ Conversation model might not exist or have issues:', error.message);
    }
    
    // Check Notifications
    console.log('🔔 NOTIFICATIONS CHECK:');
    let notificationCount = 0;
    try {
      notificationCount = await Notification.countDocuments();
      console.log(`  Total notifications: ${notificationCount}`);
      
      if (notificationCount > 0) {
        const sampleNotifications = await Notification.find().limit(3).select('type recipient createdAt');
        console.log('  Sample notifications:');
        sampleNotifications.forEach(notif => {
          console.log(`    - ${notif.type} for ${notif.recipient} - ${notif.createdAt}`);
        });
      }
    } catch (error) {
      console.log('  ⚠️ Notification model might not exist or have issues:', error.message);
    }
    console.log('');
    
    // Check indexes
    console.log('🔍 INDEXES CHECK:');
    try {
      const userIndexes = await User.collection.getIndexes();
      console.log(`  User indexes: ${Object.keys(userIndexes).length}`);
      
      const postIndexes = await Post.collection.getIndexes();
      console.log(`  Post indexes: ${Object.keys(postIndexes).length}`);
      
      const whisperIndexes = await WhisperPost.collection.getIndexes();
      console.log(`  WhisperPost indexes: ${Object.keys(whisperIndexes).length}`);
    } catch (error) {
      console.log('  ⚠️ Error checking indexes:', error.message);
    }
    console.log('');
    
    // Test authentication
    console.log('🔐 AUTHENTICATION TEST:');
    const testUser = await User.findOne().select('username email password');
    if (testUser) {
      console.log(`  Found test user: ${testUser.username} (${testUser.email})`);
      console.log(`  Password hash exists: ${!!testUser.password}`);
      console.log(`  Password hash length: ${testUser.password?.length || 0}`);
    } else {
      console.log('  ⚠️ No users found for authentication test');
    }
    console.log('');
    
    // Check for dummy data vs real data
    console.log('🎭 DUMMY DATA CHECK:');
    const dummyUsers = await User.find({ 
      username: { $regex: /^(alice|bob|charlie|diana|eve)/i }
    });
    console.log(`  Dummy users found: ${dummyUsers.length}`);
    
    const dummyPosts = await Post.find({
      content: { $regex: /(beautiful sunset|morning coffee|weekend vibes)/i }
    });
    console.log(`  Dummy posts found: ${dummyPosts.length}`);
    console.log('');
    
    // Database persistence test
    console.log('💾 PERSISTENCE TEST:');
    const testData = {
      username: `test_persistence_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'hashedpassword123'
    };
    
    console.log('  Creating test user...');
    const testUserCreated = new User(testData);
    await testUserCreated.save();
    console.log(`  ✅ Test user created with ID: ${testUserCreated._id}`);
    
    console.log('  Retrieving test user...');
    const retrievedUser = await User.findById(testUserCreated._id);
    if (retrievedUser) {
      console.log(`  ✅ Test user retrieved successfully: ${retrievedUser.username}`);
    } else {
      console.log('  ❌ Test user could not be retrieved');
    }
    
    console.log('  Cleaning up test user...');
    await User.findByIdAndDelete(testUserCreated._id);
    console.log('  ✅ Test user cleaned up');
    console.log('');
    
    // Connection stability test
    console.log('🔄 CONNECTION STABILITY:');
    console.log(`  Connection ready state: ${mongoose.connection.readyState}`);
    console.log('  1 = connected, 0 = disconnected, 2 = connecting, 3 = disconnecting');
    
    // Check if connection is stable
    const connectionTest = new Promise((resolve) => {
      setTimeout(() => {
        resolve(mongoose.connection.readyState === 1);
      }, 1000);
    });
    
    const isStable = await connectionTest;
    console.log(`  Connection stable after 1s: ${isStable ? '✅' : '❌'}`);
    console.log('');
    
    console.log('📋 SUMMARY:');
    console.log(`  Database: ${mongoose.connection.name}`);
    console.log(`  Users: ${userCount}`);
    console.log(`  Posts: ${postCount}`);
    console.log(`  Whispers: ${whisperCount}`);
    console.log(`  Conversations: ${conversationCount}`);
    console.log(`  Notifications: ${notificationCount}`);
    console.log(`  Connection: ${isStable ? 'Stable' : 'Unstable'}`);
    
    if (userCount === 0) {
      console.log('\n⚠️  WARNING: No users found! This explains login issues.');
    }
    
    if (postCount === 0) {
      console.log('\n⚠️  WARNING: No posts found! This explains missing content.');
    }
    
    if (!isStable) {
      console.log('\n⚠️  WARNING: Database connection is unstable!');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkDatabasePersistence().catch(console.error);