const mongoose = require('mongoose');
require('dotenv').config();

async function debugFollowingLogic() {
  console.log('🔍 Debugging Following Logic...\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    const User = require('./models/User');

    const user1 = new User({
      email: 'debug1@test.com',
      username: 'debug1',
      password: 'password123',
      preferences: ['Gaming']
    });
    
    const user2 = new User({
      email: 'debug2@test.com',
      username: 'debug2',
      password: 'password123',
      preferences: ['Technology']
    });
    
    await user1.save();
    await user2.save();
    
    console.log('👤 User1 ID:', user1._id);
    console.log('👤 User2 ID:', user2._id);
    
    console.log('\n📊 Before following:');
    console.log('User1 following:', user1.following);
    console.log('User2 followers:', user2.followers);
    
    // Test following - user1 follows user2
    await user2.addFollower(user1._id);
    
    // Refresh from database
    const updatedUser1 = await User.findById(user1._id);
    const updatedUser2 = await User.findById(user2._id);
    
    console.log('\n📊 After following:');
    console.log('User1 following:', updatedUser1.following);
    console.log('User2 followers:', updatedUser2.followers);
    console.log('User1 following count:', updatedUser1.stats.followingCount);
    console.log('User2 followers count:', updatedUser2.stats.followersCount);
    
    // Check if logic worked
    const user1FollowsUser2 = updatedUser1.following.some(id => id.equals(user2._id));
    const user2HasUser1AsFollower = updatedUser2.followers.some(id => id.equals(user1._id));
    
    console.log('\n✅ Validation:');
    console.log('User1 follows User2:', user1FollowsUser2);
    console.log('User2 has User1 as follower:', user2HasUser1AsFollower);
    
    if (user1FollowsUser2 && user2HasUser1AsFollower) {
      console.log('✅ Following logic is working correctly!');
    } else {
      console.log('❌ Following logic has issues');
    }
    
    // Clean up
    await User.findByIdAndDelete(user1._id);
    await User.findByIdAndDelete(user2._id);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugFollowingLogic();