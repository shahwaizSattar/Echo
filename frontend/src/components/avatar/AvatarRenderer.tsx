import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { 
  Circle, Path, Rect, Ellipse, G, Defs, 
  RadialGradient, LinearGradient as SvgLinearGradient, 
  Stop, ClipPath 
} from 'react-native-svg';
import { AvatarConfig, THEME_PRESETS } from '../../utils/avatarConfig';

interface AvatarRendererProps {
  config: AvatarConfig;
  size?: number;
  style?: any;
}

const AvatarRenderer: React.FC<AvatarRendererProps> = ({ 
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

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            {/* Skin tone gradient for realistic shading */}
            <RadialGradient id="skinGradient" cx="50%" cy="40%">
              <Stop offset="0%" stopColor="#F5D5C3" stopOpacity="1" />
              <Stop offset="70%" stopColor="#E8C4B0" stopOpacity="1" />
              <Stop offset="100%" stopColor="#D4B5A0" stopOpacity="1" />
            </RadialGradient>
            
            {/* Shadow gradient for depth */}
            <RadialGradient id="shadowGradient" cx="50%" cy="80%">
              <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
            </RadialGradient>
            
            {/* Hair shine gradient */}
            <SvgLinearGradient id="hairShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
              <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
            </SvgLinearGradient>
          </Defs>
          
          {/* Head/Face Base with realistic proportions */}
          <Ellipse
            cx="100"
            cy="90"
            rx="45"
            ry="52"
            fill="url(#skinGradient)"
          />
          
          {/* Neck with shading */}
          <Path
            d="M 75 125 Q 75 135 80 145 L 120 145 Q 125 135 125 125 Z"
            fill="url(#skinGradient)"
          />
          <Path
            d="M 75 125 Q 75 135 80 145 L 120 145 Q 125 135 125 125 Z"
            fill="url(#shadowGradient)"
            opacity={0.3}
          />
          
          {/* Ears with realistic shape */}
          <Ellipse cx="60" cy="90" rx="8" ry="12" fill="#E8C4B0" opacity={0.9} />
          <Ellipse cx="140" cy="90" rx="8" ry="12" fill="#E8C4B0" opacity={0.9} />
          
          {/* Hair */}
          {renderHair(config.hair.style, config.hair.color)}
          
          {/* Mask */}
          {renderMask(config.mask.style, config.mask.color)}
          
          {/* Outfit (neck/shoulders) */}
          {renderOutfit(config.outfit.type, config.outfit.color)}
          
          {/* Accessories */}
          {config.accessories.map((accessory, index) => 
            renderAccessory(accessory.type, accessory.color, index)
          )}
          
          {/* Subtle ambient shadow */}
          <Ellipse
            cx="100"
            cy="195"
            rx="60"
            ry="8"
            fill="#000000"
            opacity={0.08}
          />
        </Svg>
      </LinearGradient>
    </View>
  );
};

