const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const User = require('./models/User');

async function testUserId() {
  try {
    // Find user by username
    const user = await User.findOne({ username: 'sohari' });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('✅ User found:');
    console.log('  Username:', user.username);
    console.log('  _id:', user._id);
    console.log('  _id type:', typeof user._id);
    console.log('  _id toString:', user._id.toString());
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testUserId();
