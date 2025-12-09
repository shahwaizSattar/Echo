# 📍 City Radar Location-Based Seeding Guide

## Overview
The seeding script now creates location-based posts at various distances from your current location, perfect for testing the City Radar feature with realistic distance calculations.

## What Gets Created

### Location Post Distribution

#### 🏠 Ultra-Local (0-500m)
Posts within walking distance:
- ☕ Coffee Shop - 200m away
- 🌳 Local Park - 400m away
- 🍽️ Nearby Restaurant - 500m away

#### 🚶 Nearby (500m-5km)
Posts in your neighborhood:
- 🛍️ Shopping Mall - 1.5km away
- 🎓 University - 2.8km away
- ⚽ Sports Complex - 4.2km away

#### 🏙️ City-Wide (5km-20km)
Posts across the city:
- 🏛️ City Center - 8.5km away
- 🏖️ Beach Area - 12.3km away
- ✈️ Airport - 18.7km away

#### 📌 Your Location (0m)
- One post at your exact location

**Total: 10 location-based posts**

## How to Use Your Actual Location

### Step 1: Find Your Coordinates

#### Option A: Google Maps
1. Open Google Maps
2. Right-click on your location
3. Click on the coordinates (e.g., "24.8607, 67.0011")
4. Coordinates are copied!

#### Option B: GPS App
Use any GPS app on your phone to get:
- Latitude (e.g., 24.8607)
- Longitude (e.g., 67.0011)

#### Option C: Online Tool
Visit: https://www.latlong.net/
- Search your address
- Get coordinates

### Step 2: Update the Seeding Script

Open `backend/seed-comprehensive-data.js` and find this section:

```javascript
// Base location (you can change this to your actual location)
// Default: Karachi, Pakistan (change to your city)
const YOUR_LOCATION = {
  lat: 24.8607,  // Change to your latitude
  lng: 67.0011,  // Change to your longitude
  city: 'Karachi',
  country: 'Pakistan',
  emoji: '🏙️'
};
```

Replace with your coordinates:

```javascript
const YOUR_LOCATION = {
  lat: 40.7128,  // Your latitude
  lng: -74.0060, // Your longitude
  city: 'New York',
  country: 'USA',
  emoji: '🗽'
};
```

### Step 3: Run the Seeding Script

```bash
cd backend
node seed-comprehensive-data.js
```

## Example Locations

### Major Cities

#### New York, USA
```javascript
const YOUR_LOCATION = {
  lat: 40.7128,
  lng: -74.0060,
  city: 'New York',
  country: 'USA',
  emoji: '🗽'
};
```

#### London, UK
```javascript
const YOUR_LOCATION = {
  lat: 51.5074,
  lng: -0.1278,
  city: 'London',
  country: 'UK',
  emoji: '🏰'
};
```

#### Tokyo, Japan
```javascript
const YOUR_LOCATION = {
  lat: 35.6762,
  lng: 139.6503,
  city: 'Tokyo',
  country: 'Japan',
  emoji: '🗼'
};
```

#### Dubai, UAE
```javascript
const YOUR_LOCATION = {
  lat: 25.2048,
  lng: 55.2708,
  city: 'Dubai',
  country: 'UAE',
  emoji: '🏙️'
};
```

#### Sydney, Australia
```javascript
const YOUR_LOCATION = {
  lat: -33.8688,
  lng: 151.2093,
  city: 'Sydney',
  country: 'Australia',
  emoji: '🦘'
};
```

#### Mumbai, India
```javascript
const YOUR_LOCATION = {
  lat: 19.0760,
  lng: 72.8777,
  city: 'Mumbai',
  country: 'India',
  emoji: '🇮🇳'
};
```

## How It Works

### Distance Calculation
The script uses the Haversine formula to generate coordinates at specific distances and bearings from your base location:

```javascript
function generateNearbyCoordinates(baseLat, baseLng, distanceKm, bearing)
```

- **baseLat/baseLng**: Your starting coordinates
- **distanceKm**: How far away (0.2km = 200m, 1.5km, etc.)
- **bearing**: Direction in degrees (0=North, 90=East, 180=South, 270=West)

### Post Distribution
Posts are created in different directions:
- Northeast (45°)
- East (90°)
- Southeast (135°)
- South (180°)
- Southwest (225°)
- West (270°)
- Northwest (315°)
- North (0°)

This ensures posts are spread around you in all directions!

## Testing City Radar

### Step 1: Seed with Your Location
```bash
cd backend
node seed-comprehensive-data.js
```

