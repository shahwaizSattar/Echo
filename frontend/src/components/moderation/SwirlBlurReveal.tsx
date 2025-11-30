import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Canvas, Circle, Group, Paint, Blur } from '@shopify/react-native-skia';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface SwirlBlurRevealProps {
  children: React.ReactNode;
  severity: 'BLUR' | 'WARNING';
  reason?: string;
  onReveal?: () => void;
}

const SwirlBlurReveal: React.FC<SwirlBlurRevealProps> = ({
  children,
  severity,
  reason,
  onReveal,
}) => {
  const [revealed, setRevealed] = React.useState(false);
  const [particles, setParticles] = React.useState<Particle[]>([]);
  
  // Animation values
  const blurIntensity = useSharedValue(severity === 'WARNING' ? 15 : 10);
  const swirlStrength = useSharedValue(1);
  const particleAnimation = useSharedValue(0);
  const revealProgress = useSharedValue(0);

  // Initialize particles
  useEffect(() => {
    const particleCount = 30;
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 2,
        opacity: Math.random() * 0.6 + 0.3,
      });
    }
    
    setParticles(newParticles);

    // Start particle drift animation
    particleAnimation.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const handleReveal = () => {
    if (revealed) return;
    
    setRevealed(true);
    
    // Animate reveal
    revealProgress.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    
    blurIntensity.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
    
    swirlStrength.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.back(1.5)),
    });

    if (onReveal) {
      setTimeout(() => runOnJS(onReveal)(), 800);
    }
  };

  // Animated styles for blur container
  const blurContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(revealProgress.value, [0, 1], [1, 0]),
    };
  });

  // Animated styles for content
  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(revealProgress.value, [0, 0.5, 1], [0.3, 0.6, 1]),
      transform: [
        {
          scale: interpolate(revealProgress.value, [0, 1], [0.98, 1]),
        },
      ],
    };
  });

  // Render particles
  const renderParticles = () => {
    return particles.map((particle) => {
      const animatedX = interpolate(
        particleAnimation.value,
        [0, 1],
        [particle.x, particle.x + particle.vx * 10]
      );
      
      const animatedY = interpolate(
        particleAnimation.value,
        [0, 1],
        [particle.y, particle.y + particle.vy * 10]
      );

      const scatterX = interpolate(
        revealProgress.value,
        [0, 1],
        [0, (particle.x - 50) * 2]
      );
      
      const scatterY = interpolate(
        revealProgress.value,
        [0, 1],
        [0, (particle.y - 50) * 2]
      );

      return (
        <Circle
          key={particle.id}
          cx={animatedX + scatterX}
          cy={animatedY + scatterY}
          r={particle.size}
          opacity={particle.opacity * (1 - revealProgress.value)}
          color={severity === 'WARNING' ? '#FF6B6B' : '#A0A0A0'}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Content with animated reveal */}
      <Animated.View style={[styles.content, contentStyle]}>
        {children}
      </Animated.View>

      {/* Blur overlay */}
      {!revealed && (
        <Animated.View style={[styles.blurOverlay, blurContainerStyle]}>
          <BlurView
            intensity={blurIntensity.value}
            tint={severity === 'WARNING' ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          
          {/* Particle canvas */}
          <Canvas style={styles.particleCanvas}>
            <Group>
              <Paint>
                <Blur blur={2} />
              </Paint>
              {renderParticles()}
            </Group>
          </Canvas>

          {/* Tap to reveal overlay */}
          <Pressable
            style={styles.tapOverlay}
            onPress={handleReveal}
            onLongPress={handleReveal}
          >
            <View style={[
              styles.warningBadge,
              severity === 'WARNING' && styles.warningBadgeRed
            ]}>
              <Text style={styles.warningIcon}>
                {severity === 'WARNING' ? '⚠️' : '👁️'}
              </Text>
              <Text style={styles.warningText}>
                {severity === 'WARNING' ? 'Sensitive Content' : 'Tap to Reveal'}
              </Text>
              {reason && (
                <Text style={styles.reasonText}>{reason}</Text>
              )}
            </View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    width: '100%',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particleCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  warningBadge: {
    backgroundColor: 'rgba(160, 160, 160, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  warningBadgeRed: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
  },
  warningIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  reasonText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default SwirlBlurReveal;
