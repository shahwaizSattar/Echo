// Premium Avatar Customization Configuration

export interface AvatarConfig {
  mask: {
    style: MaskStyle;
    color: string;
    pattern: string;
  };
  hair: {
    style: HairStyle;
    color: string;
  };
  outfit: {
    type: OutfitType;
    color: string;
  };
  theme: {
    name: ThemeName;
    lighting: string;
    background: string;
  };
  accessories: Accessory[];
  enabled: boolean;
}

export type MaskStyle = 'cloth' | 'medical' | 'matte' | 'festival' | 'gradient';
export type HairStyle = 'braids' | 'curly' | 'bun' | 'fade' | 'straight' | 'shoulder' | 'side-fringe' | 'middle-part';
export type OutfitType = 'hoodie' | 'oversized' | 'trench' | 'office' | 'tee' | 'cardigan' | 'jacket';
export type ThemeName = 'nebula-drift' | 'urban-dawn' | 'midnight-frost' | 'pastel-air' | 'noir-shadow' | 'velvet-dusk' | 'misty-garden' | 'arctic-whisper';

export interface Accessory {
  type: 'earrings' | 'glasses' | 'necklace' | 'hat' | 'scarf';
  style: string;
  color: string;
}

// Premium Color Palettes
export const AVATAR_COLORS = {
  neutrals: ['#F5F5F0', '#E8E6E1', '#D4D2CD', '#8B8985', '#6B6965'],
  pastels: ['#E8D5E8', '#D5E8E8', '#E8E8D5', '#E8D5D5', '#D5D5E8'],
  muted: ['#C4B5A0', '#A0B5C4', '#B5A0C4', '#C4A0A0', '#A0C4A0'],
  darks: ['#2D2D2D', '#3A3A3A', '#4A4A4A', '#5A5A5A'],
  accents: ['#9B8B7E', '#7E8B9B', '#8B7E9B', '#9B7E7E', '#7E9B8B'],
};

// Mask Styles Configuration
export const MASK_STYLES = {
  cloth: {
    name: 'Soft Cloth',
    description: 'Comfortable and mysterious',
    icon: '🎭',
    colors: AVATAR_COLORS.neutrals,
  },
  medical: {
    name: 'Minimal Medical',
    description: 'Clean and modern',
    icon: '😷',
    colors: [...AVATAR_COLORS.neutrals, ...AVATAR_COLORS.pastels],
  },
  matte: {
    name: 'Stylish Matte',
    description: 'Sophisticated elegance',
    icon: '🖤',
    colors: AVATAR_COLORS.darks,
  },
  festival: {
    name: 'Festival Subtle',
    description: 'Artistic expression',
    icon: '🎨',
    colors: AVATAR_COLORS.pastels,
  },
  gradient: {
    name: 'Modern Gradient',
    description: 'Premium vibes',
    icon: '✨',
    colors: AVATAR_COLORS.accents,
  },
};

// Hair Styles Configuration
export const HAIR_STYLES = {
  braids: { name: 'Braids', icon: '👧', description: 'Elegant and intricate' },
  curly: { name: 'Curly Tied', icon: '🌀', description: 'Natural and bouncy' },
  bun: { name: 'Messy Bun', icon: '🎀', description: 'Casual chic' },
  fade: { name: 'Short Fade', icon: '✂️', description: 'Clean and sharp' },
  straight: { name: 'Straight Casual', icon: '💇', description: 'Sleek and simple' },
  shoulder: { name: 'Shoulder Flow', icon: '🌊', description: 'Flowing elegance' },
  'side-fringe': { name: 'Side Fringe', icon: '💫', description: 'Trendy and modern' },
  'middle-part': { name: 'Middle Part', icon: '✨', description: 'Balanced style' },
};

// Outfit Types Configuration
export const OUTFIT_TYPES = {
  hoodie: { name: 'Hoodie', icon: '🧥', description: 'Cozy and casual', colors: AVATAR_COLORS.neutrals },
  oversized: { name: 'Oversized Shirt', icon: '👕', description: 'Korean-style comfort', colors: AVATAR_COLORS.pastels },
  trench: { name: 'Trench Coat', icon: '🧥', description: 'Sophisticated mystery', colors: AVATAR_COLORS.darks },
  office: { name: 'Office Wear', icon: '👔', description: 'Professional elegance', colors: AVATAR_COLORS.neutrals },
  tee: { name: 'Minimal Tee', icon: '👚', description: 'Streetwear simplicity', colors: AVATAR_COLORS.muted },
  cardigan: { name: 'Cardigan', icon: '🧶', description: 'Soft and warm', colors: AVATAR_COLORS.pastels },
  jacket: { name: 'Soft Jacket', icon: '🧥', description: 'Layered style', colors: AVATAR_COLORS.accents },
};

