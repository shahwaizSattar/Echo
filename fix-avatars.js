const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function fixAvatars() {
  try {
    console.log('🎭 Fixing user avatars...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', require('./backend/models/User').schema);

    // Update avatars for each user
    const avatarUpdates = [
      {
        username: 'alex_explorer',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=alex_explorer&backgroundColor=b6e3f4&eyeColor=brown&hairColor=brown&skinColor=f2d3b1'
      },
      {
        username: 'maya_creative',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=maya_creative&backgroundColor=ffdfbf&eyeColor=green&hairColor=red&skinColor=edb98a'
      },
      {
        username: 'sam_techie',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sam_techie&backgroundColor=c0aede&eyeColor=blue&hairColor=black&skinColor=d08b5b'
      },
      {
        username: 'zoe_foodie',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=zoe_foodie&backgroundColor=ffd5dc&eyeColor=brown&hairColor=blonde&skinColor=f2d3b1'
      }
    ];

    for (const update of avatarUpdates) {
      const result = await User.updateOne(
        { username: update.username },
        { $set: { avatar: update.avatar } }
      );
      console.log(`✅ Updated ${update.username}: ${result.modifiedCount} document(s) modified`);
    }

    // Verify updates
    const users = await User.find({}).select('username avatar');
    console.log('\n👥 Updated Users and Avatars:');
    users.forEach(user => {
      console.log(`${user.username}: ${user.avatar ? 'DiceBear avatar set' : 'No avatar'}`);
    });

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

fixAvatars();