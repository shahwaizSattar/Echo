import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { locationAPI, postsAPI } from '../../services/api';
import LocationPostModal from '../../components/LocationPostModal';
import { Video, ResizeMode } from 'expo-av';
import { getFullMediaUrl, handleMediaError } from '../../utils/mediaUtils';

const { width, height } = Dimensions.get('window');

interface LocationPost {
  _id: string;
  content: { 
    text: string;
    media?: Array<{ url: string; type: 'image' | 'video'; filename: string; originalName: string; size: number }>;
  };
  distance: number;
  author: { username: string; avatar?: string };
  createdAt: string;
  category?: string;
  locationName?: string;
  rating?: number;
  poll?: {
    enabled: boolean;
    type: 'yesno' | 'emoji' | 'multi';
    question: string;
    options: Array<{
      text: string;
      emoji?: string;
      votes: string[];
      voteCount: number;
    }>;
    totalVotes: number;
    isAnonymous: boolean;
  };
}

const CityRadarScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [selectedRing, setSelectedRing] = useState<'inner' | 'mid' | 'outer' | null>(null);
  const [posts, setPosts] = useState<LocationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  
  // Animation values
  const radarPulse = useRef(new Animated.Value(0)).current;
  const innerRingAnim = useRef(new Animated.Value(1)).current;
  const midRingAnim = useRef(new Animated.Value(1)).current;
  const outerRingAnim = useRef(new Animated.Value(1)).current;
  const particleAnims = useRef(Array.from({ length: 20 }, () => new Animated.Value(0))).current;
  
  // Scroll-based collapse animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const radarHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [height * 0.4, 0],
    extrapolate: 'clamp',
  });
  const radarOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    requestLocationPermission();
    startRadarAnimation();
    startParticleAnimation();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Location access is required for City Radar',
        });
        return;
      }
      
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      // Get readable location name
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      
      if (reverseGeocode && reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const parts = [];
        if (place.name) parts.push(place.name);
        if (place.district) parts.push(place.district);
        if (place.city) parts.push(place.city);
        setLocationName(parts.join(', ') || 'Your Location');
      } else {
        setLocationName('Your Location');
      }
      
      loadNearbyPosts(currentLocation);
    } catch (error) {
      console.error('Location error:', error);
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Failed to get your location',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyPosts = async (loc: Location.LocationObject) => {
    try {
      const response = await locationAPI.getNearbyPosts(
        loc.coords.latitude,
        loc.coords.longitude,
        50, // 50km radius
        1,
        20
      );
      
      if (response.success && response.data) {
        console.log('📍 Loaded posts:', response.data.length);
        console.log('📍 First post:', JSON.stringify(response.data[0], null, 2));
        console.log('📍 First post locationName:', response.data[0]?.locationName);
        console.log('📍 First post rating:', response.data[0]?.rating);
        setPosts(response.data);
      } else {
        // Fallback to mock data if API fails
        const mockPosts: LocationPost[] = [
          {
            _id: '1',
            content: { text: 'Best biryani spot around here! 🍛' },
            distance: 0.8,
            author: { username: 'foodie_pk' },
            createdAt: new Date().toISOString(),
            category: 'food',
          },
          {
            _id: '2',
            content: { text: 'Traffic jam on main road, avoid!' },
            distance: 1.5,
            author: { username: 'commuter123' },
            createdAt: new Date().toISOString(),
            category: 'alert',
          },
          {
            _id: '3',
            content: { text: 'Amazing sunset view from this spot 🌅' },
            distance: 5.2,
            author: { username: 'photographer' },
            createdAt: new Date().toISOString(),
            category: 'lifestyle',
          },
        ];
        setPosts(mockPosts);
      }
    } catch (error) {
      console.error('Error loading nearby posts:', error);
      // Use mock data on error
      const mockPosts: LocationPost[] = [
        {
          _id: '1',
          content: { text: 'Best biryani spot around here! 🍛' },
          distance: 0.8,
          author: { username: 'foodie_pk' },
          createdAt: new Date().toISOString(),
          category: 'food',
        },
      ];
      setPosts(mockPosts);
    }
  };

  const startRadarAnimation = () => {
    // Continuous radar pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(radarPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(radarPulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Ring animations
    Animated.loop(
      Animated.timing(innerRingAnim, {
        toValue: 1.1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(midRingAnim, {
        toValue: 1.05,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(outerRingAnim, {
        toValue: 1.03,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startParticleAnimation = () => {
    particleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const handleRingPress = (ring: 'inner' | 'mid' | 'outer') => {
    setSelectedRing(ring === selectedRing ? null : ring);
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      // Add haptic feedback here if needed
    }
  };

  const getFilteredPosts = () => {
    if (!selectedRing) return posts;
    
    const ranges = {
      inner: [0, 2],
      mid: [2, 10],
      outer: [10, 50],
    };
    
    const [min, max] = ranges[selectedRing];
    return posts.filter(post => post.distance >= min && post.distance < max);
  };

  const getRingColor = (ring: 'inner' | 'mid' | 'outer') => {
    const colors = {
      inner: '#00D4AA',
      mid: '#A855F7',
      outer: '#FF6B35',
    };
    return colors[ring];
  };

  const handlePollVote = async (postId: string, optionIndex: number) => {
    try {
      const response = await postsAPI.voteOnPoll(postId, optionIndex);
      
      if (response.success && (response as any).poll) {
        const updatedPollData = (response as any).poll;
        const currentUserId = user?._id;
        
        // Update the post in the local state
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post._id === postId && post.poll) {
              // Merge the updated poll data with existing poll structure
              const updatedOptions = post.poll.options.map((option, idx) => {
                const updatedOption = updatedPollData.options[idx];
                return {
                  ...option,
                  voteCount: updatedOption?.voteCount || 0,
                  // Update votes array: add current user if they voted for this option
                  votes: updatedOption?.hasVoted && currentUserId
                    ? [...(option.votes || []).filter(id => id !== currentUserId), currentUserId]
                    : (option.votes || []).filter(id => currentUserId ? id !== currentUserId : true),
                };
              });
              
              return {
                ...post,
                poll: {
                  ...post.poll,
                  options: updatedOptions,
                  totalVotes: updatedPollData.totalVotes,
                },
              };
            }
            return post;
          })
        );
        
        Toast.show({
          type: 'success',
          text1: 'Vote Recorded! ✅',
          text2: 'Your vote has been counted',
        });
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to record vote',
      });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    radarContainer: {
      height: height * 0.4,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    radarCenterContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -16,
      marginTop: -16,
      zIndex: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radarCenter: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 15,
      elevation: 15,
      borderWidth: 3,
      borderColor: '#FFFFFF',
    },
    radarCenterIcon: {
      fontSize: 16,
    },
    radarCenterPulse: {
      position: 'absolute',
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
    },
    ringTouchable: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      zIndex: 5,
    },
    ring: {
      position: 'absolute',
      borderRadius: 1000,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ringLabel: {
      position: 'absolute',
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      overflow: 'hidden',
    },
    particle: {
      position: 'absolute',
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    ringButton: {
      flex: 1,
      marginHorizontal: 4,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: 'center',
    },
    ringButtonText: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    ringButtonRange: {
      fontSize: 10,
      marginTop: 2,
    },
    postsContainer: {
      flex: 1,
    },
    postCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      padding: theme.spacing.lg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    postAuthor: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    postDistance: {
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    postContent: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    postCategory: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    postLocationName: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontStyle: 'italic',
    },
    postMedia: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    postRating: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      gap: 6,
    },
    ratingStars: {
      fontSize: 18,
      letterSpacing: 2,
    },
    pollContainer: {
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    pollOption: {
      position: 'relative',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      overflow: 'hidden',
      minHeight: 48,
      justifyContent: 'center',
    },
    pollOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '15',
      borderWidth: 2.5,
    },
    pollOptionContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      zIndex: 2,
    },
    pollOptionText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      flex: 1,
    },
    pollOptionTextSelected: {
      fontWeight: '600',
      color: theme.colors.primary,
    },
    pollPercentage: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },
    pollPercentageSelected: {
      color: theme.colors.primary,
    },
    pollProgressBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary + '20',
      zIndex: 1,
      borderRadius: 10,
    },
    pollTotalVotes: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
      fontWeight: '500',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: theme.spacing.md,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      borderRadius: 28,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
      zIndex: 1000,
    },
    fabGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 28,
      gap: 8,
    },
    fabIcon: {
      fontSize: 20,
    },
    fabText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });

  const filteredPosts = getFilteredPosts();

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.surface }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌐 City Radar</Text>
          <Text style={styles.headerSubtitle}>
            {locationName || (location ? 'Scanning your area...' : 'Requesting location...')}
          </Text>
        </View>
      </SafeAreaView>

      {/* Radar Visualization - Collapsible */}
      <Animated.View style={{ height: radarHeight, opacity: radarOpacity, overflow: 'hidden' }}>
        <LinearGradient
          colors={[theme.colors.background, theme.colors.surface]}
          style={[styles.radarContainer, { height: height * 0.4 }]}
        >
        {/* Floating Particles */}
        {particleAnims.map((anim, index) => {
          const angle = (index / particleAnims.length) * Math.PI * 2;
          const radius = 80 + Math.random() * 40;
          const centerX = width / 2;
          const centerY = height * 0.2;
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: centerX + Math.cos(angle) * radius - 2,
                  top: centerY + Math.sin(angle) * radius - 2,
                  opacity: anim,
                  transform: [
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -20],
                      }),
                    },
                  ],
                },
              ]}
            />
          );
        })}

        {/* Center Dot (Your Location) - ALWAYS AT CENTER */}
        <View style={styles.radarCenterContainer}>
          <Animated.View
            style={[
              styles.radarCenterPulse,
              {
                transform: [
                  {
                    scale: radarPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2.5],
                    }),
                  },
                ],
                opacity: radarPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 0],
                }),
              },
            ]}
          />
          <View style={styles.radarCenter}>
            <Text style={styles.radarCenterIcon}>📍</Text>
          </View>
        </View>

        {/* Inner Ring (0-2 km) - Centered around YOU */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleRingPress('inner')}
          style={[styles.ringTouchable, { marginLeft: -50, marginTop: -50 }]}
        >
          <Animated.View
            style={[
              styles.ring,
              {
                width: 100,
                height: 100,
                borderColor: selectedRing === 'inner' ? getRingColor('inner') : getRingColor('inner') + '40',
                backgroundColor: selectedRing === 'inner' ? getRingColor('inner') + '10' : 'transparent',
                transform: [{ scale: innerRingAnim }],
              },
            ]}
          >
            <View style={[styles.ringLabel, { backgroundColor: getRingColor('inner') + '20', top: 5 }]}>
              <Text style={{ color: getRingColor('inner'), fontSize: 11, fontWeight: '600' }}>
                0-2 km
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Mid Ring (2-10 km) - Centered around YOU */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleRingPress('mid')}
          style={[styles.ringTouchable, { marginLeft: -90, marginTop: -90 }]}
        >
          <Animated.View
            style={[
              styles.ring,
              {
                width: 180,
                height: 180,
                borderColor: selectedRing === 'mid' ? getRingColor('mid') : getRingColor('mid') + '40',
                backgroundColor: selectedRing === 'mid' ? getRingColor('mid') + '10' : 'transparent',
                transform: [{ scale: midRingAnim }],
              },
            ]}
          >
            <View style={[styles.ringLabel, { backgroundColor: getRingColor('mid') + '20', top: 10 }]}>
              <Text style={{ color: getRingColor('mid'), fontSize: 11, fontWeight: '600' }}>
                2-10 km
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Outer Ring (10-50 km) - Centered around YOU */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleRingPress('outer')}
          style={[styles.ringTouchable, { marginLeft: -140, marginTop: -140 }]}
        >
          <Animated.View
            style={[
              styles.ring,
              {
                width: 280,
                height: 280,
                borderColor: selectedRing === 'outer' ? getRingColor('outer') : getRingColor('outer') + '40',
                backgroundColor: selectedRing === 'outer' ? getRingColor('outer') + '10' : 'transparent',
                transform: [{ scale: outerRingAnim }],
              },
            ]}
          >
            <View style={[styles.ringLabel, { backgroundColor: getRingColor('outer') + '20', top: 10 }]}>
              <Text style={{ color: getRingColor('outer'), fontSize: 11, fontWeight: '600' }}>
                10-50 km
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </LinearGradient>
      </Animated.View>

      {/* Ring Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.ringButton,
            {
              borderColor: selectedRing === 'inner' ? getRingColor('inner') : theme.colors.border,
              backgroundColor: selectedRing === 'inner' ? getRingColor('inner') + '10' : 'transparent',
            },
          ]}
          onPress={() => handleRingPress('inner')}
        >
          <Text style={{ fontSize: 20 }}>🔵</Text>
          <Text style={[styles.ringButtonText, { color: getRingColor('inner') }]}>Ultra-Local</Text>
          <Text style={[styles.ringButtonRange, { color: theme.colors.textSecondary }]}>0-2 km</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.ringButton,
            {
              borderColor: selectedRing === 'mid' ? getRingColor('mid') : theme.colors.border,
              backgroundColor: selectedRing === 'mid' ? getRingColor('mid') + '10' : 'transparent',
            },
          ]}
          onPress={() => handleRingPress('mid')}
        >
          <Text style={{ fontSize: 20 }}>🟣</Text>
          <Text style={[styles.ringButtonText, { color: getRingColor('mid') }]}>Nearby</Text>
          <Text style={[styles.ringButtonRange, { color: theme.colors.textSecondary }]}>2-10 km</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.ringButton,
            {
              borderColor: selectedRing === 'outer' ? getRingColor('outer') : theme.colors.border,
              backgroundColor: selectedRing === 'outer' ? getRingColor('outer') + '10' : 'transparent',
            },
          ]}
          onPress={() => handleRingPress('outer')}
        >
          <Text style={{ fontSize: 20 }}>🟠</Text>
          <Text style={[styles.ringButtonText, { color: getRingColor('outer') }]}>City-Wide</Text>
          <Text style={[styles.ringButtonRange, { color: theme.colors.textSecondary }]}>10-50 km</Text>
        </TouchableOpacity>
      </View>

      {/* Posts Feed */}
      <Animated.ScrollView 
        style={styles.postsContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <View key={post._id} style={styles.postCard}>
              {/* Media Display - Outside at top */}
              {post.content.media && post.content.media.length > 0 && (
                <TouchableOpacity
                  onPress={() => (navigation as any).navigate('PostDetail', { postId: post._id })}
                  activeOpacity={0.9}
                  style={{ marginBottom: theme.spacing.md }}
                >
                  {post.content.media[0].type === 'image' ? (
                    <Image
                      source={{ uri: getFullMediaUrl(post.content.media[0].url) }}
                      style={[styles.postMedia, { marginTop: 0, marginBottom: 0 }]}
                      onError={(error) => handleMediaError(error, 'image', post.content.media[0].url)}
                    />
                  ) : (
                    <Video
                      source={{ uri: getFullMediaUrl(post.content.media[0].url) }}
                      style={[styles.postMedia, { marginTop: 0, marginBottom: 0 }]}
                      useNativeControls
                      onError={(error) => handleMediaError(error, 'video', post.content.media[0].url)}
                      resizeMode={ResizeMode.CONTAIN}
                    />
                  )}
                </TouchableOpacity>
              )}

              <View style={styles.postHeader}>
                <Text style={styles.postAuthor}>@{post.author.username}</Text>
                <View
                  style={[
                    styles.postDistance,
                    {
                      backgroundColor:
                        post.distance < 2
                          ? getRingColor('inner') + '20'
                          : post.distance < 10
                          ? getRingColor('mid') + '20'
                          : getRingColor('outer') + '20',
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        post.distance < 2
                          ? getRingColor('inner')
                          : post.distance < 10
                          ? getRingColor('mid')
                          : getRingColor('outer'),
                      fontWeight: '600',
                    }}
                  >
                    📍 {post.distance.toFixed(1)} km
                  </Text>
                </View>
              </View>
              
              {/* Rating Display - Show prominently for reviews */}
              {post.rating && post.rating > 0 && (
                <View style={styles.postRating}>
                  <Text style={styles.ratingStars}>
                    {'⭐'.repeat(post.rating)}{'☆'.repeat(5 - post.rating)}
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
                    {post.rating}.0/5.0
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => (navigation as any).navigate('PostDetail', { postId: post._id })}
                activeOpacity={0.7}
              >
                <Text style={styles.postContent}>{post.content.text}</Text>
              </TouchableOpacity>

              {/* Poll Display - Always shows results */}
              {post.poll?.enabled && (
                <View style={styles.pollContainer}>
                  {post.poll.options.map((option: any, index: number) => {
                    // Calculate percentage - always show even if 0 votes
                    const percentage = post.poll!.totalVotes > 0 
                      ? Math.round((option.voteCount / post.poll!.totalVotes) * 100) 
                      : 0;
                    
                    // Check if current user voted for this option
                    const hasVoted = user?._id && option.votes?.includes(user._id);
                    
                    // Check if user has voted on any option in this poll
                    const userHasVotedOnPoll = user?._id && post.poll!.options.some(
                      (opt: any) => opt.votes?.includes(user._id)
                    );
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.pollOption,
                          hasVoted && styles.pollOptionSelected,
                        ]}
                        onPress={() => handlePollVote(post._id, index)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.pollOptionContent}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            {hasVoted && <Text style={{ marginRight: 6, fontSize: 16 }}>✓</Text>}
                            <Text style={[
                              styles.pollOptionText,
                              hasVoted && styles.pollOptionTextSelected,
                            ]}>
                              {option.text}
                            </Text>
                          </View>
                          <Text style={[
                            styles.pollPercentage,
                            hasVoted && styles.pollPercentageSelected,
                          ]}>
                            {percentage}%
                          </Text>
                        </View>
                        {/* Progress bar - always visible */}
                        <View style={[
                          styles.pollProgressBar,
                          { 
                            width: `${percentage}%`,
                            minWidth: percentage > 0 ? '2%' : '0%', // Show at least a small bar if there are votes
                          },
                        ]} />
                      </TouchableOpacity>
                    );
                  })}
                  <Text style={styles.pollTotalVotes}>
                    {post.poll.totalVotes} {post.poll.totalVotes === 1 ? 'response' : 'responses'}
                  </Text>
                </View>
              )}

              {post.category && (
                <Text style={styles.postCategory}>#{post.category}</Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>
              {selectedRing ? 'No posts in this range' : 'No nearby posts'}
            </Text>
            <Text style={styles.emptyText}>
              {selectedRing
                ? 'Try selecting a different range or be the first to post here!'
                : 'Be the first to share something in your area!'}
            </Text>
          </View>
        )}
      </Animated.ScrollView>

      {/* Floating Action Button - Create Location Post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowPostModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary || theme.colors.primary]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.fabIcon}>📍</Text>
          <Text style={styles.fabText}>Post Here</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Location Post Modal */}
      <LocationPostModal
        visible={showPostModal}
        onClose={() => setShowPostModal(false)}
        location={location ? { latitude: location.coords.latitude, longitude: location.coords.longitude } : null}
        onSubmit={async (postData) => {
          try {
            // Build post payload
            const payload: any = {
              content: { text: postData.content },
              category: postData.category,
              geoLocation: {
                type: 'Point',
                coordinates: [postData.location.longitude, postData.location.latitude],
              },
              locationEnabled: true,
              vanishMode: postData.duration !== 'permanent' ? {
                enabled: true,
                duration: postData.duration === '1h' ? '1hour' : 
                         postData.duration === '3h' ? '6hours' :
                         postData.duration === '6h' ? '6hours' :
                         postData.duration === '12h' ? '12hours' :
                         postData.duration === '24h' ? '1day' : '1day',
              } : undefined,
            };

            // Add poll data if it's a poll post
            if (postData.type === 'poll' && postData.pollOptions && postData.pollOptions.length >= 2) {
              payload.poll = {
                enabled: true,
                type: 'multi',
                question: postData.content,
                options: postData.pollOptions.map((text: string) => ({
                  text,
                  votes: [],
                  voteCount: 0,
                })),
                totalVotes: 0,
                isAnonymous: true,
              };
            }
            
            // Add rating if it's a review post
            if (postData.type === 'rating' && postData.rating) {
              payload.rating = postData.rating;
            }

            // Add media if provided (for now, just store the URI - in production you'd upload to server first)
            if (postData.mediaUri && postData.mediaType) {
              // In a real app, you would upload the media file to your server first
              // and get back a URL. For now, we'll just include it in the content
              payload.content.media = [{
                url: postData.mediaUri, // In production, this would be the uploaded URL
                type: postData.mediaType,
                filename: `location_${Date.now()}.${postData.mediaUri.split('.').pop()}`,
                originalName: `location_media.${postData.mediaUri.split('.').pop()}`,
                size: 0,
              }];
              console.log('📸 Adding media to post:', payload.content.media[0]);
            }

            console.log('📤 Sending post payload:', JSON.stringify(payload, null, 2));

            // Create post with location
            const response = await postsAPI.createPost(payload);

            if (response.success) {
              Toast.show({
                type: 'success',
                text1: 'Posted! 🎉',
                text2: 'Your post is now visible in the area',
              });
              // Reload posts
              if (location) {
                loadNearbyPosts(location);
              }
            }
          } catch (error) {
            console.error('Error creating location post:', error);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to create post',
            });
          }
        }}
      />
    </View>
  );
};

export default CityRadarScreen;
