// Migration script to add userId to existing whispers
const mongoose = require('mongoose');
require('dotenv').config();

const WhisperPost = require('./models/WhisperPost');
const User = require('./models/User');

async function migrateWhisperUserId() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whisperwall');
    console.log('✅ Connected to MongoDB');

    // Find whispers without userId
    const whispersWithoutUserId = await WhisperPost.find({
      $or: [
        { userId: { $exists: false } },
        { userId: null }
      ]
    });

    console.log(`📊 Found ${whispersWithoutUserId.length} whispers without userId`);

    if (whispersWithoutUserId.length === 0) {
      console.log('✅ All whispers already have userId. No migration needed.');
      process.exit(0);
    }

    // Get a default user to assign (first user in database)
    const defaultUser = await User.findOne();
    if (!defaultUser) {
      console.log('❌ No users found. Cannot migrate whispers.');
      console.log('💡 Create a user first, then run this script again.');
      process.exit(1);
    }

    console.log(`\n📝 Will assign whispers to user: ${defaultUser.username} (${defaultUser._id})`);
    console.log('⚠️  Note: This is a one-time migration. New whispers will automatically get userId.');
    
    // Ask for confirmation (in production, you might want to add a prompt)
    console.log('\n🔄 Starting migration...');

    let updated = 0;
    for (const whisper of whispersWithoutUserId) {
      whisper.userId = defaultUser._id;
      await whisper.save();
      updated++;
      
      if (updated % 10 === 0) {
        console.log(`   Updated ${updated}/${whispersWithoutUserId.length} whispers...`);
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updated} whispers.`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Total whispers migrated: ${updated}`);
    console.log(`   - Assigned to user: ${defaultUser.username}`);
    console.log(`   - User ID: ${defaultUser._id}`);

    // Verify migration
    const remainingWithoutUserId = await WhisperPost.countDocuments({
      $or: [
        { userId: { $exists: false } },
        { userId: null }
      ]
    });

    if (remainingWithoutUserId === 0) {
      console.log('\n✅ Verification passed: All whispers now have userId');
    } else {
      console.log(`\n⚠️  Warning: ${remainingWithoutUserId} whispers still without userId`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateWhisperUserId();