// Premium hair rendering with smooth, realistic styling
const renderHair = (style: string, color: string) => {
  // Darken color for shadows
  const shadowColor = adjustColorBrightness(color, -20);
  const highlightColor = adjustColorBrightness(color, 20);
  
  switch (style) {
    case 'braids':
      return (
        <G>
          {/* Main hair volume */}
          <Path 
            d="M 55 35 Q 45 25 55 20 Q 70 18 85 25 Q 95 35 95 50 Q 95 60 90 70 L 85 65 Q 88 55 88 45 Q 88 35 80 30 Q 70 25 60 28 Q 55 30 55 35 Z"
            fill={color}
          />
          <Path 
            d="M 145 35 Q 155 25 145 20 Q 130 18 115 25 Q 105 35 105 50 Q 105 60 110 70 L 115 65 Q 112 55 112 45 Q 112 35 120 30 Q 130 25 140 28 Q 145 30 145 35 Z"
            fill={color}
          />
          {/* Crown volume */}
          <Ellipse cx="100" cy="40" rx="48" ry="32" fill={color} />
          {/* Highlights */}
          <Ellipse cx="100" cy="35" rx="42" ry="25" fill={highlightColor} opacity={0.3} />
          {/* Braid details */}
          <Path d="M 60 50 Q 58 60 60 70" stroke={shadowColor} strokeWidth="4" fill="none" opacity={0.6} />
          <Path d="M 140 50 Q 142 60 140 70" stroke={shadowColor} strokeWidth="4" fill="none" opacity={0.6} />
        </G>
      );
    case 'curly':
      return (
        <G>
          {/* Base volume */}
          <Ellipse cx="100" cy="45" rx="52" ry="38" fill={color} />
          {/* Curly texture layers */}
          <Circle cx="70" cy="50" r="14" fill={color} opacity={0.9} />
          <Circle cx="130" cy="50" r="14" fill={color} opacity={0.9} />
          <Circle cx="85" cy="38" r="12" fill={color} opacity={0.85} />
          <Circle cx="115" cy="38" r="12" fill={color} opacity={0.85} />
          <Circle cx="100" cy="32" r="16" fill={color} opacity={0.9} />
          {/* Highlights for dimension */}
          <Circle cx="95" cy="35" r="10" fill={highlightColor} opacity={0.4} />
          <Circle cx="75" cy="48" r="8" fill={highlightColor} opacity={0.3} />
          <Circle cx="125" cy="48" r="8" fill={highlightColor} opacity={0.3} />
          {/* Shadow for depth */}
          <Ellipse cx="100" cy="60" rx="45" ry="15" fill={shadowColor} opacity={0.2} />
        </G>
      );
    case 'bun':
      return (
        <G>
          {/* Hair pulled back */}
          <Ellipse cx="100" cy="45" rx="48" ry="28" fill={color} />
          {/* Bun on top */}
          <Ellipse cx="100" cy="28" rx="22" ry="18" fill={color} />
          <Ellipse cx="100" cy="26" rx="18" ry="14" fill={highlightColor} opacity={0.4} />
          {/* Bun shadow */}
          <Ellipse cx="100" cy="32" rx="20" ry="8" fill={shadowColor} opacity={0.3} />
          {/* Side strands */}
          <Path d="M 55 50 Q 52 60 55 70" stroke={color} strokeWidth="3" fill="none" />
          <Path d="M 145 50 Q 148 60 145 70" stroke={color} strokeWidth="3" fill="none" />
        </G>
      );
    case 'fade':
      return (
        <G>
          {/* Gradient fade effect */}
          <Ellipse cx="100" cy="48" rx="48" ry="28" fill={color} />
          <Ellipse cx="100" cy="52" rx="46" ry="22" fill={color} opacity={0.7} />
          <Ellipse cx="100" cy="56" rx="44" ry="18" fill={color} opacity={0.5} />
          {/* Top volume */}
          <Ellipse cx="100" cy="38" rx="42" ry="20" fill={color} />
          {/* Highlight */}
          <Ellipse cx="100" cy="35" rx="35" ry="15" fill={highlightColor} opacity={0.3} />
        </G>
      );
    case 'straight':
      return (
        <G>
          {/* Crown */}
          <Ellipse cx="100" cy="42" rx="50" ry="32" fill={color} />
          {/* Flowing straight hair */}
          <Path 
            d="M 52 60 L 48 90 Q 48 95 52 95 L 58 95 Q 60 90 58 85 L 54 65 Z"
            fill={color}
          />
          <Path 
            d="M 148 60 L 152 90 Q 152 95 148 95 L 142 95 Q 140 90 142 85 L 146 65 Z"
            fill={color}
          />
          {/* Center strands */}
          <Rect x="70" y="60" width="60" height="35" rx="8" fill={color} opacity={0.9} />
          {/* Shine effect */}
          <Ellipse cx="100" cy="38" rx="42" ry="25" fill="url(#hairShine)" />
        </G>
      );
    case 'shoulder':
      return (
        <G>
          {/* Crown volume */}
          <Ellipse cx="100" cy="42" rx="50" ry="32" fill={color} />
          {/* Flowing to shoulders */}
          <Path 
            d="M 52 60 Q 45 80 42 100 Q 40 110 45 115 L 55 115 Q 58 105 60 95 L 58 70 Z"
            fill={color}
          />
          <Path 
            d="M 148 60 Q 155 80 158 100 Q 160 110 155 115 L 145 115 Q 142 105 140 95 L 142 70 Z"
            fill={color}
          />
          {/* Back hair */}
          <Rect x="65" y="60" width="70" height="55" rx="12" fill={color} opacity={0.95} />
          {/* Highlights */}
          <Ellipse cx="100" cy="38" rx="42" ry="25" fill={highlightColor} opacity={0.3} />
          <Path d="M 80 70 L 78 105" stroke={highlightColor} strokeWidth="3" opacity={0.4} />
          <Path d="M 120 70 L 122 105" stroke={highlightColor} strokeWidth="3" opacity={0.4} />
        </G>
      );
    case 'side-fringe':
      return (
        <G>
          {/* Main volume */}
          <Ellipse cx="100" cy="42" rx="50" ry="32" fill={color} />
          {/* Side swept fringe */}
          <Path 
            d="M 60 35 Q 70 45 75 60 Q 78 70 82 75 L 85 72 Q 82 65 80 55 Q 75 40 65 32 Z"
            fill={color}
          />
          <Path 
            d="M 60 35 Q 70 45 75 60"
            stroke={shadowColor}
            strokeWidth="2"
            fill="none"
            opacity={0.4}
          />
          {/* Highlight */}
          <Ellipse cx="110" cy="38" rx="35" ry="22" fill={highlightColor} opacity={0.3} />
        </G>
      );
    case 'middle-part':
      return (
        <G>
          {/* Left side */}
          <Path 
            d="M 100 30 Q 75 35 60 45 Q 55 50 55 60 L 58 62 Q 60 52 65 45 Q 78 38 95 35 Z"
            fill={color}
          />
          {/* Right side */}
          <Path 
            d="M 100 30 Q 125 35 140 45 Q 145 50 145 60 L 142 62 Q 140 52 135 45 Q 122 38 105 35 Z"
            fill={color}
          />
          {/* Back volume */}
          <Ellipse cx="100" cy="48" rx="48" ry="30" fill={color} />
          {/* Part line shadow */}
          <Path d="M 100 30 L 100 50" stroke={shadowColor} strokeWidth="1.5" opacity={0.5} />
          {/* Highlights */}
          <Ellipse cx="80" cy="42" rx="18" ry="22" fill={highlightColor} opacity={0.3} />
          <Ellipse cx="120" cy="42" rx="18" ry="22" fill={highlightColor} opacity={0.3} />
        </G>
      );
    default:
      return (
        <G>
          <Ellipse cx="100" cy="42" rx="50" ry="32" fill={color} />
          <Ellipse cx="100" cy="38" rx="42" ry="25" fill={highlightColor} opacity={0.3} />
        </G>
      );
  }
};

