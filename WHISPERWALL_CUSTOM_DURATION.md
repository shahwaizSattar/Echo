# WhisperWall Custom Duration Feature

## ✅ Added Custom Duration Option

### What's New
Added a "custom" option to the timed post duration selector, allowing users to set any duration from 1 minute to 1 week (10,080 minutes).

## 🎯 Features

### Duration Options
1. **1hour** - 60 minutes
2. **6hours** - 360 minutes
3. **12hours** - 720 minutes
4. **24hours** - 1,440 minutes
5. **1day** - 1,440 minutes (same as 24hours)
6. **1week** - 10,080 minutes
7. **custom** - 1 to 10,080 minutes (user-defined)

### Custom Duration UI
- **Slider**: Smooth slider from 1 to 10,080 minutes
- **Display**: Shows both minutes and converted hours/minutes
  - Example: "Custom: 90 minutes (1h 30m)"
- **Real-time Update**: Display updates as you slide
- **Visual Feedback**: Highlighted when selected

## 📁 Files Modified

### Frontend
1. **frontend/src/screens/main/WhisperWallScreen.tsx**
   - Added `customVanishMinutes` state (default: 60)
   - Updated `vanishDuration` type to include 'custom'
   - Added Slider import from `@react-native-community/slider`
   - Added custom duration UI with slider
   - Added styles for custom duration container
   - Updated API call to include `customMinutes`
   - Reset custom minutes on modal close

2. **frontend/src/services/api.ts**
   - Updated `createWhisper` type to include 'custom' duration
   - Added `customMinutes?: number` to vanishMode type

### Backend
- No changes needed - backend already supports `customMinutes` field

## 🎨 UI Implementation

### Duration Selector
```tsx
{['1hour', '6hours', '12hours', '24hours', '1day', '1week', 'custom'].map(duration => (
  <TouchableOpacity
    style={[
      styles.durationButton,
      vanishDuration === duration && styles.durationButtonActive,
    ]}
    onPress={() => setVanishDuration(duration)}
  >
    <Text>{duration}</Text>
  </TouchableOpacity>
))}
```

### Custom Duration Input
```tsx
{vanishDuration === 'custom' && (
  <View style={styles.customDurationContainer}>
    <Text style={styles.customDurationLabel}>
      Custom: {customVanishMinutes} minutes ({Math.floor(customVanishMinutes / 60)}h {customVanishMinutes % 60}m)
    </Text>
    <Slider
      minimumValue={1}
      maximumValue={10080}
      step={1}
      value={customVanishMinutes}
      onValueChange={setCustomVanishMinutes}
    />
  </View>
)}
```

## 🧪 Testing

### Test Custom Duration
1. Open WhisperWall
2. Click create button (+)
3. Enable "Timed Post (Self-Destruct)"
4. Select "custom" from duration options
5. Slider appears below
6. Drag slider to set custom duration
7. Watch the label update: "Custom: X minutes (Xh Xm)"
8. Post the whisper
9. Verify timer shows correct countdown

### Test Cases
- **Minimum**: 1 minute (0h 1m)
- **Short**: 30 minutes (0h 30m)
- **Medium**: 90 minutes (1h 30m)
- **Long**: 500 minutes (8h 20m)
- **Maximum**: 10,080 minutes (168h 0m = 1 week)

## 📊 Duration Ranges

| Range | Minutes | Display Example |
|-------|---------|-----------------|
| 1-59 | 1-59 | "30 minutes (0h 30m)" |
| 1-24 hours | 60-1,440 | "90 minutes (1h 30m)" |
| 1-7 days | 1,440-10,080 | "2880 minutes (48h 0m)" |
| Maximum | 10,080 | "10080 minutes (168h 0m)" |

## 🎯 User Experience

### Benefits
1. **Flexibility**: Set exact duration needed
2. **Precision**: Not limited to preset options
3. **Visual Feedback**: See duration in both minutes and hours
4. **Easy Adjustment**: Smooth slider interaction
5. **Clear Display**: Shows both formats simultaneously

### Display Format
- **Minutes**: Raw minute value
- **Hours/Minutes**: Converted format for easier understanding
- Example: "Custom: 125 minutes (2h 5m)"

## 🔧 Technical Details

### State Management
```typescript
const [vanishDuration, setVanishDuration] = useState<
  '1hour' | '6hours' | '12hours' | '24hours' | '1day' | '1week' | 'custom'
>('1day');
const [customVanishMinutes, setCustomVanishMinutes] = useState(60);
```

### API Payload
```typescript
vanishMode: {
  enabled: true,
  duration: 'custom',
  customMinutes: 125  // User-selected value
}
```

### Backend Processing
Backend already handles `customMinutes` field:
```javascript
if (this.vanishMode.duration === 'custom') {
  duration = (this.vanishMode.customMinutes || 60) * 60 * 1000;
}
```

## 🎨 Styling

### Custom Duration Container
```typescript
customDurationContainer: {
  marginTop: 12,
  padding: 12,
  backgroundColor: theme.colors.background,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: theme.colors.border,
}
```

### Slider
```typescript
slider: {
  width: '100%',
  height: 40,
}
```

## ✨ Future Enhancements

- Quick presets within custom (15m, 30m, 45m buttons)
- Time picker UI instead of slider
- Favorite custom durations
- Recent custom durations
- Duration templates (e.g., "Coffee break", "Lunch time")
- Visual timeline showing when post will vanish

## 📝 Notes

- Default custom value: 60 minutes (1 hour)
- Minimum: 1 minute
- Maximum: 10,080 minutes (1 week)
- Step: 1 minute increments
- Slider uses theme colors for consistency
- Label updates in real-time as slider moves
