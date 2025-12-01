const mongoose = require('mongoose');
require('dotenv').config();

// Test backend logic validation
async function testBackendLogic() {
  console.log('🧪 Testing Backend Logic...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    const User = require('./models/User');
    const Post = require('./models/Post');

    // Test 1: User Model Validation
    console.log('\n📋 Test 1: User Model Validation');
    try {
      const testUser = new User({
        email: 'test@example.com',
        username: 'testuser123',
        password: 'password123',
        preferences: ['Gaming', 'Technology']
      });
      
      const validationError = testUser.validateSync();
      if (validationError) {
        console.log('❌ User validation failed:', validationError.message);
      } else {
        console.log('✅ User model validation passed');
      }
    } catch (error) {
      console.log('❌ User model test error:', error.message);
    }

    // Test 2: Post Model Validation
    console.log('\n📋 Test 2: Post Model Validation');
    try {
      const testPost = new Post({
        author: new mongoose.Types.ObjectId(),
        content: {
          text: 'This is a test post',
          media: []
        },
        category: 'Technology'
      });
      
      const validationError = testPost.validateSync();
      if (validationError) {
        console.log('❌ Post validation failed:', validationError.message);
      } else {
        console.log('✅ Post model validation passed');
      }
    } catch (error) {
      console.log('❌ Post model test error:', error.message);
    }

    // Test 3: Category Validation
    console.log('\n📋 Test 3: Category Validation');
    const validCategories = ['Gaming', 'Education', 'Beauty', 'Fitness', 'Music', 'Technology', 
      'Art', 'Food', 'Travel', 'Sports', 'Movies', 'Books', 'Fashion',
      'Photography', 'Comedy', 'Science', 'Politics', 'Business'];
    
    try {
      const invalidPost = new Post({
        author: new mongoose.Types.ObjectId(),
        content: { text: 'Test' },
        category: 'InvalidCategory'
      });
      
      const validationError = invalidPost.validateSync();
      if (validationError && validationError.errors.category) {
        console.log('✅ Category validation working - rejected invalid category');
      } else {
        console.log('❌ Category validation failed - should reject invalid categories');
      }
    } catch (error) {
      console.log('❌ Category validation test error:', error.message);
    }

    // Test 4: Password Hashing
    console.log('\n📋 Test 4: Password Hashing');
    try {
      const user = new User({
        email: 'hash@test.com',
        username: 'hashtest',
        password: 'plaintext123',
        preferences: ['Gaming']
      });
      
      const originalPassword = user.password;
      await user.save();
      
      if (user.password !== originalPassword && user.password.length > 20) {
        console.log('✅ Password hashing working');
        
        // Test password comparison
        const isMatch = await user.comparePassword('plaintext123');
        const isWrongMatch = await user.comparePassword('wrongpassword');
        
        if (isMatch && !isWrongMatch) {
          console.log('✅ Password comparison working');
        } else {
          console.log('❌ Password comparison failed');
        }
      } else {
        console.log('❌ Password hashing failed');
      }
      
      // Clean up
      await User.findByIdAndDelete(user._id);
    } catch (error) {
      console.log('❌ Password hashing test error:', error.message);
    }

    // Test 5: Reaction Logic
    console.log('\n📋 Test 5: Reaction Logic');
    try {
      const userId = new mongoose.Types.ObjectId();
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: { text: 'Test post for reactions' },
        category: 'Technology'
      });
      
      await post.save();
      
      // Add reaction
      await post.addReaction(userId, 'funny');
      
      if (post.reactions.funny.length === 1 && post.reactionCounts.funny === 1 && post.reactionCounts.total === 1) {
        console.log('✅ Add reaction logic working');
        
        // Test reaction replacement
        await post.addReaction(userId, 'love');
        
        if (post.reactions.funny.length === 0 && post.reactions.love.length === 1 && post.reactionCounts.total === 1) {
          console.log('✅ Reaction replacement logic working');
        } else {
          console.log('❌ Reaction replacement failed');
        }
        
        // Test reaction removal
        await post.removeReaction(userId);
        
        if (post.reactions.love.length === 0 && post.reactionCounts.total === 0) {
          console.log('✅ Remove reaction logic working');
        } else {
          console.log('❌ Remove reaction failed');
        }
      } else {
        console.log('❌ Add reaction logic failed');
      }
      
      // Clean up
      await Post.findByIdAndDelete(post._id);
    } catch (error) {
      console.log('❌ Reaction logic test error:', error.message);
    }

    // Test 6: Vanish Mode Logic
    console.log('\n📋 Test 6: Vanish Mode Logic');
    try {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: { text: 'Vanishing post' },
        category: 'Technology',
        vanishMode: {
          enabled: true,
          duration: '1hour'
        }
      });
      
      await post.save();
      
      if (post.vanishMode.vanishAt && post.vanishMode.vanishAt > new Date()) {
        console.log('✅ Vanish mode auto-calculation working');
      } else {
        console.log('❌ Vanish mode auto-calculation failed');
      }
      
      // Clean up
      await Post.findByIdAndDelete(post._id);
    } catch (error) {
      console.log('❌ Vanish mode test error:', error.message);
    }

    // Test 7: User Following Logic
    console.log('\n📋 Test 7: User Following Logic');
    try {
      const user1 = new User({
        email: 'user1@test.com',
        username: 'user1test',
        password: 'password123',
        preferences: ['Gaming']
      });
      
      const user2 = new User({
        email: 'user2@test.com',
        username: 'user2test',
        password: 'password123',
        preferences: ['Technology']
      });
      
      await user1.save();
      await user2.save();
      
      // Test following
      await user2.addFollower(user1._id);
      
      if (user2.followers.includes(user1._id) && user1.following.includes(user2._id)) {
        console.log('✅ Following logic working');
        
        // Test unfollowing
        await user2.removeFollower(user1._id);
        
        if (!user2.followers.includes(user1._id) && !user1.following.includes(user2._id)) {
          console.log('✅ Unfollowing logic working');
        } else {
          console.log('❌ Unfollowing logic failed');
        }
      } else {
        console.log('❌ Following logic failed');
      }
      
      // Clean up
      await User.findByIdAndDelete(user1._id);
      await User.findByIdAndDelete(user2._id);
    } catch (error) {
      console.log('❌ Following logic test error:', error.message);
    }

    console.log('\n🎯 Backend Logic Test Complete!');
    
  } catch (error) {
    console.error('❌ Test setup error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 MongoDB disconnected');
  }
}

// Run tests
testBackendLogic();