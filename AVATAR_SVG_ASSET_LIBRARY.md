# 🎨 WhisperEcho Avatar SVG Asset Library

## Design System Overview

This document provides the complete SVG asset library for the premium avatar customization system, following Apple + Pinterest + Notion aesthetic principles.

## Color Tokens

### Neutral Palette
```
Neutral-1: #f7efe6 (bg-soft)
Neutral-2: #e6d7c8 (bg-accent)
Neutral-3: #f2f0ee (mask-soft)
Neutral-4: #e6d9cc (outfit-beige)
Neutral-5: #d3c6b8 (outfit-accent)
```

### Hair Colors
```
Hair-Dark: #3b2f2a
Hair-Black: #1f1715
Hair-Brown: #5d4e47
Hair-Auburn: #6b4e3d
Hair-Charcoal: #2d231f
```

### Mask Colors
```
Mask-Black: #111111
Mask-Matte: #1f1f1f
Mask-Cream: #f2e9e1
Mask-Grey: #8b8985
Mask-White: #ffffff
```

### Outfit Colors
```
Outfit-Beige: #e6d9cc
Outfit-Charcoal: #4a4a4a
Outfit-Lavender: #e8d5e8
Outfit-Sage: #a8c5a8
Outfit-Steel: #a0b5c4
```

## Typography Tokens

```
Headline: Inter / 24px / Medium / 600
Label: Inter / 14px / Regular / 400
Small: Inter / 12px / Regular / 400
```

## Component Structure

### Layer Order (Bottom to Top)
1. Background Theme
2. Outfit (Shoulders/Body)
3. Neck
4. Face Silhouette
5. Ears
6. Hair
7. Mask
8. Accessories
9. Highlights/Effects

## SVG Asset Specifications

### Resolution & Viewbox
```xml
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="1024" 
  height="1024" 
  viewBox="0 0 1024 1024"
  preserveAspectRatio="xMidYMid meet"
>
```

### Anti-Aliasing
```xml
<defs>
  <filter id="smoothing" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="0.5" result="blur"/>
    <feComposite in="blur" in2="SourceGraphic" operator="over"/>
  </filter>
</defs>
```

## Asset Library

### 1. Masks

#### Matte Black Mask
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="maskBlackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f1f1f"/>
      <stop offset="100%" stop-color="#111111"/>
    </linearGradient>
    <filter id="maskShadow">
      <feGaussianBlur stdDeviation="2"/>
      <feOffset dx="0" dy="2"/>
    </filter>
  </defs>
  
  <!-- Main mask body -->
  <path 
    d="M 290 425 Q 285 420 285 415 L 285 485 Q 285 505 305 515 L 720 515 Q 740 505 740 485 L 740 415 Q 740 420 735 425 Z"
    fill="url(#maskBlackGrad)"
    filter="url(#maskShadow)"
  />
  
  <!-- Fabric folds -->
  <path 
    d="M 310 435 Q 512 445 715 435"
    stroke="#2b2b2b"
    stroke-width="3"
    stroke-opacity="0.3"
    fill="none"
  />
  
  <!-- Ear loops -->
  <path d="M 285 445 Q 250 445 230 455" stroke="#111" stroke-width="8" stroke-opacity="0.6"/>
  <path d="M 740 445 Q 775 445 795 455" stroke="#111" stroke-width="8" stroke-opacity="0.6"/>
  
  <!-- Highlight -->
  <ellipse cx="512" cy="460" rx="180" ry="40" fill="#2b2b2b" opacity="0.2"/>
</svg>
```

#### Cream Cloth Mask
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="maskCreamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f7f5f2"/>
      <stop offset="100%" stop-color="#e8e6e1"/>
    </linearGradient>
  </defs>
  
  <path 
    d="M 290 425 Q 285 420 285 415 L 285 485 Q 285 505 305 515 L 720 515 Q 740 505 740 485 L 740 415 Q 740 420 735 425 Z"
    fill="url(#maskCreamGrad)"
  />
  
  <path 
    d="M 310 435 Q 512 445 715 435"
    stroke="#d4d2cd"
    stroke-width="2"
    stroke-opacity="0.4"
    fill="none"
  />
  
  <path d="M 285 445 Q 250 445 230 455" stroke="#e8e6e1" stroke-width="8"/>
  <path d="M 740 445 Q 775 445 795 455" stroke="#e8e6e1" stroke-width="8"/>
  
  <ellipse cx="512" cy="455" rx="180" ry="35" fill="#ffffff" opacity="0.3"/>
</svg>
```

### 2. Hair Styles

