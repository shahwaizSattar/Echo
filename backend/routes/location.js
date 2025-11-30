const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');

// Get nearby posts based on user location
router.get('/nearby', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, radius = 50, page = 1, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInKm = parseFloat(radius);

    // Convert radius from km to meters for MongoDB
    const radiusInMeters = radiusInKm * 1000;

    // Find posts within the specified radius
    const posts = await Post.find({
      locationEnabled: true,
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radiusInMeters,
        },
      },
    })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Calculate distance for each post
    const postsWithDistance = posts.map((post) => {
      const distance = calculateDistance(
        lat,
        lng,
        post.geoLocation.coordinates[1],
        post.geoLocation.coordinates[0]
      );

      const postObj = post.toObject();
      console.log('📍 Post locationName:', postObj.locationName);
      console.log('📍 Post rating:', postObj.rating);

      return {
        ...postObj,
        distance: parseFloat(distance.toFixed(1)),
      };
    });

    console.log('📤 Returning', postsWithDistance.length, 'posts');
    if (postsWithDistance.length > 0) {
      console.log('📤 First post has locationName:', postsWithDistance[0].locationName);
      console.log('📤 First post has rating:', postsWithDistance[0].rating);
    }

    res.json({
      success: true,
      data: postsWithDistance,
      page: parseInt(page),
      totalPages: Math.ceil(posts.length / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching nearby posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby posts',
      error: error.message,
    });
  }
});

// Get posts by distance ring
router.get('/ring', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, ring = 'inner', page = 1, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Define ring ranges (in km)
    const ringRanges = {
      inner: { min: 0, max: 2 },
      mid: { min: 2, max: 10 },
      outer: { min: 10, max: 50 },
    };

    const range = ringRanges[ring] || ringRanges.inner;
    const minDistance = range.min * 1000; // Convert to meters
    const maxDistance = range.max * 1000;

    // Find posts within the ring range
    const posts = await Post.find({
      locationEnabled: true,
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $minDistance: minDistance,
          $maxDistance: maxDistance,
        },
      },
    })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Calculate distance for each post
    const postsWithDistance = posts.map((post) => {
      const distance = calculateDistance(
        lat,
        lng,
        post.geoLocation.coordinates[1],
        post.geoLocation.coordinates[0]
      );

      return {
        ...post.toObject(),
        distance: parseFloat(distance.toFixed(1)),
      };
    });

    res.json({
      success: true,
      data: postsWithDistance,
      ring,
      page: parseInt(page),
      totalPages: Math.ceil(posts.length / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching ring posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ring posts',
      error: error.message,
    });
  }
});

// Get area statistics
router.get('/area-stats', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInMeters = parseFloat(radius) * 1000;

    // Get post count in area
    const postCount = await Post.countDocuments({
      locationEnabled: true,
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radiusInMeters,
        },
      },
    });

    // Get trending categories in area
    const trendingCategories = await Post.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          distanceField: 'distance',
          maxDistance: radiusInMeters,
          spherical: true,
          key: 'geoLocation',
        },
      },
      {
        $match: {
          locationEnabled: true,
          category: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Get recent activity (posts in last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await Post.countDocuments({
      locationEnabled: true,
      createdAt: { $gte: oneDayAgo },
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radiusInMeters,
        },
      },
    });

    res.json({
      success: true,
      data: {
        totalPosts: postCount,
        recentActivity,
        trendingCategories: trendingCategories.map((cat) => ({
          category: cat._id,
          count: cat.count,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching area stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch area statistics',
      error: error.message,
    });
  }
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = router;
