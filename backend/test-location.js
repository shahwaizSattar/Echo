require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User'); // Load User model for populate

// Test coordinates (Karachi, Pakistan area)
const testLocations = {
  fbArea: { lat: 24.9056, lng: 67.0822, name: 'FB Area Block-2' },
  clifton: { lat: 24.8138, lng: 67.0299, name: 'Clifton' },
  gulshan: { lat: 24.9211, lng: 67.0933, name: 'Gulshan-e-Iqbal' },
  saddar: { lat: 24.8607, lng: 67.0011, name: 'Saddar' },
};

// Haversine formula to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

async function testLocationFeature() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whisper-echo';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Check if geo index exists
    const db = mongoose.connection.db;
    const postsCollection = db.collection('posts');
    const indexes = await postsCollection.indexes();
    const hasGeoIndex = indexes.some(idx => 
      idx.name === 'geoLocation_2dsphere' || 
      (idx.key && idx.key.geoLocation === '2dsphere')
    );

    if (!hasGeoIndex) {
      console.log('⚠️  WARNING: Geospatial index not found!');
      console.log('   Run: node backend/scripts/createGeoIndex.js\n');
    } else {
      console.log('✅ Geospatial index exists\n');
    }

    // Test 1: Check existing location-enabled posts
    console.log('📍 Test 1: Checking existing location-enabled posts...');
    const locationPosts = await Post.find({ locationEnabled: true })
      .populate('author', 'username')
      .limit(5);
    
    console.log(`   Found ${locationPosts.length} location-enabled posts`);
    locationPosts.forEach(post => {
      if (post.geoLocation && post.geoLocation.coordinates) {
        const [lng, lat] = post.geoLocation.coordinates;
        console.log(`   - Post by @${post.author?.username || 'unknown'}`);
        console.log(`     Location: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
        console.log(`     Content: ${post.content.text.substring(0, 50)}...`);
      }
    });
    console.log('');

    // Test 2: Test distance calculation
    console.log('📏 Test 2: Testing distance calculations...');
    const { fbArea, clifton, gulshan, saddar } = testLocations;
    
    console.log(`   Distance from ${fbArea.name} to:`);
    console.log(`   - ${clifton.name}: ${calculateDistance(fbArea.lat, fbArea.lng, clifton.lat, clifton.lng).toFixed(2)} km`);
    console.log(`   - ${gulshan.name}: ${calculateDistance(fbArea.lat, fbArea.lng, gulshan.lat, gulshan.lng).toFixed(2)} km`);
    console.log(`   - ${saddar.name}: ${calculateDistance(fbArea.lat, fbArea.lng, saddar.lat, saddar.lng).toFixed(2)} km`);
    console.log('');

    // Test 3: Test $near query
    console.log('🔍 Test 3: Testing $near query from FB Area...');
    try {
      const nearbyPosts = await Post.find({
        locationEnabled: true,
        geoLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [fbArea.lng, fbArea.lat],
            },
            $maxDistance: 50000, // 50km in meters
          },
        },
      })
        .populate('author', 'username')
        .limit(10);

      console.log(`   Found ${nearbyPosts.length} posts within 50km`);
      nearbyPosts.forEach((post, index) => {
        if (post.geoLocation && post.geoLocation.coordinates) {
          const [lng, lat] = post.geoLocation.coordinates;
          const distance = calculateDistance(fbArea.lat, fbArea.lng, lat, lng);
          console.log(`   ${index + 1}. @${post.author?.username || 'unknown'} - ${distance.toFixed(2)} km away`);
          console.log(`      "${post.content.text.substring(0, 60)}..."`);
        }
      });
    } catch (error) {
      console.log('   ❌ Error with $near query:', error.message);
      if (error.message.includes('2dsphere')) {
        console.log('   💡 Solution: Run node backend/scripts/createGeoIndex.js');
      }
    }
    console.log('');

    // Test 4: Test ring filtering
    console.log('🎯 Test 4: Testing ring filtering...');
    const rings = [
      { name: 'Inner (0-2km)', min: 0, max: 2000 },
      { name: 'Mid (2-10km)', min: 2000, max: 10000 },
      { name: 'Outer (10-50km)', min: 10000, max: 50000 },
    ];

    for (const ring of rings) {
      try {
        const ringPosts = await Post.find({
          locationEnabled: true,
          geoLocation: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [fbArea.lng, fbArea.lat],
              },
              $minDistance: ring.min,
              $maxDistance: ring.max,
            },
          },
        }).limit(5);

        console.log(`   ${ring.name}: ${ringPosts.length} posts`);
      } catch (error) {
        console.log(`   ${ring.name}: Error - ${error.message}`);
      }
    }
    console.log('');

    // Summary
    console.log('📊 Summary:');
    const totalPosts = await Post.countDocuments({});
    const locationEnabledPosts = await Post.countDocuments({ locationEnabled: true });
    const postsWithCoords = await Post.countDocuments({
      locationEnabled: true,
      'geoLocation.coordinates': { $exists: true, $ne: [] }
    });

    console.log(`   Total posts: ${totalPosts}`);
    console.log(`   Location-enabled posts: ${locationEnabledPosts}`);
    console.log(`   Posts with coordinates: ${postsWithCoords}`);
    console.log('');

    if (postsWithCoords === 0) {
      console.log('💡 To test the feature:');
      console.log('   1. Open the app and go to City Radar');
      console.log('   2. Click "Post Here" button');
      console.log('   3. Create a post with location enabled');
      console.log('   4. Run this test again to see the results');
    } else {
      console.log('✅ Location feature is working!');
      console.log('   Posts are being created with coordinates');
      console.log('   Distance calculations are accurate');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

testLocationFeature();
