# 🎨 Themes Quick Reference Card

## Available Themes

### Premium Collection ✨
| Theme ID | Name | Icon | Vibe | Colors |
|----------|------|------|------|--------|
| `nebula-drift` | Nebula Drift | 🌌 | Cosmic | Purple/Blue |
| `midnight-veil` | Midnight Veil | 🖤 | Luxury Dark | Black/Silver |
| `frost-glass` | FrostGlass | ❄️ | Elegant Light | Ice Blue/White |
| `aurora-wave` | Aurora Wave | 🌊 | Nature | Green/Purple/Blue |
| `sunset-ember` | Sunset Ember | 🌅 | Warm | Orange/Red |
| `cyber-pulse` | CyberPulse | ⚡ | Cyberpunk | Pink/Violet |
| `whisper-silk` | Whisper Silk | 🎀 | Luxury | Beige/Rose |
| `forest-lush` | Forest Lush | 🌿 | Nature | Green/Brown |
| `electric-storm` | Electric Storm | ⚡ | Dramatic | Yellow/Purple |
| `retro-synthwave` | Retro Synthwave | 🕹️ | 80s Retro | Pink/Purple/Orange |

### Classic Collection 🎯
| Theme ID | Name | Icon | Vibe | Colors |
|----------|------|------|------|--------|
| `light` | Effortless Clarity | 🌤️ | Clean | White/Indigo |
| `dark` | Midnight Balance | 🌙 | Comfortable | Charcoal/Indigo |
| `amoled` | True Black Silence | 🖤 | OLED | Black/Cyan |
| `neon-whisper` | Futuristic Cyberglow | 💎 | Neon | Dark/Cyan |
| `mood-shift` | Emotion-Adaptive | 🎭 | Dynamic | Adaptive |

---

## Quick Usage

### Switch Theme
```typescript
import { useTheme } from '../../context/ThemeContext';

const { setTheme } = useTheme();
setTheme('nebula-drift');
```

### Get Current Theme
```typescript
const { theme, themeName } = useTheme();
console.log(themeName); // 'nebula-drift'
```

### Use Theme Colors
```typescript
const { theme } = useTheme();

<View style={{ backgroundColor: theme.colors.background }}>
  <Text style={{ color: theme.colors.text }}>Hello</Text>
</View>
```

---

## Color Properties

Every theme includes:
```typescript
theme.colors.primary          // Main brand color
theme.colors.primaryDark      // Darker variant
theme.colors.secondary        // Secondary accent
theme.colors.accent           // Highlight color
theme.colors.background       // Screen background
theme.colors.surface          // Card background
theme.colors.card             // Card container
theme.colors.text             // Primary text
theme.colors.textSecondary    // Secondary text
theme.colors.textInverse      // Inverse text
theme.colors.border           // Border color
theme.colors.error            // Error state
theme.colors.success          // Success state
theme.colors.warning          // Warning state
theme.colors.info             // Info state
theme.colors.shadow           // Shadow color
theme.colors.overlay          // Modal overlay
theme.colors.happy            // Emotion: happy
theme.colors.vent             // Emotion: vent
theme.colors.chill            // Emotion: chill
theme.colors.excited          // Emotion: excited
theme.colors.thoughtful       // Emotion: thoughtful
```

---

## Spacing & Layout

```typescript
theme.spacing.xs    // 4
theme.spacing.sm    // 8
theme.spacing.md    // 16
theme.spacing.lg    // 24
theme.spacing.xl    // 32
theme.spacing.xxl   // 48
```

---

## Border Radius

```typescript
theme.borderRadius.sm     // 4
theme.borderRadius.md     // 8
theme.borderRadius.lg     // 12
theme.borderRadius.xl     // 16
theme.borderRadius.round  // 50
```

---

## Typography

```typescript
theme.typography.h1       // { fontSize: 32, fontWeight: 'bold', lineHeight: 40 }
theme.typography.h2       // { fontSize: 28, fontWeight: 'bold', lineHeight: 36 }
theme.typography.h3       // { fontSize: 24, fontWeight: '600', lineHeight: 32 }
theme.typography.h4       // { fontSize: 20, fontWeight: '600', lineHeight: 28 }
theme.typography.body1    // { fontSize: 16, fontWeight: 'normal', lineHeight: 24 }
theme.typography.body2    // { fontSize: 14, fontWeight: 'normal', lineHeight: 20 }
theme.typography.caption  // { fontSize: 12, fontWeight: 'normal', lineHeight: 16 }
theme.typography.button   // { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 }
```

---

## Shadows

```typescript
theme.shadows.small   // Subtle shadow
theme.shadows.medium  // Standard shadow
theme.shadows.large   // Prominent shadow
```

---

## Theme Recommendations

### By Use Case
- **Battery Saving:** `midnight-veil`, `amoled`
- **Daytime:** `frost-glass`, `light`, `whisper-silk`
- **Night:** `nebula-drift`, `sunset-ember`, `aurora-wave`
- **Professional:** `midnight-veil`, `dark`
- **Creative:** `cyber-pulse`, `retro-synthwave`, `electric-storm`
- **Calm:** `forest-lush`, `aurora-wave`, `frost-glass`

### By Personality
- **Minimalist:** `midnight-veil`, `frost-glass`
- **Bold:** `electric-storm`, `cyber-pulse`
- **Elegant:** `whisper-silk`, `nebula-drift`
- **Nature Lover:** `forest-lush`, `aurora-wave`
- **Tech Enthusiast:** `cyber-pulse`, `neon-whisper`
- **Nostalgic:** `retro-synthwave`

---

## Adding New Themes

1. Add theme ID to `ThemeType` in `ThemeContext.tsx`
2. Define theme object in `themes` record
3. Add theme card to `SettingsScreen.tsx`
4. Test on all screens
5. Update documentation

---

## Testing Checklist

- [ ] Theme switches instantly
- [ ] Colors are readable
- [ ] No console errors
- [ ] Persists after restart
- [ ] Works on all screens
- [ ] Preview matches actual theme

---

## Support

For issues or questions:
1. Check `PREMIUM_THEMES_GUIDE.md` for user documentation
2. Check `THEMES_IMPLEMENTATION_SUMMARY.md` for technical details
3. Review `ThemeContext.tsx` for theme definitions
4. Test in `SettingsScreen.tsx`
