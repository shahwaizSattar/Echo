# 🎨 Avatar Asset Integration Guide

## Overview

This guide explains how to integrate your custom SVG/PNG avatar assets into the WhisperEcho avatar system.

## 📁 Folder Structure

Create this folder structure in your project:

```
frontend/src/assets/avatars/
├── masks/
│   ├── mask-beige-cloth.svg
│   ├── mask-pink-silk.svg
│   ├── mask-blue-knit.svg
│   ├── mask-grey-cloth.svg
│   ├── mask-darkgrey-silk.svg
│   ├── mask-black-cloth.svg
│   ├── mask-lavender-knit.svg
│   └── mask-cream-silk.svg
├── hair/
│   ├── hair-short-straight-male.svg
│   ├── hair-short-straight-female.svg
│   ├── hair-medium-wavy.svg
│   ├── hair-long-straight.svg
│   ├── hair-low-bun.svg
│   ├── hair-ponytail.svg
│   ├── hair-braided.svg
│   └── hair-loose-waves.svg
├── outfits/
│   ├── outfit-tee-beige.svg
│   ├── outfit-hoodie-grey.svg
│   ├── outfit-sweater-cream.svg
│   ├── outfit-shirt-blue.svg
│   ├── outfit-blouse-pink.svg
│   ├── outfit-trench-beige.svg
│   ├── outfit-jacket-grey.svg
│   └── outfit-cardigan-lavender.svg
└── backgrounds/
    ├── bg-neutral-gradient.svg
    ├── bg-city-silhouette.svg
    ├── bg-soft-mist.svg
    └── bg-gradient-dusk.svg
```

## 📋 Asset Requirements

### SVG Format (Recommended)
```xml
<svg xmlns="http://www.w3.org/2000/svg" 
     width="1024" 
     height="1024" 
     viewBox="0 0 1024 1024"
     preserveAspectRatio="xMidYMid meet">
  <!-- Your asset content -->
</svg>
```

### PNG Format (Alternative)
- Resolution: 2048×2048 minimum (for @3x devices)
- Format: PNG with transparency
- Color: RGB or RGBA
- Compression: Optimized

## 🎯 Asset Specifications

### Masks
- **Position**: Centered, covering lower face (nose to chin)
- **Size**: Should fit within 512×256 area of the 1024×1024 canvas
- **Transparency**: Background must be transparent
- **Details**: Include ear loops, fabric texture, realistic shading

### Hair
- **Position**: Covering top and sides of head
- **Size**: Should extend from top to shoulders
- **Transparency**: Background must be transparent
- **Details**: Natural strands, highlights, shadows, volume

### Outfits
- **Position**: Shoulders and upper torso
- **Size**: Should cover bottom third of canvas
- **Transparency**: Background must be transparent
- **Details**: Fabric texture, collars, buttons, realistic draping

### Backgrounds
- **Position**: Full canvas
- **Size**: 1024×1024
- **Transparency**: Can be opaque
- **Details**: Soft gradients, atmospheric effects

## 🔧 Integration Steps

### Step 1: Create Assets Folder
```bash
mkdir -p frontend/src/assets/avatars/{masks,hair,outfits,backgrounds}
```

### Step 2: Add Your SVG Files
Place your generated SVG files in the appropriate folders with the exact names listed above.

### Step 3: Update Asset Loader (if using PNG)
If you're using PNG instead of SVG, update the file extensions in `avatarAssets.ts`:

```typescript
'mask-beige-cloth': {
  // ...
  pngPath: 'masks/mask-beige-cloth.png', // Instead of svgPath
  // ...
}
```

### Step 4: Test Individual Assets
Create a test component to verify each asset loads correctly:

```tsx
import { SvgXml } from 'react-native-svg';
import maskBeigeCloth from '../assets/avatars/masks/mask-beige-cloth.svg';

const TestAsset = () => (
  <SvgXml xml={maskBeigeCloth} width={200} height={200} />
);
```

## 📤 How to Provide Assets

### Option 1: Direct File Sharing
1. Generate all 28 SVG files using the prompts in `AVATAR_ASSET_GENERATION_PROMPTS.md`
2. Zip the `avatars` folder
3. Share the zip file

### Option 2: Paste SVG Code
1. Generate one asset at a time
2. Paste the SVG code in chat
3. I'll create the file for you

### Option 3: Repository
1. Create a GitHub repository
2. Upload all assets
3. Share the repository link

## 🎨 Asset Generation Workflow

### Using AI Tools

