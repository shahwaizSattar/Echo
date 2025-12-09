const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');
const Post = require('./models/Post');
const WhisperPost = require('./models/WhisperPost');

// Load .env from backend directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Sample data
const dummyUsers = [
  {
    email: 'sohari@example.com',
    username: 'sohari',
    password: 'password123',
    bio: 'Main account - Testing all features',
    preferences: ['Technology', 'Gaming', 'Music'],
  },
  {
    email: 'alex@example.com',
    username: 'alex_tech',
    password: 'password123',
    bio: 'Tech enthusiast and gamer 🎮',
    preferences: ['Technology', 'Gaming'],
  },
  {
    email: 'sarah@example.com',
    username: 'sarah_music',
    password: 'password123',
    bio: 'Music lover and artist 🎵',
    preferences: ['Music', 'Art'],
  },
  {
    email: 'mike@example.com',
    username: 'mike_fitness',
    password: 'password123',
    bio: 'Fitness coach and health advocate 💪',
    preferences: ['Fitness', 'Food'],
  },
  {
    email: 'emma@example.com',
    username: 'emma_travel',
    password: 'password123',
    bio: 'Travel blogger exploring the world 🌍',
    preferences: ['Travel', 'Photography'],
  },
];

// Sample media URLs (using placeholder images/videos)
const sampleImages = [
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/800/600?random=4',
  'https://picsum.photos/800/600?random=5',
];

const sampleVideos = [
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
];

// Sample voice note URL (placeholder)
const sampleVoiceNote = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const postContents = {
  Technology: [
    'Just discovered this amazing new framework! 🚀',
    'AI is changing everything we know about development',
    'What\'s your favorite programming language and why?',
    'The future of web development looks incredible',
  ],
  Gaming: [
    'Just hit level 100! Who else is playing?',
    'This game has the best graphics I\'ve ever seen',
    'Looking for teammates for tonight\'s raid',
    'Game of the year contender right here',
  ],
  Music: [
    'This song has been on repeat all day 🎵',
    'Concert was absolutely incredible last night!',
    'What\'s everyone listening to this week?',
    'New album drops tomorrow, can\'t wait!',
  ],
  Fitness: [
    'Crushed my workout today! 💪',
    'Meal prep Sunday is the best',
    'Who else is training for a marathon?',
    'Fitness tip: consistency beats intensity',
  ],
  Travel: [
    'The views from this mountain are breathtaking',
    'Best food I\'ve ever had in this city',
    'Travel tip: always book flights on Tuesday',
    'Can\'t believe I\'m actually here!',
  ],
  Food: [
    'Made this amazing dish today! Recipe in comments',
    'This restaurant is a hidden gem',
    'Coffee and good vibes ☕',
    'Trying out a new recipe tonight',
  ],
  Art: [
    'Finished this piece after weeks of work',
    'Art is therapy for the soul',
    'What medium do you prefer?',
    'Inspired by nature and colors',
  ],
  Photography: [
    'Golden hour never disappoints',
    'Captured this moment at the perfect time',
    'Photography is all about perspective',
    'New camera, who dis? 📸',
  ],
};

const pollQuestions = [
  {
    question: 'What\'s your favorite time to post?',
    options: [
      { text: 'Morning', emoji: '🌅' },
      { text: 'Afternoon', emoji: '☀️' },
      { text: 'Evening', emoji: '🌆' },
      { text: 'Night', emoji: '🌙' },
    ],
  },
  {
    question: 'Best social media feature?',
    options: [
      { text: 'Stories', emoji: '📱' },
      { text: 'Reels', emoji: '🎬' },
      { text: 'Posts', emoji: '📝' },
      { text: 'Live', emoji: '🔴' },
    ],
  },
  {
    question: 'Coffee or Tea?',
    options: [
      { text: 'Coffee', emoji: '☕' },
      { text: 'Tea', emoji: '🍵' },
    ],
  },
];

// Helper function to generate coordinates at specific distances
// This creates realistic location-based posts for testing City Radar
function generateNearbyCoordinates(baseLat, baseLng, distanceKm, bearing = 0) {
  const earthRadius = 6371; // km
  const bearingRad = (bearing * Math.PI) / 180;
  const latRad = (baseLat * Math.PI) / 180;
  const distRatio = distanceKm / earthRadius;

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(distRatio) +
    Math.cos(latRad) * Math.sin(distRatio) * Math.cos(bearingRad)
  );

  const newLngRad = ((baseLng * Math.PI) / 180) + Math.atan2(
    Math.sin(bearingRad) * Math.sin(distRatio) * Math.cos(latRad),
    Math.cos(distRatio) - Math.sin(latRad) * Math.sin(newLatRad)
  );

  return [
    (newLngRad * 180) / Math.PI, // longitude
    (newLatRad * 180) / Math.PI  // latitude
  ];
}

