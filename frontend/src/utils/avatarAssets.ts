/**
 * Avatar Asset Management System
 * Handles loading and caching of SVG/PNG avatar assets
 */

export interface AvatarAssetDefinition {
  id: string;
  category: 'mask' | 'hair' | 'outfit' | 'background' | 'accessory';
  name: string;
  description: string;
  svgPath?: string;
  pngPath?: string;
  colors: string[];
  tags: string[];
}

/**
 * Asset Registry
 * Maps asset IDs to their file paths and metadata
 */
export const AVATAR_ASSETS: Record<string, AvatarAssetDefinition> = {
  // MASKS
  'mask-beige-cloth': {
    id: 'mask-beige-cloth',
    category: 'mask',
    name: 'Beige Cloth',
    description: 'Soft cotton cloth mask in beige',
    svgPath: 'masks/mask-beige-cloth.svg',
    colors: ['#e6d9cc'],
    tags: ['cloth', 'beige', 'soft'],
  },
  'mask-pink-silk': {
    id: 'mask-pink-silk',
    category: 'mask',
    name: 'Soft Pink Silk',
    description: 'Elegant silk mask in soft pink',
    svgPath: 'masks/mask-pink-silk.svg',
    colors: ['#f5d5e8'],
    tags: ['silk', 'pink', 'elegant'],
  },
  'mask-blue-knit': {
    id: 'mask-blue-knit',
    category: 'mask',
    name: 'Sky Blue Knit',
    description: 'Cozy knit mask in sky blue',
    svgPath: 'masks/mask-blue-knit.svg',
    colors: ['#b3e5fc'],
    tags: ['knit', 'blue', 'cozy'],
  },
  'mask-grey-cloth': {
    id: 'mask-grey-cloth',
    category: 'mask',
    name: 'Light Grey Cloth',
    description: 'Medical-grade cloth mask in light grey',
    svgPath: 'masks/mask-grey-cloth.svg',
    colors: ['#d4d4d4'],
    tags: ['cloth', 'grey', 'medical'],
  },
  'mask-darkgrey-silk': {
    id: 'mask-darkgrey-silk',
    category: 'mask',
    name: 'Dark Grey Silk',
    description: 'Sophisticated silk mask in dark grey',
    svgPath: 'masks/mask-darkgrey-silk.svg',
    colors: ['#6b6965'],
    tags: ['silk', 'grey', 'sophisticated'],
  },
  'mask-black-cloth': {
    id: 'mask-black-cloth',
    category: 'mask',
    name: 'Black Cloth',
    description: 'Modern matte black cloth mask',
    svgPath: 'masks/mask-black-cloth.svg',
    colors: ['#1f1f1f'],
    tags: ['cloth', 'black', 'modern'],
  },
  'mask-lavender-knit': {
    id: 'mask-lavender-knit',
    category: 'mask',
    name: 'Muted Lavender Knit',
    description: 'Cozy knit mask in muted lavender',
    svgPath: 'masks/mask-lavender-knit.svg',
    colors: ['#c4b5fd'],
    tags: ['knit', 'lavender', 'cozy'],
  },
  'mask-cream-silk': {
    id: 'mask-cream-silk',
    category: 'mask',
    name: 'Cream Silk',
    description: 'Luxurious silk mask in cream',
    svgPath: 'masks/mask-cream-silk.svg',
    colors: ['#f5f5f0'],
    tags: ['silk', 'cream', 'luxurious'],
  },

  // HAIR
  'hair-short-straight-male': {
    id: 'hair-short-straight-male',
    category: 'hair',
    name: 'Short Straight (Male)',
    description: 'Professional short straight hair',
    svgPath: 'hair/hair-short-straight-male.svg',
    colors: ['#3b2f2a', '#5d4e47', '#1f1715'],
    tags: ['short', 'straight', 'male', 'professional'],
  },
  'hair-short-straight-female': {
    id: 'hair-short-straight-female',
    category: 'hair',
    name: 'Short Straight (Female)',
    description: 'Elegant bob cut',
    svgPath: 'hair/hair-short-straight-female.svg',
    colors: ['#5d4e47', '#3b2f2a', '#6b4e3d'],
    tags: ['short', 'straight', 'female', 'bob'],
  },
  'hair-medium-wavy': {
    id: 'hair-medium-wavy',
    category: 'hair',
    name: 'Medium Wavy',
    description: 'Natural medium waves',
    svgPath: 'hair/hair-medium-wavy.svg',
    colors: ['#6b4e3d', '#5d4e47', '#8b7e6b'],
    tags: ['medium', 'wavy', 'natural'],
  },
  'hair-long-straight': {
    id: 'hair-long-straight',
    category: 'hair',
    name: 'Long Straight',
    description: 'Sleek long straight hair',
    svgPath: 'hair/hair-long-straight.svg',
    colors: ['#1f1715', '#3b2f2a', '#5d4e47'],
    tags: ['long', 'straight', 'sleek'],
  },
  'hair-low-bun': {
    id: 'hair-low-bun',
    category: 'hair',
    name: 'Low Bun',
    description: 'Elegant low bun',
    svgPath: 'hair/hair-low-bun.svg',
    colors: ['#3b2f2a', '#5d4e47', '#1f1715'],
    tags: ['bun', 'elegant', 'updo'],
  },
  'hair-ponytail': {
    id: 'hair-ponytail',
    category: 'hair',
    name: 'Ponytail',
    description: 'Casual high ponytail',
    svgPath: 'hair/hair-ponytail.svg',
    colors: ['#5d4e47', '#6b4e3d', '#8b7e6b'],
    tags: ['ponytail', 'casual', 'sporty'],
  },
  'hair-braided': {
    id: 'hair-braided',
    category: 'hair',
    name: 'Braided',
    description: 'Intricate braided style',
    svgPath: 'hair/hair-braided.svg',
    colors: ['#6b4e3d', '#5d4e47', '#3b2f2a'],
    tags: ['braided', 'intricate', 'elegant'],
  },
  'hair-loose-waves': {
    id: 'hair-loose-waves',
    category: 'hair',
    name: 'Loose Waves',
    description: 'Effortless loose waves',
    svgPath: 'hair/hair-loose-waves.svg',
    colors: ['#8b7e6b', '#6b4e3d', '#5d4e47'],
    tags: ['waves', 'loose', 'casual'],
  },

  // OUTFITS
  'outfit-tee-beige': {
    id: 'outfit-tee-beige',
    category: 'outfit',
    name: 'Casual T-Shirt',
    description: 'Comfortable beige t-shirt',
    svgPath: 'outfits/outfit-tee-beige.svg',
    colors: ['#e6d9cc'],
    tags: ['tee', 'casual', 'beige'],
  },
  'outfit-hoodie-grey': {
    id: 'outfit-hoodie-grey',
    category: 'outfit',
    name: 'Hoodie',
    description: 'Cozy grey hoodie',
    svgPath: 'outfits/outfit-hoodie-grey.svg',
    colors: ['#8b8985'],
    tags: ['hoodie', 'cozy', 'grey'],
  },
  'outfit-sweater-cream': {
    id: 'outfit-sweater-cream',
    category: 'outfit',
    name: 'Sweater',
    description: 'Soft cream sweater',
    svgPath: 'outfits/outfit-sweater-cream.svg',
    colors: ['#f5f5f0'],
    tags: ['sweater', 'cozy', 'cream'],
  },
  'outfit-shirt-blue': {
    id: 'outfit-shirt-blue',
    category: 'outfit',
    name: 'Collared Shirt',
    description: 'Professional pastel blue shirt',
    svgPath: 'outfits/outfit-shirt-blue.svg',
    colors: ['#b3e5fc'],
    tags: ['shirt', 'professional', 'blue'],
  },
  'outfit-blouse-pink': {
    id: 'outfit-blouse-pink',
    category: 'outfit',
    name: 'Blouse',
    description: 'Elegant soft pink blouse',
    svgPath: 'outfits/outfit-blouse-pink.svg',
    colors: ['#f5d5e8'],
    tags: ['blouse', 'elegant', 'pink'],
  },
  'outfit-trench-beige': {
    id: 'outfit-trench-beige',
    category: 'outfit',
    name: 'Trench Coat',
    description: 'Classic beige trench coat',
    svgPath: 'outfits/outfit-trench-beige.svg',
    colors: ['#e6d9cc'],
    tags: ['trench', 'classic', 'beige'],
  },
  'outfit-jacket-grey': {
    id: 'outfit-jacket-grey',
    category: 'outfit',
    name: 'Jacket',
    description: 'Modern grey jacket',
    svgPath: 'outfits/outfit-jacket-grey.svg',
    colors: ['#6b6965'],
    tags: ['jacket', 'modern', 'grey'],
  },
  'outfit-cardigan-lavender': {
    id: 'outfit-cardigan-lavender',
    category: 'outfit',
    name: 'Cardigan',
    description: 'Cozy lavender cardigan',
    svgPath: 'outfits/outfit-cardigan-lavender.svg',
    colors: ['#c4b5fd'],
    tags: ['cardigan', 'cozy', 'lavender'],
  },

  // BACKGROUNDS
  'bg-neutral-gradient': {
    id: 'bg-neutral-gradient',
    category: 'background',
    name: 'Light Neutral',
    description: 'Soft neutral gradient',
    svgPath: 'backgrounds/bg-neutral-gradient.svg',
    colors: ['#f7efe6', '#e6d7c8'],
    tags: ['neutral', 'gradient', 'soft'],
  },
  'bg-city-silhouette': {
    id: 'bg-city-silhouette',
    category: 'background',
    name: 'City Silhouette',
    description: 'Urban soft focus',
    svgPath: 'backgrounds/bg-city-silhouette.svg',
    colors: ['#d4d2cd', '#f5f5f0'],
    tags: ['city', 'urban', 'silhouette'],
  },
  'bg-soft-mist': {
    id: 'bg-soft-mist',
    category: 'background',
    name: 'Soft Mist',
    description: 'Ethereal misty atmosphere',
    svgPath: 'backgrounds/bg-soft-mist.svg',
    colors: ['#f5f5f0', '#e8e6e1'],
    tags: ['mist', 'ethereal', 'soft'],
  },
  'bg-gradient-dusk': {
    id: 'bg-gradient-dusk',
    category: 'background',
    name: 'Gradient Dusk',
    description: 'Warm to cool dusk gradient',
    svgPath: 'backgrounds/bg-gradient-dusk.svg',
    colors: ['#f5d5e8', '#b3e5fc'],
    tags: ['dusk', 'gradient', 'warm'],
  },
};

