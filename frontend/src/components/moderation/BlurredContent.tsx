import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface BlurredContentProps {
  children: React.ReactNode;
  severity: 'BLUR' | 'WARNING';
  reason?: string;
  onReveal?: () => void;
}

interface TextParticle {
  id: number;
  char: string;
  offsetX: number;
  offsetY: number;
  delay: number;
  size: number;
}

// Component for individual particle - OPTIMIZED
const ParticleChar: React.FC<{
  particle: TextParticle;
  revealed: boolean;
  color?: string;
}> = React.memo(({ particle, revealed, color = '#999' }) => {
  const wiggleX = useSharedValue(0);
  const wiggleY = useSharedValue(0);

  useEffect(() => {
    if (!revealed) {
      // Ultra-simplified wiggle - single direction, longer duration
      wiggleX.value = withRepeat(
        withTiming(particle.offsetX, { 
          duration: 1500 + particle.delay, 
          easing: Easing.inOut(Easing.ease) 
        }),
        -1,
        true
      );

      wiggleY.value = withRepeat(
        withTiming(particle.offsetY, { 
          duration: 1400 + particle.delay, 
          easing: Easing.inOut(Easing.ease) 
        }),
        -1,
        true
      );
    } else {
      wiggleX.value = withTiming(0, { duration: 200 });
      wiggleY.value = withTiming(0, { duration: 200 });
    }
  }, [revealed]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: wiggleX.value },
        { translateY: wiggleY.value },
      ],
    };
  });

  return (
    <Animated.Text style={[{ color, fontSize: particle.size }, animatedStyle]}>
      {particle.char}
    </Animated.Text>
  );
});

// Extract text from children recursively
const extractText = (children: React.ReactNode): string => {
  let text = '';
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string') {
      text += child;
    } else if (React.isValidElement(child)) {
      const childElement = child as React.ReactElement<any>;
      if (childElement.props?.children) {
        text += extractText(childElement.props.children);
      }
    }
  });
  return text;
};

const BlurredContent: React.FC<BlurredContentProps> = ({
  children,
  severity,
  reason,
  onReveal,
}) => {
  const [revealed, setRevealed] = React.useState(false);
  const { theme } = useTheme();

  // Determine particle color based on theme
  const particleColor = useMemo(() => {
    if (severity === 'WARNING') return '#FF6B6B';
    // Use lighter color for dark themes, darker for light themes
    return theme.dark ? '#CCC' : '#333';
  }, [severity, theme.dark]);

  // Extract text and create particles - HEAVILY OPTIMIZED: Only 2 particles per char
  const particles = useMemo(() => {
    const text = extractText(children);
    const particleArray: TextParticle[] = [];
    
    // Only 2 particles per character for maximum performance
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const particlesPerChar = char === ' ' ? 0 : 2; // 2 particles per char, 0 for spaces
      
      for (let j = 0; j < particlesPerChar; j++) {
        particleArray.push({
          id: i * 2 + j,
          char: '•',
          offsetX: (Math.random() - 0.5) * 4,
          offsetY: (Math.random() - 0.5) * 4,
          delay: Math.random() * 200,
          size: 7,
        });
      }
    }
    
    return particleArray;
  }, [children]);

  const handleReveal = () => {
    if (revealed) return;
    setRevealed(true);

    if (onReveal) {
      setTimeout(() => onReveal(), 300);
    }
  };

  return (
    <Pressable onPress={handleReveal} style={styles.container}>
      {revealed ? (
        <View style={styles.content}>{children}</View>
      ) : (
        <View style={styles.particleContainer}>
          {particles.map((particle) => (
            <ParticleChar
              key={particle.id}
              particle={particle}
              revealed={revealed}
              color={particleColor}
            />
          ))}
        </View>
      )}
      
      {!revealed && (
        <View style={styles.hintContainer}>
          <View style={styles.eyeContainer}>
            <Text style={styles.eyeIcon}>👁</Text>
          </View>
          <Text
            style={[
              styles.hintText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Tap to reveal, may include offensive language
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  content: {
    width: '100%',
  },
  particleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  hintContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  eyeContainer: {
    marginBottom: 4,
  },
  eyeIcon: {
    fontSize: 20,
    // Black and white eye - using grayscale filter effect
    opacity: 0.8,
  },
  hintText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  hintTextWarning: {
    color: '#FF6B6B',
  },
  reasonText: {
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default BlurredContent;
