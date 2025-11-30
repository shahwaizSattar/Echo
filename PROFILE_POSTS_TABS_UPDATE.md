# Profile Posts Tabs Update

## Overview
Updated the ProfileScreen to display posts in 3 separate tabs with full-width cards similar to the HomeScreen design.

## Changes Made

### 1. Added Tab Navigation
- **Home Posts Tab** 🏠: Shows regular posts without location
- **Radar Posts Tab** 📍: Shows posts with location enabled (City Radar posts)
- **Whispers Tab** 💭: Placeholder for WhisperWall posts (requires separate API integration)

### 2. Full-Width Card Design
Updated post cards to match HomeScreen styling:
- Removed horizontal padding from posts section
- Changed card border radius to 0 for edge-to-edge design
- Added subtle bottom border instead of shadows
- Cards now span the full width of the screen

### 3. Post Filtering Logic
Posts are automatically filtered based on the active tab:
- **Home**: `!post.locationEnabled` - Regular posts without location
- **Radar**: `post.locationEnabled && post.geoLocation` - Posts with location data
- **Whisper**: Currently returns empty (needs WhisperWall API integration)

### 4. Visual Enhancements
- Added location badge for Radar posts showing city and emoji
- Maintained existing badges (One-Time Post, Lock indicators)
- Tab icons for better visual identification
- Active tab highlighting with primary color

## UI Components

### Tab Bar
```tsx
<View style={styles.tabsContainer}>
  <TouchableOpacity style={[styles.tab, activeTab === 'home' && styles.activeTab]}>
    <Text style={styles.tabIcon}>🏠</Text>
    <Text style={styles.tabText}>Home Posts</Text>
  </TouchableOpacity>
  // ... other tabs
</View>
```

### Full-Width Cards
```tsx
postCard: {
  backgroundColor: theme.colors.surface,
  borderRadius: 0,
  padding: theme.spacing.lg,
  marginBottom: theme.spacing.sm,
  marginHorizontal: 0,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border + '60',
  width: '100%',
}
```

## Empty States
Each tab has a custom empty state message:
- **Home**: "No posts yet. Start sharing your thoughts!"
- **Radar**: "No radar posts yet. Enable location when creating a post!"
- **Whisper**: "No whispers yet. Visit WhisperWall to share anonymously!"

## Future Enhancements

### WhisperWall Integration
To fully implement the Whispers tab, you'll need to:
1. Add a WhisperWall API endpoint to fetch user's whispers
2. Update the filtering logic to fetch and display whisper posts
3. Consider privacy implications (whispers are anonymous)

Example implementation:
```typescript
// In api.ts
getUserWhispers: async (page: number = 1, limit: number = 20) => {
  const response = await api.get(`/whisperwall/user?page=${page}&limit=${limit}`);
  return response.data;
}

// In ProfileScreen
const loadWhisperPosts = async () => {
  const response = await whisperWallAPI.getUserWhispers(1, 20);
  // Handle whisper posts
}
```

## Testing Checklist
- [x] Tab switching works correctly
- [x] Posts filter by type (Home/Radar)
- [x] Full-width cards display properly
- [x] Location badges show on Radar posts
- [x] Empty states display for each tab
- [ ] WhisperWall posts integration (pending)

## Notes
- Increased post fetch limit from 20 to 50 to ensure enough posts for filtering
- Maintained all existing functionality (voice notes, media, reactions, etc.)
- Cards are now consistent with HomeScreen design
- Tab state persists during screen navigation
