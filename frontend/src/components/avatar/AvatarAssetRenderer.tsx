import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { AvatarConfig, THEME_PRESETS } from '../../utils/avatarConfig';

interface AvatarAssetRendererProps {
  config: AvatarConfig;
  size?: number;
  style?: any;
}

/**
 * Asset-based Avatar Renderer
 * Uses external SVG/PNG assets instead of programmatic drawing
 */
const AvatarAssetRenderer: React.FC<AvatarAssetRendererProps> = ({ 
  config, 
  size = 100,
  style 
}) => {
  const theme = THEME_PRESETS[config.theme.name];
  
  // Parse gradient background
  const getGradientColors = (background: string): [string, string, ...string[]] => {
    const matches = background.match(/#[0-9A-Fa-f]{6}/g);
    if (matches && matches.length >= 2) {
      return matches as [string, string, ...string[]];
    }
    return ['#F5F5F0', '#E8E6E1'];
  };

  const gradientColors = getGradientColors(theme.background);

  // Get asset paths based on configuration
  const getAssetPath = (category: string, style: string, color?: string) => {
    const colorSuffix = color ? `-${color.replace('#', '')}` : '';
    return `@assets/avatars/${category}/${style}${colorSuffix}`;
  };

  // Load SVG assets (these will be replaced with actual asset files)
  const maskAsset = getAssetPath('masks', config.mask.style, config.mask.color);
  const hairAsset = getAssetPath('hair', config.hair.style, config.hair.color);
  const outfitAsset = getAssetPath('outfits', config.outfit.type, config.outfit.color);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.layerContainer}>
          {/* Layer 1: Outfit (bottom layer) */}
          <View style={styles.layer}>
            <AssetLayer 
              assetPath={outfitAsset} 
              size={size}
              tintColor={config.outfit.color}
            />
          </View>

          {/* Layer 2: Base silhouette (face/neck) */}
          <View style={styles.layer}>
            <BaseSilhouette size={size} />
          </View>

          {/* Layer 3: Hair */}
          <View style={styles.layer}>
            <AssetLayer 
              assetPath={hairAsset} 
              size={size}
              tintColor={config.hair.color}
            />
          </View>

          {/* Layer 4: Mask (top layer) */}
          <View style={styles.layer}>
            <AssetLayer 
              assetPath={maskAsset} 
              size={size}
              tintColor={config.mask.color}
            />
          </View>

          {/* Layer 5: Accessories */}
          {config.accessories.map((accessory, index) => (
            <View key={`accessory-${index}`} style={styles.layer}>
              <AssetLayer 
                assetPath={getAssetPath('accessories', accessory.type)}
                size={size}
                tintColor={accessory.color}
              />
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

/**
 * Component to render individual asset layers
 * Supports both SVG and PNG formats
 */
interface AssetLayerProps {
  assetPath: string;
  size: number;
  tintColor?: string;
}

const AssetLayer: React.FC<AssetLayerProps> = ({ assetPath, size, tintColor }) => {
  // In production, this would load actual asset files
  // For now, we'll use a placeholder that shows the asset path
  
  // TODO: Replace with actual asset loading
  // const svgAsset = require(`../../assets/avatars/${assetPath}.svg`);
  // return <SvgXml xml={svgAsset} width={size} height={size} />;
  
  return (
    <View style={styles.assetPlaceholder}>
      {/* Placeholder - will be replaced with actual SVG/PNG */}
    </View>
  );
};

/**
 * Base silhouette component (face and neck)
 * This provides the foundation for other layers
 */
interface BaseSilhouetteProps {
  size: number;
}

const BaseSilhouette: React.FC<BaseSilhouetteProps> = ({ size }) => {
  // This would ideally be an SVG asset as well
  // For now, using a simple placeholder
  
  const silhouetteSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
      <defs>
        <radialGradient id="skinGradient" cx="50%" cy="40%">
          <stop offset="0%" stop-color="#F5D5C3" stop-opacity="1" />
          <stop offset="70%" stop-color="#E8C4B0" stop-opacity="1" />
          <stop offset="100%" stop-color="#D4B5A0" stop-opacity="1" />
        </radialGradient>
      </defs>
      
      <!-- Head -->
      <ellipse cx="100" cy="90" rx="45" ry="52" fill="url(#skinGradient)" />
      
      <!-- Neck -->
      <path d="M 75 125 Q 75 135 80 145 L 120 145 Q 125 135 125 125 Z" fill="url(#skinGradient)" />
      
      <!-- Ears -->
      <ellipse cx="60" cy="90" rx="8" ry="12" fill="#E8C4B0" opacity="0.9" />
      <ellipse cx="140" cy="90" rx="8" ry="12" fill="#E8C4B0" opacity="0.9" />
    </svg>
  `;
  
  return <SvgXml xml={silhouetteSvg} width={size} height={size} />;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  background: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  layerContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  assetPlaceholder: {
    width: '100%',
    height: '100%',
  },
});

export default AvatarAssetRenderer;
