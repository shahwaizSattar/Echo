# 🎭 Avatar Customization - Quick Start Guide

## Overview
Premium avatar customization system with Apple + Pinterest aesthetics. Users create mysterious masked characters representing their anonymous identity.

## Features Implemented

### ✅ Backend
- **User Model**: Extended with `customAvatar` field supporting:
  - Mask styles (cloth, medical, matte, festival, gradient)
  - Hair styles (8 options with custom colors)
  - Outfit types (7 elegant options)
  - Theme presets (8 atmospheric themes)
  - Accessories (earrings, glasses, necklace, hat, scarf)

- **API Endpoints**:
  - `PUT /api/user/avatar` - Update custom avatar
  - `GET /api/user/avatar/presets` - Get customization options
  - `PUT /api/user/profile` - Updated to support customAvatar

### ✅ Frontend

#### Components
1. **AvatarRenderer** (`frontend/src/components/avatar/AvatarRenderer.tsx`)
   - SVG-based avatar rendering
   - Supports all customization options
   - Gradient backgrounds based on theme
   - Scalable size prop

2. **AvatarCustomizerScreen** (`frontend/src/screens/main/AvatarCustomizerScreen.tsx`)
   - Full customization interface
   - Category-based navigation (Mask, Hair, Outfit, Theme, Accessories)
   - Real-time preview
   - Color pickers for each element
   - Save functionality

#### Configuration
- **avatarConfig.ts** (`frontend/src/utils/avatarConfig.ts`)
  - Complete type definitions
  - Color palettes (neutrals, pastels, muted, darks, accents)
  - Style configurations for all elements
  - 8 premium theme presets with gradients

#### Integration
- **ProfileScreen**: Updated to show custom avatar with edit button
- **AuthContext**: Extended User interface to include customAvatar
- **API Service**: Added avatar update functions

## Usage

### For Users
1. Navigate to Profile screen
2. Tap on avatar (shows edit icon)
3. Customize:
   - **Mask**: Choose style and color
   - **Hair**: Select hairstyle and color
   - **Outfit**: Pick clothing type and color
   - **Theme**: Apply atmospheric preset
   - **Extras**: Add accessories (coming soon)
4. Preview updates in real-time
5. Tap "Save" to apply changes

### For Developers

#### Display Avatar
```tsx
import AvatarRenderer from '../components/avatar/AvatarRenderer';
import { DEFAULT_AVATAR_CONFIG } from '../utils/avatarConfig';

// In your component
<AvatarRenderer 
  config={user?.customAvatar || DEFAULT_AVATAR_CONFIG} 
  size={100}
/>
```

#### Update Avatar
```tsx
import { authAPI } from '../services/api';

const updateAvatar = async (config) => {
  await authAPI.updateAvatar(config);
};
```

## Theme Presets

### 1. Nebula Drift 🌌
Cosmic gradient mist with purple tones

### 2. Urban Dawn 🌆
Soft beige + city blur aesthetic

### 3. Midnight Frost 🌙
Dark cool highlights, mysterious

### 4. Pastel Air ☁️
Light soft baby blue & pink shades

### 5. Noir Shadow 🎬
High contrast, dramatic black

### 6. Velvet Dusk 🌆
Deep purples and soft golds

### 7. Misty Garden 🌿
Sage greens and morning fog

### 8. Arctic Whisper ❄️
Cool whites and icy blues

## Color Philosophy

### Neutrals
Perfect for masks and outfits
- `#F5F5F0` - Soft white
- `#E8E6E1` - Warm beige
- `#D4D2CD` - Muted gray
- `#8B8985` - Charcoal

### Pastels
Ideal for hair and accents
- `#E8D5E8` - Lavender
- `#D5E8E8` - Mint
- `#E8E8D5` - Cream
- `#E8D5D5` - Blush

### Muted Tones
Sophisticated hair colors
- `#C4B5A0` - Sandy
- `#A0B5C4` - Steel blue
- `#B5A0C4` - Dusty purple

## Navigation Setup

Add to your navigation stack:

```tsx
<Stack.Screen 
  name="AvatarCustomizer" 
  component={AvatarCustomizerScreen}
  options={{ headerShown: false }}
/>
```

## API Integration

### Update User Avatar
```javascript
// Backend route
PUT /api/user/avatar
Body: {
  customAvatar: {
    mask: { style: 'cloth', color: '#E8E6E1', pattern: 'solid' },
    hair: { style: 'straight', color: '#8B8985' },
    outfit: { type: 'hoodie', color: '#D4D2CD' },
    theme: { name: 'urban-dawn', lighting: 'soft', background: '#F5F5F0' },
    accessories: [],
    enabled: true
  }
}
```

### Get Presets
```javascript
GET /api/user/avatar/presets
Response: {
  masks: [...],
  hair: [...],
  outfits: [...],
  themes: [...],
  colors: {...}
}
```

## Future Enhancements

### Premium Features
- [ ] Custom mask designs
- [ ] Animated backgrounds
- [ ] Seasonal themes
- [ ] Exclusive patterns
- [ ] AR try-on
- [ ] Avatar NFT export
- [ ] Accessory marketplace

### Technical Improvements
- [ ] Server-side avatar rendering
- [ ] Avatar caching
- [ ] Preset templates
- [ ] Social sharing
- [ ] Avatar history/versions

## Testing

1. **Create Avatar**: Navigate to profile → tap avatar → customize
2. **Save Avatar**: Make changes → tap Save → verify update
3. **Display Avatar**: Check profile, posts, comments show custom avatar
4. **Theme Changes**: Switch themes → verify gradient backgrounds
5. **Color Selection**: Test all color palettes for each element

## Troubleshooting

### Avatar Not Showing
- Check `customAvatar.enabled` is `true`
- Verify user object includes customAvatar field
- Ensure AvatarRenderer is imported correctly

### Colors Not Applying
- Confirm color format is hex (#RRGGBB)
- Check color is in valid palette
- Verify theme gradient parsing

### Save Failing
- Check API endpoint is accessible
- Verify auth token is valid
- Ensure customAvatar structure matches schema

## Design Principles

1. **Premium Feel**: Muted colors, elegant spacing, smooth animations
2. **Mysterious Identity**: Masks symbolize anonymity
3. **Personalization**: Deep customization without overwhelming
4. **Consistency**: Avatars work across all app contexts
5. **Performance**: SVG rendering for scalability

---

**Status**: ✅ Ready for Testing
**Version**: 1.0.0
**Last Updated**: 2025-11-29