// Helper function to adjust color brightness
const adjustColorBrightness = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
};

// Premium mask rendering with realistic fabric/material textures
const renderMask = (style: string, color: string) => {
  const shadowColor = adjustColorBrightness(color, -25);
  const highlightColor = adjustColorBrightness(color, 15);
  
  switch (style) {
    case 'cloth':
      return (
        <G>
          {/* Main mask body with soft edges */}
          <Path 
            d="M 58 85 Q 55 80 55 75 L 55 95 Q 55 105 65 108 L 135 108 Q 145 105 145 95 L 145 75 Q 145 80 142 85 Z"
            fill={color}
          />
          {/* Fabric folds and texture */}
          <Path 
            d="M 60 85 Q 100 88 140 85"
            stroke={shadowColor}
            strokeWidth="1.5"
            fill="none"
            opacity={0.3}
          />
          <Path 
            d="M 62 95 Q 100 97 138 95"
            stroke={shadowColor}
            strokeWidth="1"
            fill="none"
            opacity={0.2}
          />
          {/* Ear loops */}
          <Path 
            d="M 55 85 Q 48 85 45 88"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            opacity={0.8}
          />
          <Path 
            d="M 145 85 Q 152 85 155 88"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            opacity={0.8}
          />
          {/* Subtle highlight */}
          <Ellipse 
            cx="100" 
            cy="90" 
            rx="35" 
            ry="12" 
            fill={highlightColor} 
            opacity={0.2} 
          />
        </G>
      );
    case 'medical':
      return (
        <G>
          {/* Main surgical mask shape */}
          <Path 
            d="M 56 82 L 56 98 Q 56 106 64 108 L 136 108 Q 144 106 144 98 L 144 82 Q 144 78 140 76 L 60 76 Q 56 78 56 82 Z"
            fill={color}
          />
          {/* Pleats for realism */}
          <Path d="M 65 82 L 135 82" stroke={shadowColor} strokeWidth="1" opacity={0.25} />
          <Path d="M 65 90 L 135 90" stroke={shadowColor} strokeWidth="1" opacity={0.25} />
          <Path d="M 65 98 L 135 98" stroke={shadowColor} strokeWidth="1" opacity={0.25} />
          {/* Nose bridge wire */}
          <Rect 
            x="85" 
            y="76" 
            width="30" 
            height="3" 
            rx="1.5" 
            fill={shadowColor} 
            opacity={0.4} 
          />
          {/* Ear straps */}
          <Path 
            d="M 56 85 Q 50 85 46 87"
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
          <Path 
            d="M 144 85 Q 150 85 154 87"
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
          {/* Highlight for dimension */}
          <Ellipse 
            cx="100" 
            cy="88" 
            rx="32" 
            ry="10" 
            fill={highlightColor} 
            opacity={0.25} 
          />
        </G>
      );
    case 'matte':
      return (
        <G>
          {/* Sleek matte mask */}
          <Path 
            d="M 54 78 Q 54 75 57 73 L 143 73 Q 146 75 146 78 L 146 102 Q 146 108 140 110 L 60 110 Q 54 108 54 102 Z"
            fill={color}
          />
          {/* Subtle contour lines */}
          <Path 
            d="M 70 78 Q 100 82 130 78"
            stroke={shadowColor}
            strokeWidth="1"
            fill="none"
            opacity={0.2}
          />
          {/* Nose bridge contour */}
          <Ellipse 
            cx="100" 
            cy="85" 
            rx="18" 
            ry="8" 
            fill={shadowColor} 
            opacity={0.15} 
          />
          {/* Minimal highlight */}
          <Ellipse 
            cx="100" 
            cy="82" 
            rx="25" 
            ry="6" 
            fill={highlightColor} 
            opacity={0.2} 
          />
        </G>
      );
    case 'festival':
      return (
        <G>
          {/* Artistic mask shape */}
          <Path 
            d="M 58 80 Q 55 78 55 75 Q 55 72 58 70 L 142 70 Q 145 72 145 75 Q 145 78 142 80 L 142 105 Q 142 110 137 112 L 63 112 Q 58 110 58 105 Z"
            fill={color}
          />
          {/* Decorative pattern */}
          <Circle cx="75" cy="88" r="5" fill={highlightColor} opacity={0.5} />
          <Circle cx="100" cy="85" r="6" fill={highlightColor} opacity={0.6} />
          <Circle cx="125" cy="88" r="5" fill={highlightColor} opacity={0.5} />
          <Circle cx="85" cy="98" r="4" fill={highlightColor} opacity={0.4} />
          <Circle cx="115" cy="98" r="4" fill={highlightColor} opacity={0.4} />
          {/* Subtle texture */}
          <Path 
            d="M 65 78 Q 100 82 135 78"
            stroke={shadowColor}
            strokeWidth="0.8"
            fill="none"
            opacity={0.2}
          />
        </G>
      );
    case 'gradient':
      return (
        <G>
          <Defs>
            <SvgLinearGradient id="maskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="1" />
              <Stop offset="50%" stopColor={highlightColor} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={shadowColor} stopOpacity="0.8" />
            </SvgLinearGradient>
          </Defs>
          {/* Modern gradient mask */}
          <Path 
            d="M 56 76 Q 56 72 60 70 L 140 70 Q 144 72 144 76 L 144 104 Q 144 110 138 112 L 62 112 Q 56 110 56 104 Z"
            fill="url(#maskGradient)"
          />
          {/* Smooth contour */}
          <Path 
            d="M 68 78 Q 100 84 132 78"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            fill="none"
            opacity={0.3}
          />
          {/* Glow effect */}
          <Ellipse 
            cx="100" 
            cy="88" 
            rx="30" 
            ry="12" 
            fill="#FFFFFF" 
            opacity={0.15} 
          />
        </G>
      );
    default:
      return (
        <G>
          <Path 
            d="M 58 85 Q 55 80 55 75 L 55 95 Q 55 105 65 108 L 135 108 Q 145 105 145 95 L 145 75 Q 145 80 142 85 Z"
            fill={color}
          />
        </G>
      );
  }
};