### Step 2: Start the App
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm start
```

### Step 3: Enable Location
1. Login as sohari
2. Go to City Radar screen
3. Allow location permissions
4. See posts sorted by distance!

### Step 4: Test Filters
- **Ultra-Local**: See posts within 500m
- **Nearby**: See posts within 5km
- **City-Wide**: See all posts within 20km

### What You'll See

```
📍 Coffee Shop ☕
   200m away • 2 mins ago
   "Just grabbed the best coffee here! ☕ (200m away)"

📍 Shopping Mall 🛍️
   1.5km away • 5 mins ago
   "Shopping spree! Found some great deals 🛍️ (1.5km away)"

📍 City Center 🏛️
   8.5km away • 10 mins ago
   "Downtown is so lively today! 🌆 (8.5km away)"
```

## Customizing Distances

Want different distances? Edit the `locationPosts` array:

```javascript
// Ultra-local: Change 0.2 to any distance in km
coords: generateNearbyCoordinates(YOUR_LOCATION.lat, YOUR_LOCATION.lng, 0.2, 45),

// Nearby: Change 1.5 to any distance in km
coords: generateNearbyCoordinates(YOUR_LOCATION.lat, YOUR_LOCATION.lng, 1.5, 90),

// City-wide: Change 8.5 to any distance in km
coords: generateNearbyCoordinates(YOUR_LOCATION.lat, YOUR_LOCATION.lng, 8.5, 0),
```

## Adding More Locations

Want more posts? Add to the `locationPosts` array:

```javascript
{
  city: 'Gym',
  country: YOUR_LOCATION.country,
  emoji: '💪',
  coords: generateNearbyCoordinates(YOUR_LOCATION.lat, YOUR_LOCATION.lng, 0.8, 180),
  distance: '800m',
  type: 'ultra-local'
},
```

## Troubleshooting

### Posts Not Showing in City Radar
**Problem**: No posts appear in City Radar
**Solution**:
1. Check if location permissions are enabled
2. Verify posts have `locationEnabled: true`
3. Check if coordinates are valid
4. Ensure geospatial index exists:
   ```bash
   cd backend
   node scripts/createGeoIndex.js
   ```

### Wrong Distances
**Problem**: Distances don't match expected values
**Solution**:
1. Verify YOUR_LOCATION coordinates are correct
2. Check if coordinates are in [longitude, latitude] format
3. Ensure distance calculation uses correct units (km)

### Posts Too Far Away
**Problem**: All posts show as city-wide
**Solution**:
1. Reduce distance values in `generateNearbyCoordinates`
2. Use smaller numbers (0.1 = 100m, 0.5 = 500m, 1.0 = 1km)

### No Location Posts
**Problem**: Location posts not created
**Solution**:
1. Check if seeding completed successfully
2. Verify MongoDB connection
3. Check console for errors during seeding

## Distance Reference

| Distance | Kilometers | Meters | Walking Time |
|----------|-----------|--------|--------------|
| Ultra-local | 0.1 - 0.5 km | 100 - 500m | 1-6 mins |
| Nearby | 0.5 - 5 km | 500m - 5km | 6-60 mins |
| City-wide | 5 - 20 km | 5 - 20km | 1-4 hours |

## Advanced: Custom Locations

Create posts at specific landmarks:

```javascript
const locationPosts = [
  // Your favorite coffee shop
  {
    city: 'Starbucks Downtown',
    country: 'USA',
    emoji: '☕',
    coords: [YOUR_ACTUAL_LONGITUDE, YOUR_ACTUAL_LATITUDE],
    distance: 'Calculate manually',
    type: 'ultra-local'
  },
  // Add more...
];
```

## Tips

1. **Use Real Coordinates**: For best testing, use your actual location
2. **Test Different Distances**: Try ultra-local, nearby, and city-wide filters
3. **Check Permissions**: Ensure location permissions are enabled in the app
4. **Verify Index**: Run `createGeoIndex.js` if distance queries are slow
5. **Update Regularly**: Re-seed with new locations as you move around

## Summary

✅ **10 location posts** created at various distances
✅ **3 distance categories**: Ultra-local, Nearby, City-wide
✅ **Realistic distances**: 200m to 18.7km
✅ **All directions**: Posts spread in 8 directions around you
✅ **Easy customization**: Just update YOUR_LOCATION
✅ **Distance shown**: Each post shows how far away it is

---

## Quick Start

1. **Find your coordinates** (Google Maps)
2. **Update YOUR_LOCATION** in `seed-comprehensive-data.js`
3. **Run seeding**: `cd backend && node seed-comprehensive-data.js`
4. **Start app**: Backend + Frontend
5. **Test City Radar**: See posts sorted by distance!

Enjoy testing location-based features! 📍🚀
