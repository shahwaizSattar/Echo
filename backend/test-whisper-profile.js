// Test script to verify whisper profile integration
const mongoose = require('mongoose');
require('dotenv').config();

const WhisperPost = require('./models/WhisperPost');
const User = require('./models/User');

async function testWhisperProfile() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whisperwall');
    console.log('✅ Connected to MongoDB');

    // Find a test user
    const testUser = await User.findOne();
    if (!testUser) {
      console.log('❌ No users found. Please create a user first.');
      process.exit(1);
    }
    console.log(`✅ Found test user: ${testUser.username} (${testUser._id})`);

    // Count all whispers
    const totalWhispers = await WhisperPost.countDocuments();
    console.log(`📊 Total whispers in database: ${totalWhispers}`);

    // Count whispers by this user
    const userWhispers = await WhisperPost.countDocuments({ userId: testUser._id });
    console.log(`📊 Whispers by ${testUser.username}: ${userWhispers}`);

    // Count one-time posts
    const oneTimePosts = await WhisperPost.countDocuments({ 
      userId: testUser._id,
      'oneTime.enabled': true 
    });
    console.log(`📊 One-time posts: ${oneTimePosts}`);

    // Get user's whispers (excluding one-time)
    const whispers = await WhisperPost.find({
      userId: testUser._id,
      isHidden: false,
      'oneTime.enabled': false
    }).sort({ createdAt: -1 });

    console.log(`\n✅ User's profile whispers (excluding one-time): ${whispers.length}`);
    
    whispers.forEach((whisper, index) => {
      console.log(`\n${index + 1}. Whisper ${whisper._id}`);
      console.log(`   Category: ${whisper.category}`);
      console.log(`   Text: ${whisper.content.text?.substring(0, 50)}...`);
      console.log(`   One-time: ${whisper.oneTime?.enabled || false}`);
      console.log(`   Vanish mode: ${whisper.vanishMode?.enabled || false}`);
      if (whisper.vanishMode?.enabled) {
        console.log(`   Vanish at: ${whisper.vanishMode.vanishAt}`);
      }
      console.log(`   Created: ${whisper.createdAt}`);
    });

    // Create a test whisper if none exist
    if (userWhispers === 0) {
      console.log('\n📝 Creating test whisper...');
      const testWhisper = new WhisperPost({
        userId: testUser._id,
        content: {
          text: 'This is a test whisper for profile display',
        },
        category: 'Random',
        vanishMode: { enabled: false },
        oneTime: { enabled: false },
      });
      await testWhisper.save();
      console.log('✅ Test whisper created:', testWhisper._id);
    }

    console.log('\n✅ Test complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testWhisperProfile();
