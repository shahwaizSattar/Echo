# City Radar Location & Media Upload Update

## Overview
Enhanced the City Radar posting modal with location selection and media upload capabilities.

## New Features

### 1. Location Selection
Users can now choose between:
- **Current Location** (📍) - Uses GPS coordinates
- **Custom Location** (🗺️) - Allows entering a custom location name

### 2. Media Upload
Users can attach media to their posts:
- **Image Upload** (🖼️) - Select images from gallery
- **Video Upload** (🎥) - Select videos from gallery
- Media preview with remove option
- Only one media item per post

### 3. Post Types
Available post types (removed Ask Area, Secret Tip, Whisper):
- **Text** (📝) - Default selection, simple text posts
- **Review** (⭐) - With 5-star rating system
- **Poll** (📊) - With up to 4 options

## Technical Implementation

### New State Variables
```typescript
const [useCurrentLocation, setUseCurrentLocation] = useState(true);
const [customLocation, setCustomLocation] = useState<{ latitude: number; longitude: number } | null>(null);
const [customLocationName, setCustomLocationName] = useState('');
const [mediaUri, setMediaUri] = useState<string | null>(null);
const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
```

### New Functions
- `pickImage()` - Opens image picker
- `pickVideo()` - Opens video picker
- `removeMedia()` - Removes selected media
- `selectCustomLocation()` - Prompts for custom location

### Updated Submit Data
```typescript
{
  type: postType,
  content,
  duration,
  radius,
  category,
  rating,
  pollOptions,
  location: finalLocation,
  locationName: customLocationName,
  mediaUri,
  mediaType
}
```

## UI Components

### Location Toggle
Two-button toggle for switching between current and custom location with visual feedback.

### Media Section
- Dashed border buttons for adding image/video
- Preview with remove button overlay
- Supports both Image and Video components

## Dependencies Used
- `expo-image-picker` - For media selection
- `expo-location` - For location services
- `expo-av` - For video playback
- All packages already installed ✅

## User Flow

1. Open post modal
2. Choose location type (current or custom)
3. Select post type (text/review/poll)
4. Enter content
5. Optionally add image or video
6. Set duration, category, and radius
7. Submit post

## Next Steps

To fully implement custom location:
1. Add geocoding service to convert address to coordinates
2. Add map picker for visual location selection
3. Store location names in backend
4. Display location names on posts
