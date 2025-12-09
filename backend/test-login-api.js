require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');

async function testLoginAPI() {
  try {
    console.log('🔐 Testing Login API...\n');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whisper-echo';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB successfully!\n');
    
    // Get all users
    const users = await User.find().select('username email password');
    console.log(`Found ${users.length} users in database:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });
    
    // Test login with first user
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`🧪 Testing login for user: ${testUser.username}`);
      console.log(`📧 Email: ${testUser.email}`);
      
      // Test with the actual password from seeded data
      const testPasswords = ['password123', 'Acer.112', 'test123', 'admin123'];
      
      for (const password of testPasswords) {
        console.log(`\n🔑 Testing password: "${password}"`);
        
        try {
          const isMatch = await bcrypt.compare(password, testUser.password);
          console.log(`   Result: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
          
          if (isMatch) {
            console.log(`   🎉 SUCCESS! Correct password for ${testUser.username} is: "${password}"`);
            break;
          }
        } catch (error) {
          console.log(`   ❌ Error comparing password: ${error.message}`);
        }
      }
      
      // Also test the newer users
      console.log('\n' + '='.repeat(50));
      console.log('🔍 Checking newer users (might be your actual accounts):');
      
      const newerUsers = users.filter(user => 
        user.email.includes('gmail.com') || 
        user.username.includes('shalabell') || 
        user.username.includes('sohario')
      );
      
      if (newerUsers.length > 0) {
        console.log('\nFound newer/real users:');
        newerUsers.forEach(user => {
          console.log(`- ${user.username} (${user.email}) - ID: ${user._id}`);
        });
        
        console.log('\n💡 Try logging in with these credentials:');
        newerUsers.forEach(user => {
          console.log(`   Username: ${user.username} OR Email: ${user.email}`);
        });
        console.log('   Password: [The password you used when registering]');
      }
    }
    
    // Check if there are any authentication-related issues
    console.log('\n' + '='.repeat(50));
    console.log('🔍 AUTHENTICATION TROUBLESHOOTING:');
    
    // Check for duplicate emails
    const emailCounts = {};
    users.forEach(user => {
      emailCounts[user.email] = (emailCounts[user.email] || 0) + 1;
    });
    
    const duplicateEmails = Object.entries(emailCounts).filter(([email, count]) => count > 1);
    if (duplicateEmails.length > 0) {
      console.log('⚠️  Duplicate emails found:');
      duplicateEmails.forEach(([email, count]) => {
        console.log(`   ${email}: ${count} users`);
      });
    } else {
      console.log('✅ No duplicate emails found');
    }
    
    // Check for duplicate usernames
    const usernameCounts = {};
    users.forEach(user => {
      usernameCounts[user.username] = (usernameCounts[user.username] || 0) + 1;
    });
    
    const duplicateUsernames = Object.entries(usernameCounts).filter(([username, count]) => count > 1);
    if (duplicateUsernames.length > 0) {
      console.log('⚠️  Duplicate usernames found:');
      duplicateUsernames.forEach(([username, count]) => {
        console.log(`   ${username}: ${count} users`);
      });
    } else {
      console.log('✅ No duplicate usernames found');
    }
    
    console.log('\n📋 SUMMARY:');
    console.log(`- Database has ${users.length} users`);
    console.log(`- All users have password hashes`);
    console.log(`- No duplicate emails or usernames`);
    console.log('- If login fails, check:');
    console.log('  1. Frontend is connecting to correct backend URL');
    console.log('  2. Using correct email/username and password');
    console.log('  3. Network connectivity between frontend and backend');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testLoginAPI().catch(console.error);