# 📍 Quick Start - Location-Based Seeding

## TL;DR
The seeding script creates 10 posts at different distances from YOUR location to test City Radar.

## Default Location
**Karachi, Pakistan** (24.8607, 67.0011)

## Change to Your Location

### 1. Find Your Coordinates
- Google Maps → Right-click → Copy coordinates
- Or use: https://www.latlong.net/

### 2. Edit the Script
Open `backend/seed-comprehensive-data.js`:

```javascript
const YOUR_LOCATION = {
  lat: 24.8607,  // ← Your latitude
  lng: 67.0011,  // ← Your longitude
  city: 'Karachi',
  country: 'Pakistan',
  emoji: '🏙️'
};
```

### 3. Run Seeding
```bash
cd backend
node seed-comprehensive-data.js
```

## What You Get

### 10 Posts at Different Distances

```
📍 Coffee Shop ☕ - 200m away
📍 Local Park 🌳 - 400m away
📍 Restaurant 🍽️ - 500m away
📍 Shopping Mall 🛍️ - 1.5km away
📍 University 🎓 - 2.8km away
📍 Sports Complex ⚽ - 4.2km away
📍 City Center 🏛️ - 8.5km away
📍 Beach Area 🏖️ - 12.3km away
📍 Airport ✈️ - 18.7km away
📍 Your Location 📌 - 0m away
```

## Test City Radar

1. Login as sohari
2. Go to City Radar
3. Allow location permissions
4. See posts sorted by distance!

## Distance Categories

- 🏠 **Ultra-Local**: 0-500m (walking distance)
- 🚶 **Nearby**: 500m-5km (neighborhood)
- 🏙️ **City-Wide**: 5km-20km (across city)

## Popular Cities

### New York
```javascript
lat: 40.7128, lng: -74.0060
```

### London
```javascript
lat: 51.5074, lng: -0.1278
```

### Tokyo
```javascript
lat: 35.6762, lng: 139.6503
```

### Dubai
```javascript
lat: 25.2048, lng: 55.2708
```

## Full Guide
See `CITY_RADAR_SEEDING_GUIDE.md` for complete details.

---

**That's it!** Update YOUR_LOCATION and run the seeding script. 🚀