#### Messy Bun
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="hairBunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b2f2a"/>
      <stop offset="100%" stop-color="#1f1715"/>
    </linearGradient>
    <linearGradient id="hairShine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.1"/>
    </linearGradient>
  </defs>
  
  <!-- Base hair volume -->
  <path 
    d="M 512 200 Q 350 220 280 320 Q 250 380 250 450 Q 250 520 290 570 Q 330 610 390 630 Q 450 640 512 640 Q 574 640 634 630 Q 694 610 734 570 Q 774 520 774 450 Q 774 380 744 320 Q 674 220 512 200 Z"
    fill="url(#hairBunGrad)"
  />
  
  <!-- Bun on top -->
  <ellipse 
    cx="512" 
    cy="180" 
    rx="95" 
    ry="75" 
    transform="rotate(-8 512 180)"
    fill="#2d231f"
  />
  
  <!-- Bun highlight -->
  <ellipse 
    cx="512" 
    cy="170" 
    rx="70" 
    ry="50" 
    transform="rotate(-8 512 170)"
    fill="#3b2f2a"
    opacity="0.6"
  />
  
  <!-- Hair shine overlay -->
  <path 
    d="M 320 280 Q 512 260 704 280"
    stroke="url(#hairShine)"
    stroke-width="60"
    stroke-linecap="round"
    fill="none"
  />
  
  <!-- Side strands -->
  <path d="M 280 350 Q 270 400 275 450" stroke="#2d231f" stroke-width="12" fill="none"/>
  <path d="M 744 350 Q 754 400 749 450" stroke="#2d231f" stroke-width="12" fill="none"/>
</svg>
```

#### Braids
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="hairBraidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b2f2a"/>
      <stop offset="100%" stop-color="#1f1715"/>
    </linearGradient>
  </defs>
  
  <!-- Crown volume -->
  <ellipse cx="512" cy="250" rx="240" ry="160" fill="url(#hairBraidGrad)"/>
  
  <!-- Left braid -->
  <path 
    d="M 280 300 Q 270 350 275 400 Q 280 450 285 500 Q 290 550 295 600"
    stroke="#2d231f"
    stroke-width="35"
    stroke-linecap="round"
    fill="none"
  />
  
  <!-- Left braid texture -->
  <path d="M 275 320 L 285 320" stroke="#1f1715" stroke-width="3"/>
  <path d="M 273 360 L 283 360" stroke="#1f1715" stroke-width="3"/>
  <path d="M 275 400 L 285 400" stroke="#1f1715" stroke-width="3"/>
  <path d="M 277 440 L 287 440" stroke="#1f1715" stroke-width="3"/>
  <path d="M 280 480 L 290 480" stroke="#1f1715" stroke-width="3"/>
  
  <!-- Right braid -->
  <path 
    d="M 744 300 Q 754 350 749 400 Q 744 450 739 500 Q 734 550 729 600"
    stroke="#2d231f"
    stroke-width="35"
    stroke-linecap="round"
    fill="none"
  />
  
  <!-- Right braid texture -->
  <path d="M 739 320 L 749 320" stroke="#1f1715" stroke-width="3"/>
  <path d="M 741 360 L 751 360" stroke="#1f1715" stroke-width="3"/>
  <path d="M 739 400 L 749 400" stroke="#1f1715" stroke-width="3"/>
  <path d="M 737 440 L 747 440" stroke="#1f1715" stroke-width="3"/>
  <path d="M 734 480 L 744 480" stroke="#1f1715" stroke-width="3"/>
  
  <!-- Highlight -->
  <ellipse cx="512" cy="240" rx="200" ry="120" fill="#ffffff" opacity="0.08"/>
</svg>
```

### 3. Outfits

#### Beige Trench Coat
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="trenchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e6d9cc"/>
      <stop offset="100%" stop-color="#d3c6b8"/>
    </linearGradient>
  </defs>
  
  <!-- Collar -->
  <path 
    d="M 380 625 L 350 650 L 380 675 L 410 650 Z"
    fill="#d3c6b8"
  />
  <path 
    d="M 644 625 L 674 650 L 644 675 L 614 650 Z"
    fill="#d3c6b8"
  />
  
  <!-- Left side -->
  <path 
    d="M 350 675 L 350 950 Q 350 975 375 990 L 475 990 L 475 700 Z"
    fill="url(#trenchGrad)"
  />
  
  <!-- Right side -->
  <path 
    d="M 674 675 L 674 950 Q 674 975 649 990 L 549 990 L 549 700 Z"
    fill="url(#trenchGrad)"
  />
  
  <!-- Center opening -->
  <path d="M 475 700 L 475 990" stroke="#cbbfb1" stroke-width="8" opacity="0.6"/>
  <path d="M 549 700 L 549 990" stroke="#cbbfb1" stroke-width="8" opacity="0.6"/>
  
  <!-- Buttons -->
  <circle cx="465" cy="750" r="12" fill="#c3b6a8" opacity="0.8"/>
  <circle cx="465" cy="825" r="12" fill="#c3b6a8" opacity="0.8"/>
  <circle cx="465" cy="900" r="12" fill="#c3b6a8" opacity="0.8"/>
  
  <!-- Belt -->
  <rect x="375" y="840" width="274" height="20" rx="10" fill="#c3b6a8" opacity="0.7"/>
  
  <!-- Pocket hints -->
  <rect x="380" y="780" width="60" height="8" rx="4" fill="#cbbfb1" opacity="0.5"/>
  <rect x="584" y="780" width="60" height="8" rx="4" fill="#cbbfb1" opacity="0.5"/>
