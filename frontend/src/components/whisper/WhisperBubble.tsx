import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { WhisperTheme } from '../../utils/whisperThemes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WhisperBubbleProps {
  whisper: any;
  index: number;
  theme: WhisperTheme;
  onPress: () => void;
}

// Sticky note colors mapped to categories
const CATEGORY_COLORS: { [key: string]: string } = {
  Random: '#FFE5B4',    // Peach
  Vent: '#FF6B6B',      // Red (for venting frustration)
  Confession: '#E0BBE4', // Lavender (mysterious)
  Advice: '#FFD93D',    // Yellow (bright idea)
  Gaming: '#6BCF7F',    // Green (gaming theme)
  Love: '#FFD1DC',      // Pink (romantic)
  Technology: '#74C0FC', // Blue (tech)
  Music: '#DDA0DD',     // Plum (creative)
};

// Handwriting-style font variations (using transform for variety)
const HANDWRITING_STYLES = [
  { fontStyle: 'italic' as const, letterSpacing: 0.5 },
  { fontStyle: 'normal' as const, letterSpacing: 1 },
  { fontStyle: 'italic' as const, letterSpacing: 0.8 },
];

const WhisperBubble: React.FC<WhisperBubbleProps> = ({ whisper, index, theme, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      Random: '🎲',
      Vent: '😤',
      Confession: '🤫',
      Advice: '💡',
      Gaming: '🎮',
      Love: '❤️',
      Technology: '💻',
      Music: '🎵',
    };
    return emojiMap[category] || '💭';
  };

  // Get color based on category, fallback to Random color
  const stickyColor = CATEGORY_COLORS[whisper.category] || CATEGORY_COLORS.Random;
  const handwritingStyle = HANDWRITING_STYLES[index % HANDWRITING_STYLES.length];
  const hasImage = whisper.content?.media && whisper.content.media.length > 0;

  // Random positioning with slight rotation
  const rotation = (Math.random() - 0.5) * 8; // -4 to +4 degrees
  const leftPosition = (index % 2) * (SCREEN_WIDTH / 2 - 20) + 10;
  const topPosition = Math.floor(index / 2) * 200 + 10;

  const styles = StyleSheet.create({
    stickyNote: {
      position: 'absolute',
      left: leftPosition,
      top: topPosition,
      width: SCREEN_WIDTH / 2 - 30,
      minHeight: 180,
      backgroundColor: stickyColor,
      padding: 16,
      borderRadius: 2,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
      transform: [{ rotate: `${rotation}deg` }],
    },
    tornEdge: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 8,
      backgroundColor: stickyColor,
      opacity: 0.6,
    },
    stickyContent: {
      marginTop: 8,
    },
    categoryEmoji: {
      fontSize: 20,
      marginBottom: 8,
    },
    whisperText: {
      fontSize: 14,
      color: '#2c2c2c',
      lineHeight: 20,
      ...handwritingStyle,
    },
    stickyImage: {
      width: '100%',
      height: 120,
      borderRadius: 4,
      marginTop: 8,
    },
    reactionBadge: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 28,
      alignItems: 'center',
    },
    reactionCount: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#fff',
    },
    animationBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      fontSize: 16,
    },
  });

  const getAnimationEmoji = (animation: string) => {
    const emojiMap: { [key: string]: string } = {
      rain: '🌧️',
      neon: '⚡',
      fire: '🔥',
      snow: '❄️',
      hearts: '💕',
      mist: '🌫️',
    };
    return emojiMap[animation] || '';
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <TouchableOpacity
        style={styles.stickyNote}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {/* Torn edge effect */}
        <View style={styles.tornEdge} />
        
        {/* Animation badge */}
        {whisper.backgroundAnimation && whisper.backgroundAnimation !== 'none' && (
          <Text style={styles.animationBadge}>
            {getAnimationEmoji(whisper.backgroundAnimation)}
          </Text>
        )}
        
        <View style={styles.stickyContent}>
          <Text style={styles.categoryEmoji}>
            {getCategoryEmoji(whisper.category)}
          </Text>
          
          {whisper.content?.text && (
            <Text style={styles.whisperText} numberOfLines={6}>
              {whisper.content.text}
            </Text>
          )}
          
          {hasImage && (
            <Image
              source={{ uri: whisper.content.media[0].url }}
              style={styles.stickyImage}
              resizeMode="cover"
            />
          )}
        </View>
        
        {whisper.reactions?.total > 0 && (
          <View style={styles.reactionBadge}>
            <Text style={styles.reactionCount}>
              {whisper.reactions.total}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default WhisperBubble;