// Premium outfit rendering with realistic fabric and structure
const renderOutfit = (type: string, color: string) => {
  const shadowColor = adjustColorBrightness(color, -30);
  const highlightColor = adjustColorBrightness(color, 20);
  
  switch (type) {
    case 'hoodie':
      return (
        <G>
          {/* Hood */}
          <Path 
            d="M 65 120 Q 60 115 60 110 L 60 125 Q 60 130 65 132 L 75 132 L 75 125 Z"
            fill={color}
          />
          <Path 
            d="M 135 120 Q 140 115 140 110 L 140 125 Q 140 130 135 132 L 125 132 L 125 125 Z"
            fill={color}
          />
          {/* Main body */}
          <Path 
            d="M 65 132 L 65 180 Q 65 190 75 195 L 125 195 Q 135 190 135 180 L 135 132 Z"
            fill={color}
          />
          {/* Drawstrings */}
          <Circle cx="90" cy="140" r="2.5" fill={shadowColor} opacity={0.6} />
          <Circle cx="110" cy="140" r="2.5" fill={shadowColor} opacity={0.6} />
          {/* Pocket */}
          <Path 
            d="M 80 160 Q 100 162 120 160"
            stroke={shadowColor}
            strokeWidth="2"
            fill="none"
            opacity={0.4}
          />
          {/* Fabric folds */}
          <Path 
            d="M 75 145 Q 100 148 125 145"
            stroke={shadowColor}
            strokeWidth="1"
            fill="none"
            opacity={0.2}
          />
          {/* Highlight */}
          <Ellipse 
            cx="100" 
            cy="155" 
            rx="22" 
            ry="25" 
            fill={highlightColor} 
            opacity={0.15} 
          />
        </G>
      );
    case 'oversized':
      return (
        <G>
          {/* Oversized shoulders */}
          <Path 
            d="M 50 130 L 45 145 Q 43 150 45 155 L 50 155 L 55 140 Z"
            fill={color}
          />
          <Path 
            d="M 150 130 L 155 145 Q 157 150 155 155 L 150 155 L 145 140 Z"
            fill={color}
          />
          {/* Main loose body */}
          <Path 
            d="M 55 135 L 55 185 Q 55 192 62 195 L 138 195 Q 145 192 145 185 L 145 135 Z"
            fill={color}
          />
          {/* Fabric draping */}
          <Path 
            d="M 60 150 Q 100 155 140 150"
            stroke={shadowColor}
            strokeWidth="1.5"
            fill="none"
            opacity={0.25}
          />
          <Path 
            d="M 62 170 Q 100 173 138 170"
            stroke={shadowColor}
            strokeWidth="1"
            fill="none"
            opacity={0.2}
          />
          {/* Highlight */}
          <Ellipse 
            cx="100" 
            cy="160" 
            rx="30" 
            ry="28" 
            fill={highlightColor} 
            opacity={0.12} 
          />
        </G>
      );
    case 'trench':
      return (
        <G>
          {/* Collar */}
          <Path 
            d="M 75 125 L 70 130 L 75 135 L 80 130 Z"
            fill={color}
          />
          <Path 
            d="M 125 125 L 130 130 L 125 135 L 120 130 Z"
            fill={color}
          />
          {/* Main coat body */}
          <Path 
            d="M 70 135 L 70 190 Q 70 195 75 197 L 95 197 L 95 140 Z"
            fill={color}
          />
          <Path 
            d="M 130 135 L 130 190 Q 130 195 125 197 L 105 197 L 105 140 Z"
            fill={color}
          />
          {/* Center opening */}
          <Path 
            d="M 95 140 L 95 197"
            stroke={shadowColor}
            strokeWidth="2"
            opacity={0.5}
          />
          <Path 
            d="M 105 140 L 105 197"
            stroke={shadowColor}
            strokeWidth="2"
            opacity={0.5}
          />
          {/* Buttons */}
          <Circle cx="92" cy="150" r="3" fill={shadowColor} opacity={0.7} />
          <Circle cx="92" cy="165" r="3" fill={shadowColor} opacity={0.7} />
          <Circle cx="92" cy="180" r="3" fill={shadowColor} opacity={0.7} />
          {/* Belt */}
          <Rect 
            x="75" 
            y="168" 
            width="50" 
            height="5" 
            rx="2" 
            fill={shadowColor} 
            opacity={0.6} 
          />
        </G>
      );
    case 'office':
      return (
        <G>
          {/* Collar */}
          <Path 
            d="M 85 128 L 80 135 L 90 138 L 95 132 Z"
            fill="#FFFFFF"
          />
          <Path 
            d="M 115 128 L 120 135 L 110 138 L 105 132 Z"
            fill="#FFFFFF"
          />
          {/* Shirt body */}
          <Path 
            d="M 75 135 L 75 190 Q 75 195 80 197 L 120 197 Q 125 195 125 190 L 125 135 Z"
            fill={color}
          />
          {/* Button placket */}
          <Path 
            d="M 100 138 L 100 197"
            stroke={shadowColor}
            strokeWidth="3"
            opacity={0.3}
          />
          {/* Buttons */}
          <Circle cx="100" cy="145" r="2" fill={shadowColor} opacity={0.6} />
          <Circle cx="100" cy="160" r="2" fill={shadowColor} opacity={0.6} />
          <Circle cx="100" cy="175" r="2" fill={shadowColor} opacity={0.6} />
          {/* Tie */}
          <Path 
            d="M 100 138 L 95 155 L 100 190 L 105 155 Z"
            fill="#2D3748"
            opacity={0.8}
          />
        </G>
      );
    case 'tee':
      return (
        <G>
          {/* Sleeves */}
          <Path 
            d="M 70 135 L 60 145 Q 58 148 60 152 L 65 152 L 72 142 Z"
            fill={color}
          />
          <Path 
            d="M 130 135 L 140 145 Q 142 148 140 152 L 135 152 L 128 142 Z"
            fill={color}
          />
          {/* Main tee body */}
          <Path 
            d="M 72 138 L 72 188 Q 72 194 78 196 L 122 196 Q 128 194 128 188 L 128 138 Z"
            fill={color}
          />
          {/* Neckline */}
          <Ellipse 
            cx="100" 
            cy="135" 
            rx="12" 
            ry="6" 
            fill={shadowColor} 
            opacity={0.3} 
          />
          {/* Subtle fabric texture */}
          <Path 
            d="M 78 155 Q 100 157 122 155"
            stroke={shadowColor}
            strokeWidth="0.8"
            fill="none"
            opacity={0.15}
          />
        </G>
      );
    case 'cardigan':
      return (
        <G>
          {/* Left side */}
          <Path 
            d="M 70 135 L 70 190 Q 70 195 75 197 L 95 197 L 95 140 Z"
            fill={color}
          />
          {/* Right side */}
          <Path 
            d="M 130 135 L 130 190 Q 130 195 125 197 L 105 197 L 105 140 Z"
            fill={color}
          />
          {/* Center opening */}
          <Path 
            d="M 95 140 L 95 197"
            stroke={shadowColor}
            strokeWidth="1.5"
            opacity={0.4}
          />
          <Path 
            d="M 105 140 L 105 197"
            stroke={shadowColor}
            strokeWidth="1.5"
            opacity={0.4}
          />
          {/* Buttons */}
          <Circle cx="97" cy="150" r="2.5" fill={shadowColor} opacity={0.6} />
          <Circle cx="97" cy="165" r="2.5" fill={shadowColor} opacity={0.6} />
          <Circle cx="97" cy="180" r="2.5" fill={shadowColor} opacity={0.6} />
          {/* Knit texture */}
          <Path 
            d="M 75 150 L 90 150"
            stroke={shadowColor}
            strokeWidth="0.5"
            opacity={0.2}
          />
          <Path 
            d="M 110 150 L 125 150"
            stroke={shadowColor}
            strokeWidth="0.5"
            opacity={0.2}
          />
        </G>
      );
    case 'jacket':
      return (
        <G>
          {/* Collar */}
          <Path 
            d="M 78 128 L 72 135 L 80 138 L 85 132 Z"
            fill={color}
          />
          <Path 
            d="M 122 128 L 128 135 L 120 138 L 115 132 Z"
            fill={color}
          />
          {/* Main jacket body */}
          <Path 
            d="M 72 135 L 72 188 Q 72 194 78 196 L 122 196 Q 128 194 128 188 L 128 135 Z"
            fill={color}
          />
          {/* Zipper */}
          <Path 
            d="M 100 138 L 100 196"
            stroke={shadowColor}
            strokeWidth="2.5"
            opacity={0.5}
          />
          {/* Pockets */}
          <Path 
            d="M 78 160 L 88 160 L 88 172 L 78 172"
            stroke={shadowColor}
            strokeWidth="1.5"
            fill="none"
            opacity={0.4}
          />
          <Path 
            d="M 122 160 L 112 160 L 112 172 L 122 172"
            stroke={shadowColor}
            strokeWidth="1.5"
            fill="none"
            opacity={0.4}
          />
          {/* Highlight */}
          <Ellipse 
            cx="90" 
            cy="155" 
            rx="8" 
            ry="20" 
            fill={highlightColor} 
            opacity={0.15} 
          />
        </G>
      );
    default:
      return (
        <G>
          <Path 
            d="M 75 135 L 75 190 Q 75 195 80 197 L 120 197 Q 125 195 125 190 L 125 135 Z"
            fill={color}
          />
        </G>
      );
  }
};

