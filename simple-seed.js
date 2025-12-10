const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

// Simple User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  bio: { type: String, default: '' },
  customAvatar: {
    mask: {
      style: { type: String, default: 'cloth' },
      color: { type: String, default: '#E8E6E1' },
      pattern: { type: String, default: 'solid' }
    },
    hair: {
      style: { type: String, default: 'straight' },
      color: { type: String, default: '#8B8985' }
    },
    outfit: {
      type: { type: String, default: 'hoodie' },
      color: { type: String, default: '#D4D2CD' }
    },
    theme: {
      name: { type: String, default: 'urban-dawn' },
      lighting: { type: String, default: 'soft' },
      background: { type: String, default: '#F5F5F0' }
    },
    accessories: [{ type: Object }],
    enabled: { type: Boolean, default: false }
  },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function main() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    console.log('🧹 Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Users cleared');

    // Create test users with DiceBear avatars
    const testUsers = [
      {
        username: 'alex_explorer',
        email: 'alex@test.com',
        password: 'test123',
        bio: 'Adventure seeker and city explorer 🌟',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=alex_explorer&backgroundColor=b6e3f4&eyeColor=brown&hairColor=brown&skinColor=f2d3b1'
      },
      {
        username: 'maya_creative',
        email: 'maya@test.com',
        password: 'test123',
        bio: 'Artist and storyteller 🎨',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=maya_creative&backgroundColor=ffdfbf&eyeColor=green&hairColor=red&skinColor=edb98a'
      },
      {
        username: 'sam_techie',
        email: 'sam@test.com',
        password: 'test123',
        bio: 'Tech enthusiast and gamer 💻',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sam_techie&backgroundColor=c0aede&eyeColor=blue&hairColor=black&skinColor=d08b5b'
      },
      {
        username: 'zoe_foodie',
        email: 'zoe@test.com',
        password: 'test123',
        bio: 'Food lover and chef 🍕',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=zoe_foodie&backgroundColor=ffd5dc&eyeColor=brown&hairColor=blonde&skinColor=f2d3b1'
      }
    ];

    console.log('👥 Creating test users...');
    const createdUsers = [];

    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        bio: userData.bio,
        avatar: userData.avatar,
        isVerified: true
      });

      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`✅ Created user: ${userData.username} (ID: ${savedUser._id})`);
    }

    console.log('\n📋 USER CREDENTIALS:');
    console.log('==================');
    
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   ID: ${createdUsers[index]?._id}`);
      console.log('');
    });

    console.log('✅ Basic users created successfully!');
    console.log('💡 You can now use the API endpoints to create posts and messages.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

main();