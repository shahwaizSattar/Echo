import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, G, Rect, Ellipse } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface AuthBackgroundProps {
  variant: 'login' | 'signup';
}

const AuthBackground: React.FC<AuthBackgroundProps> = ({ variant }) => {
  // Floating animation
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);

  React.useEffect(() => {
    float1.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    float2.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    float3.value = withRepeat(
      withSequence(
        withTiming(12, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: float1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: float2.value }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: float3.value }],
  }));

  return (
    <View style={styles.container}>
      {variant === 'login' ? (
        <>
          {/* Login Background: Avatars chatting and connecting */}
          <Animated.View style={[styles.avatarGroup, styles.topLeft, animatedStyle1]}>
            <Svg width="120" height="120" viewBox="0 0 120 120">
              <G opacity="0.3">
                {/* Avatar 1 with mask */}
                <Circle cx="40" cy="40" r="25" fill="#8B5CF6" />
                <Circle cx="40" cy="35" r="8" fill="#1F2937" />
                <Path d="M 25 50 Q 40 55 55 50" stroke="#1F2937" strokeWidth="3" fill="none" />
                {/* Chat bubble */}
                <Ellipse cx="80" cy="30" rx="20" ry="15" fill="#6366F1" opacity="0.6" />
                <Circle cx="75" cy="30" r="2" fill="white" />
                <Circle cx="80" cy="30" r="2" fill="white" />
                <Circle cx="85" cy="30" r="2" fill="white" />
              </G>
            </Svg>
          </Animated.View>

          <Animated.View style={[styles.avatarGroup, styles.topRight, animatedStyle2]}>
            <Svg width="140" height="140" viewBox="0 0 140 140">
              <G opacity="0.25">
                {/* Avatar 2 with mask */}
                <Circle cx="70" cy="50" r="28" fill="#EC4899" />
                <Circle cx="70" cy="45" r="9" fill="#1F2937" />
                <Path d="M 52 60 Q 70 68 88 60" stroke="#1F2937" strokeWidth="3" fill="none" />
                {/* Connection line */}
                <Path d="M 30 80 Q 50 70 70 80" stroke="#6366F1" strokeWidth="2" strokeDasharray="5,5" fill="none" opacity="0.5" />
              </G>
            </Svg>
          </Animated.View>

          <Animated.View style={[styles.avatarGroup, styles.bottomLeft, animatedStyle3]}>
            <Svg width="100" height="100" viewBox="0 0 100 100">
              <G opacity="0.2">
                {/* Avatar 3 with mask */}
                <Circle cx="50" cy="50" r="22" fill="#10B981" />
                <Circle cx="50" cy="46" r="7" fill="#1F2937" />
                <Path d="M 36 58 Q 50 63 64 58" stroke="#1F2937" strokeWidth="2.5" fill="none" />
              </G>
            </Svg>
          </Animated.View>

          <Animated.View style={[styles.avatarGroup, styles.bottomRight, animatedStyle1]}>
            <Svg width="110" height="110" viewBox="0 0 110 110">
              <G opacity="0.28">
                {/* Avatar 4 with mask */}
                <Circle cx="55" cy="55" r="24" fill="#F59E0B" />
                <Circle cx="55" cy="50" r="8" fill="#1F2937" />
                <Path d="M 39 62 Q 55 68 71 62" stroke="#1F2937" strokeWidth="3" fill="none" />
                {/* Heart symbol */}
                <Path d="M 85 30 Q 85 20 75 20 Q 70 20 68 25 Q 66 20 61 20 Q 51 20 51 30 Q 51 40 68 50 Q 85 40 85 30" fill="#EF4444" opacity="0.5" />
              </G>
            </Svg>
          </Animated.View>
        </>
      ) : (
        <>
          {/* Signup Background: Avatars holding hands and welcoming */}
          <Animated.View style={[styles.avatarGroup, styles.topCenter, animatedStyle1]}>
            <Svg width="200" height="120" viewBox="0 0 200 120">
              <G opacity="0.3">
                {/* Two avatars holding hands */}
                <Circle cx="60" cy="50" r="26" fill="#8B5CF6" />
                <Circle cx="60" cy="45" r="8" fill="#1F2937" />
                <Path d="M 43 60 Q 60 66 77 60" stroke="#1F2937" strokeWidth="3" fill="none" />
                
                <Circle cx="140" cy="50" r="26" fill="#EC4899" />
                <Circle cx="140" cy="45" r="8" fill="#1F2937" />
                <Path d="M 123 60 Q 140 66 157 60" stroke="#1F2937" strokeWidth="3" fill="none" />
                
                {/* Holding hands */}
                <Path d="M 86 70 L 95 75 L 105 75 L 114 70" stroke="#6366F1" strokeWidth="4" fill="none" strokeLinecap="round" />
                <Circle cx="95" cy="75" r="4" fill="#6366F1" />
                <Circle cx="105" cy="75" r="4" fill="#EC4899" />
              </G>
            </Svg>
          </Animated.View>

          <Animated.View style={[styles.avatarGroup, styles.middleLeft, animatedStyle2]}>
            <Svg width="130" height="130" viewBox="0 0 130 130">
              <G opacity="0.25">
                {/* Avatar with welcoming gesture */}
                <Circle cx="65" cy="60" r="28" fill="#10B981" />
                <Circle cx="65" cy="54" r="9" fill="#1F2937" />
                <Path d="M 47 70 Q 65 77 83 70" stroke="#1F2937" strokeWidth="3" fill="none" />
                {/* Waving hand */}
                <Path d="M 95 50 Q 105 45 110 50" stroke="#10B981" strokeWidth="3" fill="none" strokeLinecap="round" />
                <Circle cx="110" cy="50" r="5" fill="#10B981" />
              </G>
            </Svg>
          </Animated.View>

          <Animated.View style={[styles.avatarGroup, styles.middleRight, animatedStyle3]}>
            <Svg width="120" height="120" viewBox="0 0 120 120">
              <G opacity="0.27">
                {/* Avatar with mask */}
                <Circle cx="60" cy="60" r="26" fill="#F59E0B" />
                <Circle cx="60" cy="55" r="8" fill="#1F2937" />
                <Path d="M 43 68 Q 60 74 77 68" stroke="#1F2937" strokeWidth="3" fill="none" />
                {/* Star decoration */}
                <Path d="M 95 30 L 98 38 L 106 38 L 100 43 L 102 51 L 95 46 L 88 51 L 90 43 L 84 38 L 92 38 Z" fill="#FBBF24" opacity="0.6" />
              </G>
            </Svg>
          </Animated.View>

          <Animated.View style={[styles.avatarGroup, styles.bottomCenter, animatedStyle1]}>
            <Svg width="180" height="100" viewBox="0 0 180 100">
              <G opacity="0.22">
                {/* Group of three avatars */}
                <Circle cx="50" cy="50" r="22" fill="#6366F1" />
                <Circle cx="50" cy="46" r="7" fill="#1F2937" />
                <Path d="M 36 56 Q 50 61 64 56" stroke="#1F2937" strokeWidth="2.5" fill="none" />
                
                <Circle cx="90" cy="50" r="22" fill="#8B5CF6" />
                <Circle cx="90" cy="46" r="7" fill="#1F2937" />
                <Path d="M 76 56 Q 90 61 104 56" stroke="#1F2937" strokeWidth="2.5" fill="none" />
                
                <Circle cx="130" cy="50" r="22" fill="#EC4899" />
                <Circle cx="130" cy="46" r="7" fill="#1F2937" />
                <Path d="M 116 56 Q 130 61 144 56" stroke="#1F2937" strokeWidth="2.5" fill="none" />
              </G>
            </Svg>
          </Animated.View>
        </>
      )}

      {/* Decorative elements */}
      <View style={styles.decorativeElements}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <G opacity="0.1">
            <Circle cx={width * 0.1} cy={height * 0.3} r="3" fill="#8B5CF6" />
            <Circle cx={width * 0.9} cy={height * 0.6} r="4" fill="#EC4899" />
            <Circle cx={width * 0.2} cy={height * 0.8} r="2.5" fill="#10B981" />
            <Circle cx={width * 0.85} cy={height * 0.2} r="3.5" fill="#F59E0B" />
            <Circle cx={width * 0.5} cy={height * 0.15} r="2" fill="#6366F1" />
          </G>
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  avatarGroup: {
    position: 'absolute',
  },
  topLeft: {
    top: height * 0.1,
    left: width * 0.05,
  },
  topRight: {
    top: height * 0.08,
    right: width * 0.02,
  },
  topCenter: {
    top: height * 0.08,
    left: width * 0.5 - 100,
  },
  middleLeft: {
    top: height * 0.4,
    left: -20,
  },
  middleRight: {
    top: height * 0.45,
    right: -10,
  },
  bottomLeft: {
    bottom: height * 0.15,
    left: width * 0.08,
  },
  bottomRight: {
    bottom: height * 0.12,
    right: width * 0.05,
  },
  bottomCenter: {
    bottom: height * 0.1,
    left: width * 0.5 - 90,
  },
  decorativeElements: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default AuthBackground;