// Premium accessory rendering with realistic details
const renderAccessory = (type: string, color: string, index: number) => {
  const highlightColor = adjustColorBrightness(color, 30);
  
  switch (type) {
    case 'earrings':
      return (
        <G key={`accessory-${index}`}>
          {/* Left earring */}
          <Circle cx="62" cy="95" r="4" fill={color} />
          <Circle cx="62" cy="95" r="2.5" fill={highlightColor} opacity={0.6} />
          {/* Right earring */}
          <Circle cx="138" cy="95" r="4" fill={color} />
          <Circle cx="138" cy="95" r="2.5" fill={highlightColor} opacity={0.6} />
        </G>
      );
    case 'glasses':
      return (
        <G key={`accessory-${index}`}>
          {/* Left lens */}
          <Ellipse 
            cx="78" 
            cy="82" 
            rx="14" 
            ry="12" 
            fill="none" 
            stroke={color} 
            strokeWidth="2.5" 
          />
          <Ellipse 
            cx="78" 
            cy="82" 
            rx="12" 
            ry="10" 
            fill="#FFFFFF" 
            opacity={0.15} 
          />
          {/* Right lens */}
          <Ellipse 
            cx="122" 
            cy="82" 
            rx="14" 
            ry="12" 
            fill="none" 
            stroke={color} 
            strokeWidth="2.5" 
          />
          <Ellipse 
            cx="122" 
            cy="82" 
            rx="12" 
            ry="10" 
            fill="#FFFFFF" 
            opacity={0.15} 
          />
          {/* Bridge */}
          <Path 
            d="M 92 82 L 108 82" 
            stroke={color} 
            strokeWidth="2.5" 
          />
          {/* Temples */}
          <Path 
            d="M 64 82 L 55 85" 
            stroke={color} 
            strokeWidth="2" 
          />
          <Path 
            d="M 136 82 L 145 85" 
            stroke={color} 
            strokeWidth="2" 
          />
        </G>
      );
    case 'necklace':
      return (
        <G key={`accessory-${index}`}>
          {/* Chain */}
          <Path 
            d="M 75 128 Q 100 132 125 128" 
            stroke={color} 
            strokeWidth="2.5" 
            fill="none" 
          />
          {/* Pendant */}
          <Circle cx="100" cy="133" r="5" fill={color} />
          <Circle cx="100" cy="133" r="3" fill={highlightColor} opacity={0.7} />
        </G>
      );
    case 'hat':
      return (
        <G key={`accessory-${index}`}>
          {/* Brim */}
          <Ellipse cx="100" cy="35" rx="52" ry="12" fill={color} />
          <Ellipse cx="100" cy="33" rx="48" ry="10" fill={highlightColor} opacity={0.2} />
          {/* Crown */}
          <Path 
            d="M 60 35 L 65 18 Q 100 15 135 18 L 140 35 Z"
            fill={color}
          />
          <Ellipse cx="100" cy="20" rx="30" ry="8" fill={highlightColor} opacity={0.15} />
        </G>
      );
    case 'scarf':
      return (
        <G key={`accessory-${index}`}>
          {/* Main scarf wrap */}
          <Path 
            d="M 70 120 Q 100 125 130 120" 
            stroke={color} 
            strokeWidth="10" 
            strokeLinecap="round"
          />
          <Path 
            d="M 70 120 Q 100 125 130 120" 
            stroke={highlightColor} 
            strokeWidth="8" 
            strokeLinecap="round"
            opacity={0.4}
          />
          {/* Hanging end */}
          <Path 
            d="M 130 120 L 138 145" 
            stroke={color} 
            strokeWidth="7" 
            strokeLinecap="round"
          />
          <Path 
            d="M 130 120 L 138 145" 
            stroke={highlightColor} 
            strokeWidth="5" 
            strokeLinecap="round"
            opacity={0.3}
          />
        </G>
      );
    default:
      return null;
  }
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
});

export default AvatarRenderer;
