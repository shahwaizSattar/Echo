const mongoose = require('mongoose');
require('dotenv').config();

const Post = require('./models/Post');

async function testLocationPost() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all location-enabled posts
    const posts = await Post.find({ locationEnabled: true })
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`\n📍 Found ${posts.length} location posts\n`);

    posts.forEach((post, index) => {
      console.log(`Post ${index + 1}:`);
      console.log('  ID:', post._id);
      console.log('  Text:', post.content.text?.substring(0, 50));
      console.log('  LocationName:', post.locationName || 'NOT SET');
      console.log('  Rating:', post.rating || 'NOT SET');
      console.log('  Has GeoLocation:', !!post.geoLocation);
      console.log('  Coordinates:', post.geoLocation?.coordinates);
      console.log('  Created:', post.createdAt);
      console.log('---');
    });

    await mongoose.connection.close();
    console.log('\n✅ Test complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLocationPost();
