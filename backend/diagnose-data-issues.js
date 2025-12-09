require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');

// Import models
const User = require('./models/User');
const Post = require('./models/Post');
const WhisperPost = require('./models/WhisperPost');
const Conversation = require('./models/Conversation');

async function diagnoseDataIssues() {
  try {
    console.log('🔍 Diagnosing data persistence issues...\n');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whisper-echo';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB successfully!\n');
    
    // 1. Check Users and Authentication
    console.log('👥 USER AUTHENTICATION ANALYSIS:');
    const users = await User.find().select('username email password createdAt');
    console.log(`Total users: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\nUser details:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email})`);
        console.log(`   Password hash: ${user.password ? 'EXISTS' : 'MISSING'}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   ID: ${user._id}`);
      });
      
      // Test login for first user
      const testUser = users[0];
      console.log(`\n🔐 Testing authentication for: ${testUser.username}`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password hash length: ${testUser.password?.length || 0}`);
      console.log(`   Hash starts with: ${testUser.password?.substring(0, 10) || 'N/A'}`);
    } else {
      console.log('❌ NO USERS FOUND - This explains login issues!');
    }
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 2. Check Posts and Media
    console.log('📝 POST AND MEDIA ANALYSIS:');
    const posts = await Post.find().select('content author createdAt media').populate('author', 'username');
    console.log(`Total posts: ${posts.length}`);
    
    if (posts.length > 0) {
      console.log('\nPost details:');
      posts.slice(0, 5).forEach((post, index) => {
        console.log(`${index + 1}. Post ID: ${post._id}`);
        console.log(`   Author: ${post.author?.username || 'Unknown'} (${post.author?._id})`);
        console.log(`   Content text: "${post.content?.text || 'No text'}" (${post.content?.text?.length || 0} chars)`);
        console.log(`   Created: ${post.createdAt}`);
        
        if (post.content?.media && post.content.media.length > 0) {
          console.log(`   Media files: ${post.content.media.length}`);
          post.content.media.forEach((media, i) => {
            console.log(`     ${i + 1}. Type: ${media.type}, URL: ${media.url}`);
            console.log(`        File: ${media.filename}, Size: ${media.size} bytes`);
          });
        } else {
          console.log('   Media files: 0');
        }
        
        // Check moderation data
        if (post.content?.moderation) {
          console.log(`   Moderation severity: ${post.content.moderation.severity}`);
          console.log(`   Moderation scores: ${JSON.stringify(post.content.moderation.scores)}`);
        }
        console.log('');
      });
      
      // Check for media URL patterns
      const postsWithMedia = await Post.find({ 'content.media.0': { $exists: true } });
      console.log(`Posts with media: ${postsWithMedia.length}`);
      
      if (postsWithMedia.length > 0) {
        console.log('\nMedia URL analysis:');
        const allMediaUrls = [];
        postsWithMedia.forEach(post => {
          post.content.media.forEach(media => {
            allMediaUrls.push(media.url);
          });
        });
        
        const urlPatterns = {
          localhost: allMediaUrls.filter(url => url.includes('localhost')).length,
          ipBased: allMediaUrls.filter(url => url.includes('172.20.10.2')).length,
          http: allMediaUrls.filter(url => url.startsWith('http://')).length,
          https: allMediaUrls.filter(url => url.startsWith('https://')).length,
          relative: allMediaUrls.filter(url => !url.startsWith('http')).length
        };
        
        console.log('URL patterns:');
        Object.entries(urlPatterns).forEach(([pattern, count]) => {
          console.log(`  ${pattern}: ${count} URLs`);
        });
        
        console.log('\nSample media URLs:');
        allMediaUrls.slice(0, 3).forEach(url => {
          console.log(`  - ${url}`);
        });
      }
    } else {
      console.log('❌ NO POSTS FOUND - This explains missing content!');
    }
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 3. Check Conversations/Messages
    console.log('💬 CONVERSATION ANALYSIS:');
    const conversations = await Conversation.find().populate('participants', 'username');
    console.log(`Total conversations: ${conversations.length}`);
    
    if (conversations.length > 0) {
      console.log('\nConversation details:');
      conversations.slice(0, 3).forEach((conv, index) => {
        console.log(`${index + 1}. Conversation ID: ${conv._id}`);
        console.log(`   Participants: ${conv.participants?.map(p => p.username).join(', ') || 'Unknown'}`);
        console.log(`   Messages: ${conv.messages?.length || 0}`);
        console.log(`   Created: ${conv.createdAt}`);
        
        if (conv.messages && conv.messages.length > 0) {
          console.log('   Recent messages:');
          conv.messages.slice(-2).forEach((msg, i) => {
            console.log(`     - "${msg.content?.substring(0, 30) || 'No content'}..." (${msg.createdAt})`);
          });
        }
        console.log('');
      });
    }
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 4. Check WhisperPosts
    console.log('🗣️ WHISPER POST ANALYSIS:');
    const whispers = await WhisperPost.find();
    console.log(`Total whisper posts: ${whispers.length}`);
    
    if (whispers.length === 0) {
      console.log('❌ NO WHISPER POSTS FOUND - This might be expected or indicate an issue');
    } else {
      console.log('\nWhisper post details:');
      whispers.slice(0, 3).forEach((whisper, index) => {
        console.log(`${index + 1}. Whisper ID: ${whisper._id}`);
        console.log(`   Content: "${whisper.content?.text || 'No text'}"`);
        console.log(`   User ID: ${whisper.userId}`);
        console.log(`   Created: ${whisper.createdAt}`);
      });
    }
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 5. Data Consistency Check
    console.log('🔍 DATA CONSISTENCY CHECK:');
    
    // Check for orphaned posts (posts without valid authors)
    const orphanedPosts = await Post.find().populate('author');
    const orphanedCount = orphanedPosts.filter(post => !post.author).length;
    console.log(`Orphaned posts (no valid author): ${orphanedCount}`);
    
    // Check for posts with empty content
    const emptyContentPosts = await Post.find({
      $or: [
        { 'content.text': { $exists: false } },
        { 'content.text': '' },
        { 'content.text': null }
      ]
    });
    console.log(`Posts with empty text content: ${emptyContentPosts.length}`);
    
    // Check for users without proper email/username
    const invalidUsers = await User.find({
      $or: [
        { email: { $exists: false } },
        { email: '' },
        { username: { $exists: false } },
        { username: '' }
      ]
    });
    console.log(`Users with invalid email/username: ${invalidUsers.length}`);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 6. Server Configuration Check
    console.log('⚙️ SERVER CONFIGURATION:');
    console.log(`MongoDB URI: ${mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    console.log(`Database name: ${mongoose.connection.name}`);
    console.log(`Server IP from env: ${process.env.SERVER_IP || 'Not set'}`);
    console.log(`Port from env: ${process.env.PORT || 'Not set'}`);
    console.log(`Node environment: ${process.env.NODE_ENV || 'Not set'}`);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 7. Recommendations
    console.log('💡 RECOMMENDATIONS:');
    
    if (users.length === 0) {
      console.log('❌ CRITICAL: No users found!');
      console.log('   - Run seed script to create test users');
      console.log('   - Check if data was created in a different database');
    }
    
    if (posts.length === 0) {
      console.log('❌ CRITICAL: No posts found!');
      console.log('   - Run seed script to create test posts');
      console.log('   - Check if data was created in a different database');
    }
    
    const postsWithMediaCount = await Post.countDocuments({ 'content.media.0': { $exists: true } });
    if (postsWithMediaCount === 0 && posts.length > 0) {
      console.log('⚠️  WARNING: No posts with media found');
      console.log('   - Media might not be uploading correctly');
      console.log('   - Check upload middleware and file storage');
    }
    
    if (orphanedCount > 0) {
      console.log('⚠️  WARNING: Orphaned posts detected');
      console.log('   - Some posts reference deleted users');
      console.log('   - Consider cleaning up or fixing references');
    }
    
    console.log('\n✅ Diagnosis complete!');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the diagnosis
diagnoseDataIssues().catch(console.error);