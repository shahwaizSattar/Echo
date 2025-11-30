import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { WhisperTheme } from '../../utils/whisperThemes';
import VanishTimer from './VanishTimer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WhisperBubbleProps {
  whisper: any;
  index: number;
  theme: WhisperTheme;
  onPress: () => void;
  onVanish?: () => void;
  shouldVanish?: boolean;
  onMenuPress?: () => void;
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

const WhisperBubble: React.FC<WhisperBubbleProps> = ({ whisper, index, theme, onPress, onVanish, shouldVanish, onMenuPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Peel-off animation values
  const peelAnim = useRef(new Animated.Value(0)).current;
  const flyAwayY = useRef(new Animated.Value(0)).current;
  const flyAwayOpacity = useRef(new Animated.Value(1)).current;
  const [isVanishing, setIsVanishing] = React.useState(false);

  useEffect(() => {
    // Faster entry animation with reduced delay
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        delay: Math.min(index * 30, 300), // Max 300ms delay
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200, // Reduced from 400ms
        delay: Math.min(index * 30, 300),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Trigger vanish animation when shouldVanish becomes true
  useEffect(() => {
    if (shouldVanish && !isVanishing) {
      startPeelOffAnimation();
    }
  }, [shouldVanish]);

  const startPeelOffAnimation = () => {
    setIsVanishing(true);
    
    // Step 1: Curl the top-right corner
    // Step 2: Peel diagonally
    // Step 3: Fade out and fly upward
    Animated.sequence([
      // Curl corner (300ms)
      Animated.timing(peelAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Peel and fly away (600ms)
      Animated.parallel([
        Animated.timing(flyAwayY, {
          toValue: -500,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(flyAwayOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Animation complete, notify parent to remove from list
      if (onVanish) {
        onVanish();
      }
    });
  };

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
    menuButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    oneTimeBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: 'rgba(255, 215, 0, 0.9)',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    oneTimeBadgeText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#2c2c2c',
    },
    curledCorner: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 40,
      height: 40,
      backgroundColor: stickyColor,
      borderTopRightRadius: 2,
      shadowColor: '#000',
      shadowOffset: { width: -2, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 8,
    },
    blurOverlay: {
      position: 'absolute',
      top: 8,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 2,
      overflow: 'hidden',
    },
    blurView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    webBlur: {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(10px)',
    },
    revealPrompt: {
      alignItems: 'center',
      padding: 16,
    },
    revealIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    revealText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#2c2c2c',
      marginBottom: 4,
    },
    revealSubtext: {
      fontSize: 11,
      color: '#666',
      fontStyle: 'italic',
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

  // Calculate peel transform
  const peelRotate = peelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  const peelScale = peelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

  const flyRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['15deg', '45deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { scale: isVanishing ? peelScale : scaleAnim },
          { translateY: flyAwayY },
          { rotate: isVanishing ? flyRotate : '0deg' },
          { perspective: 1000 },
        ],
        opacity: isVanishing ? flyAwayOpacity : opacityAnim,
      }}
    >
      <TouchableOpacity
        style={styles.stickyNote}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {/* Torn edge effect */}
        <View style={styles.tornEdge} />
        
        {/* One-time badge */}
        {whisper.oneTime?.enabled && (
          <View style={styles.oneTimeBadge}>
            <Text style={styles.oneTimeBadgeText}>✨ ONE-TIME</Text>
          </View>
        )}
        
        {/* Animation badge */}
        {whisper.backgroundAnimation && whisper.backgroundAnimation !== 'none' && (
          <Text style={styles.animationBadge}>
            {getAnimationEmoji(whisper.backgroundAnimation)}
          </Text>
        )}
        
        {/* Menu button (only shown when onMenuPress is provided) */}
        {onMenuPress && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={(e) => {
              e.stopPropagation();
              onMenuPress();
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#fff', marginBottom: 2 }} />
              <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#fff', marginBottom: 2 }} />
              <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#fff' }} />
            </View>
          </TouchableOpacity>
        )}
        
        <View style={styles.stickyContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.categoryEmoji}>
              {getCategoryEmoji(whisper.category)}
            </Text>
            {whisper.vanishMode?.enabled && whisper.vanishMode?.vanishAt && (
              <VanishTimer 
                vanishAt={whisper.vanishMode.vanishAt} 
                textColor="#2c2c2c"
                onExpire={startPeelOffAnimation}
              />
            )}
          </View>
          
          {whisper.content?.text && (
            <Text style={styles.whisperText} numberOfLines={6}>
              {whisper.content.text}
            </Text>
          )}
          
          {hasImage && (
            <Image
              source={{ 
                uri: whisper.content.media[0].url,
                cache: 'force-cache',
              }}
              style={styles.stickyImage}
              resizeMode="cover"
              loadingIndicatorSource={require('../../../assets/icon.png')}
              fadeDuration={100}
            />
          )}
        </View>
        
        {/* Blur overlay for one-time posts */}
        {whisper.oneTime?.enabled && (
          <View style={styles.blurOverlay}>
            {Platform.OS === 'ios' || Platform.OS === 'android' ? (
              <BlurView intensity={80} style={styles.blurView}>
                <View style={styles.revealPrompt}>
                  <Text style={styles.revealIcon}>👁️</Text>
                  <Text style={styles.revealText}>One-Time Post</Text>
                  <Text style={styles.revealSubtext}>Tap to Reveal</Text>
                </View>
              </BlurView>
            ) : (
              <View style={[styles.blurView, styles.webBlur]}>
                <View style={styles.revealPrompt}>
                  <Text style={styles.revealIcon}>👁️</Text>
                  <Text style={styles.revealText}>One-Time Post</Text>
                  <Text style={styles.revealSubtext}>Tap to Reveal</Text>
                </View>
              </View>
            )}
          </View>
        )}
        
        {whisper.reactions?.total > 0 && (
          <View style={styles.reactionBadge}>
            <Text style={styles.reactionCount}>
              {whisper.reactions.total}
            </Text>
          </View>
        )}
        
        {/* Curled corner effect when peeling */}
        {isVanishing && (
          <Animated.View
            style={[
              styles.curledCorner,
              {
                opacity: peelAnim,
                transform: [
                  { 
                    rotateZ: peelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '-30deg'],
                    })
                  },
                ],
              },
            ]}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default WhisperBubble;