/**
 * Get assets by category
 */
export const getAssetsByCategory = (category: string): AvatarAssetDefinition[] => {
  return Object.values(AVATAR_ASSETS).filter(asset => asset.category === category);
};

/**
 * Get asset by ID
 */
export const getAssetById = (id: string): AvatarAssetDefinition | undefined => {
  return AVATAR_ASSETS[id];
};

/**
 * Get asset path for loading
 */
export const getAssetPath = (assetId: string): string | undefined => {
  const asset = AVATAR_ASSETS[assetId];
  return asset?.svgPath || asset?.pngPath;
};

/**
 * Asset loading helper
 * In production, this would use require() or dynamic imports
 */
export const loadAsset = async (assetId: string): Promise<string | null> => {
  const path = getAssetPath(assetId);
  if (!path) return null;
  
  try {
    // TODO: Implement actual asset loading
    // const asset = require(`../assets/avatars/${path}`);
    // return asset;
    
    console.log(`Loading asset: ${path}`);
    return null;
  } catch (error) {
    console.error(`Failed to load asset: ${assetId}`, error);
    return null;
  }
};

/**
 * Map old style IDs to new asset IDs
 */
export const mapStyleToAsset = (category: string, style: string): string => {
  const mapping: Record<string, Record<string, string>> = {
    mask: {
      'cloth': 'mask-beige-cloth',
      'medical': 'mask-grey-cloth',
      'matte': 'mask-black-cloth',
      'festival': 'mask-pink-silk',
      'gradient': 'mask-lavender-knit',
    },
    hair: {
      'braids': 'hair-braided',
      'curly': 'hair-loose-waves',
      'bun': 'hair-low-bun',
      'fade': 'hair-short-straight-male',
      'straight': 'hair-long-straight',
      'shoulder': 'hair-medium-wavy',
      'side-fringe': 'hair-short-straight-female',
      'middle-part': 'hair-ponytail',
    },
    outfit: {
      'hoodie': 'outfit-hoodie-grey',
      'oversized': 'outfit-sweater-cream',
      'trench': 'outfit-trench-beige',
      'office': 'outfit-shirt-blue',
      'tee': 'outfit-tee-beige',
      'cardigan': 'outfit-cardigan-lavender',
      'jacket': 'outfit-jacket-grey',
    },
  };

  return mapping[category]?.[style] || Object.values(AVATAR_ASSETS).find(
    a => a.category === category
  )?.id || '';
};