// Base location (you can change this to your actual location)
// Default: Karachi, Pakistan (change to your city)
const YOUR_LOCATION = {
  lat: 24.8607,  // Change to your latitude
  lng: 67.0011,  // Change to your longitude
  city: 'Karachi',
  country: 'Pakistan',
  emoji: '🏙️'
};

// Generate posts at various distances from your location
const locationPosts = [
  // Ultra-local (within 500m)
  {
    city: 'Coffee Shop',
    country: YOUR_LOCATION.country,
    emoji: '☕',
    coords: generateNearbyCoordinates(YOUR_LOCATION.lat, YOUR_LOCATION.lng, 0.2, 45), // 200m northeast
    distance: '200m',
    type: 'ultra-local'
  },
  {
    city: 'Local Park',
    country: YOUR_LOCATION.country,
    emoji: '🌳',
    coords: generateNearbyCoordinates(YOUR_LOCATION.lat, YOUR_LOCATION.lng, 0.4, 135), // 400m southeast
    distance: '400m',
    type: 'ultra-local'
  },
  {
    city: 'Nearby Restaurant',
    country: YOUR_LOCATION.country,
    emoji: '🍽️',
    coords: generateNearbyCoordinates(YOUR_LOCATION.lat, YOUR_LOCATION.lng, 0.5, 270), // 500m west
    distance: '500m',
    type: 'ultra-local'
  },
  
  // Nearby (500m - 5km)
  {
    city: 'Shopping Mall',
    country: YOUR_LOCATION.country,
    emoji: '🛍️',
    coords: generateNearbyCoordinates(YOUR_LOCATION.lat, YOUR_LOCATION.lng, 1.5, 90), // 1.5km east
    distance: '1.5km',
    type: 'nearby'
  },
  {
    city: 'University',
    country: YOUR_LOCATION.country,
    emoji: '🎓',
    coords: generateNearbyCoordinates(YOUR_LOCATION.lat, YOUR_LOCATION.lng, 2.8, 180), // 2.8km south
    distance: '2.8km',
    type: 'nearby'
  },
  {
    city: 'Sports Complex',
    country: YOUR_LOCATION.country,
    emoji: '⚽',
    coords: generateNearbyCoordinates(YOUR_LOCATION.lat, YOUR_LOCATION.lng, 4.2, 315), // 4.2km northwest
    distance: '4.2km',
    type: 'nearby'
  },
  
  // City-wide (5km - 20km)
  {
    city: 'City Center',
    country: YOUR_LOCATION.country,
    emoji: '🏛️',
    coords: generateNearbyCoordinates(YOUR_LOCATION.lat, YOUR_LOCATION.lng, 8.5, 0), // 8.5km north
    distance: '8.5km',
    type: 'city-wide'
  },
  {
    city: 'Beach Area',
    country: YOUR_LOCATION.country,
    emoji: '🏖️',
    coords: generateNearbyCoordinates(YOUR_LOCATION.lat, YOUR_LOCATION.lng, 12.3, 225), // 12.3km southwest
    distance: '12.3km',
    type: 'city-wide'
  },
  {
    city: 'Airport',
    country: YOUR_LOCATION.country,
    emoji: '✈️',
    coords: generateNearbyCoordinates(YOUR_LOCATION.lat, YOUR_LOCATION.lng, 18.7, 120), // 18.7km southeast
    distance: '18.7km',
    type: 'city-wide'
  },
  
  // Your exact location
  {
    city: YOUR_LOCATION.city,
    country: YOUR_LOCATION.country,
    emoji: YOUR_LOCATION.emoji,
    coords: [YOUR_LOCATION.lng, YOUR_LOCATION.lat],
    distance: '0m',
    type: 'current'
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whisperwall');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await WhisperPost.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of dummyUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.username}`);
    }

    // Get sohari user
    const sohariUser = createdUsers.find(u => u.username === 'sohari');
    
    // Create various types of posts
    console.log('\n📝 Creating posts...');
    const allPosts = [];
    
    // 1. Regular posts with images
    console.log('📸 Creating regular posts with images...');
    for (let i = 0; i < 5; i++) {
      const author = createdUsers[i % createdUsers.length];
      const category = author.preferences[0];
      const post = new Post({
        author: author._id,
        content: {
          text: postContents[category][i % postContents[category].length],
          media: [{
            url: sampleImages[i % sampleImages.length],
            type: 'image',
            filename: `image-${i}.jpg`,
            originalName: `photo-${i}.jpg`,
            size: 1024000,
          }],
        },
        category,
      });
      await post.save();
      allPosts.push(post);
      console.log(`✅ Created image post by ${author.username}`);
    }

    // 2. Posts with videos
    console.log('🎥 Creating posts with videos...');
    for (let i = 0; i < 2; i++) {
      const author = createdUsers[i % createdUsers.length];
      const category = author.preferences[0];
      const post = new Post({
        author: author._id,
        content: {
          text: 'Check out this amazing video! 🎬',
          media: [{
            url: sampleVideos[i % sampleVideos.length],
            type: 'video',
            filename: `video-${i}.mp4`,
            originalName: `video-${i}.mp4`,
            size: 5024000,
          }],
        },
        category,
      });
      await post.save();
      allPosts.push(post);
      console.log(`✅ Created video post by ${author.username}`);
    }

    // 3. Posts with voice notes
    console.log('🎤 Creating posts with voice notes...');
    for (let i = 0; i < 3; i++) {
      const author = createdUsers[i % createdUsers.length];
      const category = author.preferences[0];
      const effects = ['none', 'deep', 'soft', 'robot', 'girly'];
      const post = new Post({
        author: author._id,
        content: {
          text: 'Listen to my voice note! 🎙️',
          voiceNote: {
            url: sampleVoiceNote,
            effect: effects[i % effects.length],
            duration: 30 + (i * 10),
          },
        },
        category,
      });
      await post.save();
      allPosts.push(post);
      console.log(`✅ Created voice note post by ${author.username}`);
    }

    // 4. One-time posts
    console.log('👁️ Creating one-time posts...');
    for (let i = 0; i < 3; i++) {
      const author = createdUsers[i % createdUsers.length];
      const category = author.preferences[0];
      const post = new Post({
        author: author._id,
        content: {
          text: 'This is a one-time view post! View it before it disappears 👀',
          media: [{
            url: sampleImages[(i + 2) % sampleImages.length],
            type: 'image',
            filename: `onetime-${i}.jpg`,
            originalName: `onetime-${i}.jpg`,
            size: 1024000,
          }],
        },
        category,
        oneTime: {
          enabled: true,
          viewedBy: [],
        },
      });
      await post.save();
      allPosts.push(post);
      console.log(`✅ Created one-time post by ${author.username}`);
    }

    // 5. Timed/vanishing posts
    console.log('⏰ Creating timed posts...');
    const durations = ['1hour', '6hours', '12hours', '24hours'];
    for (let i = 0; i < 4; i++) {
      const author = createdUsers[i % createdUsers.length];
      const category = author.preferences[0];
      const post = new Post({
        author: author._id,
        content: {
          text: `This post will vanish in ${durations[i]}! ⏳`,
          media: [{
            url: sampleImages[(i + 3) % sampleImages.length],
            type: 'image',
            filename: `timed-${i}.jpg`,
            originalName: `timed-${i}.jpg`,
            size: 1024000,
          }],
        },
        category,
        vanishMode: {
          enabled: true,
          duration: durations[i],
        },
      });
      await post.save();
      allPosts.push(post);
      console.log(`✅ Created timed post (${durations[i]}) by ${author.username}`);
    }

    // 6. Poll posts
    console.log('📊 Creating poll posts...');
    for (let i = 0; i < pollQuestions.length; i++) {
      const author = createdUsers[i % createdUsers.length];
      const category = author.preferences[0];
      const pollData = pollQuestions[i];
      const post = new Post({
        author: author._id,
        content: {
          text: 'Vote on my poll! 🗳️',
        },
        category,
        poll: {
          enabled: true,
          type: 'multi',
          question: pollData.question,
          options: pollData.options.map(opt => ({
            text: opt.text,
            emoji: opt.emoji,
            votes: [],
            voteCount: 0,
          })),
          revealAfterVote: false,
          totalVotes: 0,
          isAnonymous: true,
        },
      });
      await post.save();
      allPosts.push(post);
      console.log(`✅ Created poll post by ${author.username}`);
    }

    // 7. Review posts (posts with ratings)
    console.log('⭐ Creating review posts...');
    for (let i = 0; i < 3; i++) {
      const author = createdUsers[i % createdUsers.length];
      const ratings = [5, 4, 3];
      const post = new Post({
        author: author._id,
        content: {
          text: `Just tried this new place! ${ratings[i]} stars ⭐`,
          media: [{
            url: sampleImages[(i + 4) % sampleImages.length],
            type: 'image',
            filename: `review-${i}.jpg`,
            originalName: `review-${i}.jpg`,
            size: 1024000,
          }],
        },
        category: 'Food',
        rating: ratings[i],
      });
      await post.save();
      allPosts.push(post);
      console.log(`✅ Created review post (${ratings[i]} stars) by ${author.username}`);
    }

    // 8. Location/City Radar posts
    console.log('📍 Creating location posts...');
    
    const locationPostTexts = {
      'ultra-local': [
        'Just grabbed the best coffee here! ☕',
        'Beautiful spot for a morning walk 🌅',
        'This place has amazing vibes! ✨',
      ],
      'nearby': [
        'Shopping spree! Found some great deals 🛍️',
        'Study session at the library 📚',
        'Game night at the sports complex! 🎮',
      ],
      'city-wide': [
        'Downtown is so lively today! 🌆',
        'Beach day with friends! 🏖️',
        'Traveling soon, airport vibes ✈️',
      ],
      'current': [
        'Right here, right now! 📍',
      ]
    };
    
    for (let i = 0; i < locationPosts.length; i++) {
      const author = createdUsers[i % createdUsers.length];
      const location = locationPosts[i];
      const postTexts = locationPostTexts[location.type] || ['Posting from here!'];
      const postText = postTexts[i % postTexts.length];
      
      const post = new Post({
        author: author._id,
        content: {
          text: `${postText} ${location.emoji} (${location.distance} away)`,
          media: [{
            url: sampleImages[i % sampleImages.length],
            type: 'image',
            filename: `location-${i}.jpg`,
            originalName: `location-${i}.jpg`,
            size: 1024000,
          }],
        },
        category: location.type === 'ultra-local' ? 'Food' : location.type === 'nearby' ? 'Travel' : 'Photography',
        location: {
          city: location.city,
          country: location.country,
          emoji: location.emoji,
        },
        geoLocation: {
          type: 'Point',
          coordinates: location.coords,
        },
        locationEnabled: true,
        locationName: `${location.city}, ${location.country}`,
      });
      await post.save();
      allPosts.push(post);
      console.log(`✅ Created ${location.type} post from ${location.city} (${location.distance}) by ${author.username}`);
    }

    // 9. Posts from sohari account
    console.log('👤 Creating posts from sohari account...');
    const sohariPostTypes = [
      { text: 'Testing image upload 📸', hasImage: true },
      { text: 'Testing video upload 🎥', hasVideo: true },
      { text: 'Testing voice note 🎤', hasVoice: true },
      { text: 'Testing poll feature 📊', hasPoll: true },
      { text: 'Testing one-time post 👁️', isOneTime: true },
    ];

    for (let i = 0; i < sohariPostTypes.length; i++) {
      const postType = sohariPostTypes[i];
      const postData = {
        author: sohariUser._id,
        content: {
          text: postType.text,
        },
        category: 'Technology',
      };

      if (postType.hasImage) {
        postData.content.media = [{
          url: sampleImages[0],
          type: 'image',
          filename: 'sohari-image.jpg',
          originalName: 'sohari-image.jpg',
          size: 1024000,
        }];
      }

      if (postType.hasVideo) {
        postData.content.media = [{
          url: sampleVideos[0],
          type: 'video',
          filename: 'sohari-video.mp4',
          originalName: 'sohari-video.mp4',
          size: 5024000,
        }];
      }

      if (postType.hasVoice) {
        postData.content.voiceNote = {
          url: sampleVoiceNote,
          effect: 'none',
          duration: 45,
        };
      }

      if (postType.hasPoll) {
        postData.poll = {
          enabled: true,
          type: 'multi',
          question: 'What feature should I test next?',
          options: [
            { text: 'Themes', emoji: '🎨', votes: [], voteCount: 0 },
            { text: 'Avatars', emoji: '👤', votes: [], voteCount: 0 },
            { text: 'Chat', emoji: '💬', votes: [], voteCount: 0 },
          ],
          revealAfterVote: false,
          totalVotes: 0,
          isAnonymous: true,
        };
      }

      if (postType.isOneTime) {
        postData.oneTime = {
          enabled: true,
          viewedBy: [],
        };
        postData.content.media = [{
          url: sampleImages[1],
          type: 'image',
          filename: 'sohari-onetime.jpg',
          originalName: 'sohari-onetime.jpg',
          size: 1024000,
        }];
      }

      const post = new Post(postData);
      await post.save();
      allPosts.push(post);
      console.log(`✅ Created sohari post: ${postType.text}`);
    }

    // 10. Add reactions and comments to posts
    console.log('\n❤️ Adding reactions and comments...');
    const reactionTypes = ['funny', 'rage', 'shock', 'relatable', 'love', 'thinking'];
    
    for (const post of allPosts) {
      // Add random reactions from different users
      const numReactions = Math.floor(Math.random() * 15) + 5; // 5-20 reactions
      for (let i = 0; i < numReactions; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const randomReaction = reactionTypes[Math.floor(Math.random() * reactionTypes.length)];
        await post.addReaction(randomUser._id, randomReaction);
      }

      // Add random comments
      const numComments = Math.floor(Math.random() * 5) + 1; // 1-5 comments
      const commentTexts = [
        'This is amazing! 🔥',
        'Love this content!',
        'Great post!',
        'Thanks for sharing!',
        'Interesting perspective',
        'Can\'t wait to try this',
        'So relatable!',
        'This made my day',
      ];

      for (let i = 0; i < numComments; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const randomComment = commentTexts[Math.floor(Math.random() * commentTexts.length)];
        post.comments.push({
          author: randomUser._id,
          content: randomComment,
          createdAt: new Date(),
          reactions: { funny: [], love: [] },
          reactionCounts: { funny: 0, love: 0, total: 0 },
          replies: [],
        });
      }

      await post.save();
      console.log(`✅ Added reactions and comments to post by ${post.author}`);
    }

    // 11. Create WhisperWall posts
    console.log('\n🤫 Creating WhisperWall posts...');
    const whisperCategories = ['Confession', 'Vent', 'Advice', 'Random', 'Love'];
    const whisperTexts = [
      'I secretly love pineapple on pizza 🍕',
      'Sometimes I pretend to be busy just to avoid people',
      'I still sleep with a stuffed animal',
      'I talk to my plants and they seem to like it',
      'I\'ve watched the same show 5 times and I\'m not sorry',
    ];

    for (let i = 0; i < 5; i++) {
      const author = createdUsers[i % createdUsers.length];
      const whisper = new WhisperPost({
        userId: author._id,
        content: {
          text: whisperTexts[i],
        },
        category: whisperCategories[i % whisperCategories.length],
        backgroundAnimation: ['rain', 'neon', 'fire', 'snow', 'hearts'][i % 5],
      });
      await whisper.save();
      console.log(`✅ Created whisper post by ${author.username}`);
    }

    // Update user stats
    console.log('\n📊 Updating user stats...');
    for (const user of createdUsers) {
      const userPosts = allPosts.filter(p => p.author.equals(user._id));
      user.stats.postsCount = userPosts.length;
      await user.save();
      console.log(`✅ Updated stats for ${user.username}: ${userPosts.length} posts`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   👥 Users created: ${createdUsers.length}`);
    console.log(`   📝 Posts created: ${allPosts.length}`);
    console.log(`   🤫 Whisper posts created: 5`);
    console.log(`\n📍 Location Posts Distribution:`);
    console.log(`   🏠 Ultra-local (0-500m): 3 posts`);
    console.log(`   🚶 Nearby (500m-5km): 3 posts`);
    console.log(`   🏙️ City-wide (5km-20km): 3 posts`);
    console.log(`   📌 Your location: 1 post`);
    console.log(`\n⚙️ To use your actual location:`);
    console.log(`   Edit seed-comprehensive-data.js`);
    console.log(`   Update YOUR_LOCATION with your coordinates`);
    console.log(`\n🔐 Login credentials:`);
    console.log(`   Email: sohari@example.com`);
    console.log(`   Password: password123`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