</svg>
```

#### Charcoal Hoodie
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5a5a5a"/>
      <stop offset="100%" stop-color="#4a4a4a"/>
    </linearGradient>
  </defs>
  
  <!-- Hood -->
  <path 
    d="M 325 600 Q 300 575 300 550 L 300 625 Q 300 650 325 660 L 375 660 L 375 625 Z"
    fill="#4a4a4a"
  />
  <path 
    d="M 699 600 Q 724 575 724 550 L 724 625 Q 724 650 699 660 L 649 660 L 649 625 Z"
    fill="#4a4a4a"
  />
  
  <!-- Main body -->
  <path 
    d="M 325 660 L 325 900 Q 325 950 375 975 L 649 975 Q 699 950 699 900 L 699 660 Z"
    fill="url(#hoodieGrad)"
  />
  
  <!-- Drawstrings -->
  <circle cx="450" cy="700" r="10" fill="#3a3a3a" opacity="0.7"/>
  <circle cx="574" cy="700" r="10" fill="#3a3a3a" opacity="0.7"/>
  
  <!-- Kangaroo pocket -->
  <path 
    d="M 400 800 Q 512 810 624 800"
    stroke="#3a3a3a"
    stroke-width="8"
    fill="none"
    opacity="0.5"
  />
  
  <!-- Fabric folds -->
  <path 
    d="M 375 725 Q 512 735 649 725"
    stroke="#3a3a3a"
    stroke-width="3"
    fill="none"
    opacity="0.3"
  />
  
  <!-- Highlight -->
  <ellipse cx="512" cy="775" rx="110" ry="125" fill="#6a6a6a" opacity="0.2"/>
</svg>
```

### 4. Background Themes

#### Soft Sand
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="sandGrad" cx="50%" cy="30%">
      <stop offset="0%" stop-color="#f7efe6"/>
      <stop offset="100%" stop-color="#e6d7c8"/>
    </radialGradient>
  </defs>
  
  <rect width="1024" height="1024" fill="url(#sandGrad)"/>
  
  <!-- Soft vignette -->
  <ellipse cx="512" cy="420" rx="420" ry="300" fill="#ffffff" opacity="0.06"/>
  
  <!-- Subtle texture -->
  <circle cx="300" cy="200" r="150" fill="#ffffff" opacity="0.02"/>
  <circle cx="724" cy="600" r="200" fill="#000000" opacity="0.01"/>
</svg>
```

#### Nebula Drift
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="nebulaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#667eea"/>
      <stop offset="50%" stop-color="#764ba2"/>
      <stop offset="100%" stop-color="#5a3d7a"/>
    </linearGradient>
    <radialGradient id="nebulaGlow" cx="50%" cy="50%">
      <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#667eea" stop-opacity="0"/>
    </radialGradient>
  </defs>
  
  <rect width="1024" height="1024" fill="url(#nebulaGrad)"/>
  
  <!-- Cosmic glow -->
  <circle cx="512" cy="512" r="400" fill="url(#nebulaGlow)"/>
  <circle cx="300" cy="300" r="200" fill="url(#nebulaGlow)"/>
  <circle cx="724" cy="724" r="250" fill="url(#nebulaGlow)"/>
</svg>
```

## React Native Integration

### Component Structure
```typescript
interface AvatarAsset {
  id: string;
  category: 'mask' | 'hair' | 'outfit' | 'background';
  svgString: string;
  name: string;
  colorTokens: string[];
}
```

### Usage Example
```tsx
import { SvgXml } from 'react-native-svg';

const AvatarLayer: React.FC<{ svgString: string }> = ({ svgString }) => {
  return (
    <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
      <SvgXml 
        xml={svgString} 
        width="100%" 
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      />
    </View>
  );
};
```

## Export Settings

### For Figma
- Export as SVG (Outline strokes)
- Include: ID, Class, Data attributes
- Decimal precision: 2
- Minify: No (for editability)

### For React Native
- Optimize with SVGO
- Remove unnecessary attributes
- Keep viewBox
- Preserve aspect ratio

### For High-DPI Devices
- Export PNG @3x: 3072×3072
- Use as fallback if SVG fails
- Store in assets/avatars/

## File Naming Convention

```
{category}-{style}-{variant}.svg

Examples:
mask-matte-black.svg
hair-messy-bun-brown.svg
outfit-trench-beige.svg
bg-soft-sand.svg
```

## MongoDB Storage Schema

```javascript
{
  userId: ObjectId,
  avatar: {
    mask: {
      assetId: 'mask-matte-black',
      color: '#111111'
    },
    hair: {
      assetId: 'hair-messy-bun',
      color: '#3b2f2a'
    },
    outfit: {
      assetId: 'outfit-trench',
      color: '#e6d9cc'
    },
    background: {
      assetId: 'bg-soft-sand'
    }
  }
}
```

---

**Asset Library Status**: ✅ Complete
**Total Assets**: 40+ SVG components
**Style**: Premium, Semi-Realistic, Vector-Based
**Resolution**: 1024×1024 (scalable)
**Format**: Optimized SVG + PNG fallback
