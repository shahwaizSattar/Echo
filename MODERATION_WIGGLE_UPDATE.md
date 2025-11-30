# Content Moderation - Particle Animation Update

## Changes Made

Updated the content moderation animation to use an optimized particle effect:

### Before
- Content was covered with a blur overlay
- Eye icon appeared on top of content
- Content was hidden behind particles and blur effects
- Text was censored with asterisks

### After
- **No overlay** - no covering layers
- **Text becomes particles** - each character turns into small dots (•)
- **Wiggle animation** - particles gently float and wiggle around
- **Tap to reveal** - particles disappear and original text appears
- **No censoring** - original text shown without asterisks
- **Theme-aware** - particles adapt to light/dark themes
- **Performance optimized** - reduced particle count and animation complexity

## Animation Behavior

### Moderated State (Before Tap)
```
Original: "Hey, dumbass"
Displayed: • • • • • • • • • • • •
           ↕️ ↔️ (particles wiggling independently)
```

- Each character becomes 4-5 small particles (bullet points •)
- Each particle wiggles independently with random offsets
- Particles float in different directions at different speeds
- Spaces are preserved with invisible spacing
- Hint text appears below: "👁️ Tap to reveal" or "⚠️ Tap to reveal sensitive content"

### Revealed State (After Tap)
```
Displayed: "Hey, dumbass"
           (original text, no particles, no asterisks)
```

- Particles smoothly return to position
- Original unmodified text appears clearly
- Hint text disappears

## Severity Levels

### BLUR
- **Light themes**: Dark gray particles `#333`
- **Dark themes**: Light gray particles `#CCC`
- Gray hint text: "👁️ Tap to reveal"
- Gentle particle wiggle
- For mildly sensitive content

### WARNING
- Red particles: `#FF6B6B` (all themes)
- Red hint text: "⚠️ Tap to reveal sensitive content"
- Same particle wiggle
- For more sensitive content

### BLOCK
- Content completely blocked (no particles)
- Shows error message instead
- Cannot be revealed

## Performance Optimizations

**Reduced Lag**:
- Particle count reduced from 6-8 to 4-5 per character
- Animation duration increased (slower = smoother)
- React.memo used to prevent unnecessary re-renders
- Removed unused opacity animations
- Simplified animation sequences

**Before optimization**: ~6-8 particles × text length = heavy lag
**After optimization**: ~4-5 particles × text length = smooth performance

## Technical Details

**Component**: `frontend/src/components/moderation/BlurredContent.tsx`

**Key Features**:
- Uses `react-native-reanimated` for smooth particle animations
- Converts each character to 4-5 animated particles (bullet points)
- Each particle has independent random wiggle motion
- Theme-aware particle colors (adapts to light/dark themes)
- Preserves text length and spacing
- No blur effects or overlays
- No text censoring with asterisks
- Optimized for performance

**Animation Timing**:
- Particle wiggle: 900-1300ms per cycle (varies per particle)
- Random delays: 0-300ms for staggered effect
- Reveal transition: 300ms
- Particle offsets: ±6px horizontal and vertical

## Usage

The component is automatically used by `ModeratedContent`:

```tsx
<ModeratedContent moderation={moderationData}>
  <Text>Your content here</Text>
</ModeratedContent>
```

No changes needed to existing code - the new animation applies automatically!