#### MidJourney
```
/imagine [prompt from AVATAR_ASSET_GENERATION_PROMPTS.md] --v 5 --style raw --ar 1:1
```
Then convert to SVG using:
- Vectorizer.ai
- Adobe Illustrator (Image Trace)
- Inkscape (Trace Bitmap)

#### Leonardo.ai
1. Use the prompt from the guide
2. Select "Vector Art" style
3. Generate at 1024×1024
4. Export as SVG

#### DALL-E + Vectorization
1. Generate with DALL-E
2. Use Vectorizer.ai to convert to SVG
3. Clean up in Figma or Illustrator

### Manual Creation (Figma/Illustrator)

#### Figma
1. Create 1024×1024 frame
2. Design asset with vector shapes
3. Export as SVG (Outline strokes)
4. Optimize with SVGO

#### Adobe Illustrator
1. Create 1024×1024 artboard
2. Design with vector tools
3. Export as SVG (Presentation Attributes)
4. Optimize file size

## ✅ Quality Checklist

Before submitting assets, verify:

- [ ] Correct dimensions (1024×1024)
- [ ] Proper viewBox (0 0 1024 1024)
- [ ] Transparent background (except backgrounds)
- [ ] Clean vector paths (no raster images)
- [ ] Organized layers/groups
- [ ] Unique IDs for gradients/filters
- [ ] Optimized file size (<100KB per SVG)
- [ ] Realistic shading and highlights
- [ ] Smooth curves and edges
- [ ] Natural proportions
- [ ] Consistent style across all assets

## 🔍 Testing Assets

### Visual Test
```tsx
import AvatarAssetRenderer from './components/avatar/AvatarAssetRenderer';

const TestAvatar = () => (
  <AvatarAssetRenderer
    config={{
      mask: { style: 'cloth', color: '#e6d9cc', pattern: 'solid' },
      hair: { style: 'straight', color: '#3b2f2a' },
      outfit: { type: 'hoodie', color: '#8b8985' },
      theme: { name: 'urban-dawn', lighting: 'soft', background: '#F5F5F0' },
      accessories: [],
      enabled: true,
    }}
    size={200}
  />
);
```

### Layer Test
Test each layer individually to ensure proper positioning and transparency.

## 🐛 Troubleshooting

### Asset Not Loading
- Check file path matches exactly
- Verify file extension (.svg or .png)
- Ensure file is in correct folder
- Check for typos in filename

### Asset Looks Wrong
- Verify viewBox is correct
- Check if background is transparent
- Ensure proper positioning within canvas
- Verify colors are correct

### Performance Issues
- Optimize SVG with SVGO
- Reduce number of paths
- Simplify gradients
- Use PNG fallback for complex assets

## 📊 Asset Inventory

### Required Assets: 28 Total

#### Masks: 8
- [x] Beige Cloth
- [x] Soft Pink Silk
- [x] Sky Blue Knit
- [x] Light Grey Cloth
- [x] Dark Grey Silk
- [x] Black Cloth
- [x] Muted Lavender Knit
- [x] Cream Silk

#### Hair: 8
- [x] Short Straight (Male)
- [x] Short Straight (Female)
- [x] Medium Wavy
- [x] Long Straight
- [x] Low Bun
- [x] Ponytail
- [x] Braided
- [x] Loose Waves

#### Outfits: 8
- [x] Casual T-Shirt (Beige)
- [x] Hoodie (Grey)
- [x] Sweater (Cream)
- [x] Collared Shirt (Blue)
- [x] Blouse (Pink)
- [x] Trench Coat (Beige)
- [x] Jacket (Grey)
- [x] Cardigan (Lavender)

#### Backgrounds: 4
- [x] Light Neutral Gradient
- [x] City Silhouette
- [x] Soft Mist
- [x] Gradient Dusk

## 🚀 Next Steps

1. **Generate Assets**: Use the prompts in `AVATAR_ASSET_GENERATION_PROMPTS.md`
2. **Organize Files**: Place in correct folders with exact names
3. **Test Loading**: Verify each asset loads correctly
4. **Integration**: I'll update the renderer to use your assets
5. **Polish**: Fine-tune positioning and colors

## 💡 Tips

- Start with one category (e.g., masks) to test the workflow
- Use consistent style across all assets
- Keep file sizes small (<100KB per SVG)
- Test on multiple devices
- Maintain aspect ratio
- Use semantic naming

---

**Ready to integrate!** Just provide your assets and I'll handle the rest. 🎨✨