// Theme Presets Configuration
export const THEME_PRESETS = {
  'nebula-drift': {
    name: 'Nebula Drift',
    description: 'Cosmic gradient mist',
    icon: '🌌',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    lighting: 'ethereal',
    mood: 'mysterious',
    colors: {
      primary: '#8B7EC8',
      secondary: '#9B8ED8',
      accent: '#AB9EE8',
    },
  },
  'urban-dawn': {
    name: 'Urban Dawn',
    description: 'Soft beige + city blur',
    icon: '🌆',
    background: 'linear-gradient(135deg, #F5F5F0 0%, #E8E6E1 100%)',
    lighting: 'soft',
    mood: 'calm',
    colors: {
      primary: '#D4D2CD',
      secondary: '#C4C2BD',
      accent: '#B4B2AD',
    },
  },
  'midnight-frost': {
    name: 'Midnight Frost',
    description: 'Dark cool highlights',
    icon: '🌙',
    background: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
    lighting: 'cool',
    mood: 'mysterious',
    colors: {
      primary: '#4A5568',
      secondary: '#5A6578',
      accent: '#6A7588',
    },
  },
  'pastel-air': {
    name: 'Pastel Air',
    description: 'Light soft baby blue & pink',
    icon: '☁️',
    background: 'linear-gradient(135deg, #E8D5E8 0%, #D5E8E8 100%)',
    lighting: 'bright',
    mood: 'dreamy',
    colors: {
      primary: '#E8D5E8',
      secondary: '#D5E8E8',
      accent: '#E8E8D5',
    },
  },
  'noir-shadow': {
    name: 'Noir Shadow',
    description: 'High contrast, mysterious',
    icon: '🎬',
    background: 'linear-gradient(135deg, #000000 0%, #2D2D2D 100%)',
    lighting: 'dramatic',
    mood: 'intense',
    colors: {
      primary: '#1A1A1A',
      secondary: '#2A2A2A',
      accent: '#3A3A3A',
    },
  },
  'velvet-dusk': {
    name: 'Velvet Dusk',
    description: 'Deep purples and soft golds',
    icon: '🌆',
    background: 'linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%)',
    lighting: 'warm',
    mood: 'luxurious',
    colors: {
      primary: '#7B1FA2',
      secondary: '#8B2FB2',
      accent: '#9B3FC2',
    },
  },
  'misty-garden': {
    name: 'Misty Garden',
    description: 'Sage greens and morning fog',
    icon: '🌿',
    background: 'linear-gradient(135deg, #A8C5A8 0%, #C8D5C8 100%)',
    lighting: 'natural',
    mood: 'peaceful',
    colors: {
      primary: '#9BB59B',
      secondary: '#ABC5AB',
      accent: '#BBD5BB',
    },
  },
  'arctic-whisper': {
    name: 'Arctic Whisper',
    description: 'Cool whites and icy blues',
    icon: '❄️',
    background: 'linear-gradient(135deg, #E0F2F7 0%, #B3E5FC 100%)',
    lighting: 'crisp',
    mood: 'serene',
    colors: {
      primary: '#B3E5FC',
      secondary: '#C3F5FC',
      accent: '#D3FFFC',
    },
  },
};

// Default Avatar Configuration
export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  mask: {
    style: 'cloth',
    color: '#E8E6E1',
    pattern: 'solid',
  },
  hair: {
    style: 'straight',
    color: '#8B8985',
  },
  outfit: {
    type: 'hoodie',
    color: '#D4D2CD',
  },
  theme: {
    name: 'urban-dawn',
    lighting: 'soft',
    background: '#F5F5F0',
  },
  accessories: [],
  enabled: false,
};

// Accessory Options
export const ACCESSORY_OPTIONS = {
  earrings: {
    name: 'Earrings',
    icon: '💎',
    styles: ['studs', 'hoops', 'drops', 'minimal'],
  },
  glasses: {
    name: 'Glasses',
    icon: '👓',
    styles: ['round', 'square', 'cat-eye', 'aviator'],
  },
  necklace: {
    name: 'Necklace',
    icon: '📿',
    styles: ['chain', 'pendant', 'choker', 'layered'],
  },
  hat: {
    name: 'Hat',
    icon: '🎩',
    styles: ['beanie', 'cap', 'beret', 'fedora'],
  },
  scarf: {
    name: 'Scarf',
    icon: '🧣',
    styles: ['wrap', 'infinity', 'bandana', 'silk'],
  },
};
