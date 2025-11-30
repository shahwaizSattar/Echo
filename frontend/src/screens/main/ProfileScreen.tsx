import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
  Modal,
} from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { postsAPI, whisperWallAPI, userAPI } from '../../services/api';
import Toast from 'react-native-toast-message';
import { censorText } from '../../utils/censorUtils';
import AvatarRenderer from '../../components/avatar/AvatarRenderer';
import { DEFAULT_AVATAR_CONFIG } from '../../utils/avatarConfig';
import WhisperBubble from '../../components/whisper/WhisperBubble';
import WhisperDetailModal from '../../components/whisper/WhisperDetailModal';
import { getDailyTheme } from '../../utils/whisperThemes';
import WhisperPostOptions from '../../components/WhisperPostOptions';
import EditWhisperModal from '../../components/EditWhisperModal';

const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [whisperPosts, setWhisperPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [voiceNotePlaying, setVoiceNotePlaying] = useState<{ [key: string]: boolean }>({});
  const [voiceSounds, setVoiceSounds] = useState<{ [key: string]: Audio.Sound }>({});
  const [activeTab, setActiveTab] = useState<'home' | 'radar' | 'whisper'>('home');
  const [selectedWhisper, setSelectedWhisper] = useState<any>(null);
  const [whisperModalVisible, setWhisperModalVisible] = useState(false);
  const [whisperOptionsVisible, setWhisperOptionsVisible] = useState(false);
  const [selectedWhisperForMenu, setSelectedWhisperForMenu] = useState<any>(null);
  const [editWhisperModalVisible, setEditWhisperModalVisible] = useState(false);
  const [whisperToEdit, setWhisperToEdit] = useState<any>(null);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followingModalVisible, setFollowingModalVisible] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [mediaTab, setMediaTab] = useState<'photos' | 'videos'>('photos');

  const loadUserPosts = async () => {
    if (!user?.username) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response: any = await postsAPI.getUserPosts(user.username, 1, 50);
      const posts = response.posts || response.data || [];
      setUserPosts(posts);
    } catch (error: any) {
      console.log('Error loading user posts:', error);
      const message = error?.response?.data?.message || 'Failed to load your posts';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setLoading(false);
    }
  };

  const loadWhisperPosts = async () => {
    console.log('🔍 loadWhisperPosts called');
    console.log('🔍 user object:', user);
    console.log('🔍 user._id:', user?._id);
    console.log('🔍 user.id:', (user as any)?.id);
    
    const userId = user?._id || (user as any)?.id;
    console.log('🔍 Resolved userId:', userId);
    
    if (!userId) {
      console.log('❌ No user ID available for loading whispers');
      setWhisperPosts([]);
      return;
    }
    
    try {
      console.log('🔄 Loading whispers for user:', userId);
      const response: any = await whisperWallAPI.getUserWhispers(userId, 1, 50);
      console.log('📥 Response received:', response);
      const whispers = response.whispers || [];
      console.log('✅ Loaded', whispers.length, 'whispers');
      setWhisperPosts(whispers);
    } catch (error: any) {
      console.error('❌ Error loading whisper posts:', error);
      console.error('❌ Error details:', error.response?.data);
      setWhisperPosts([]);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadUserPosts(), loadWhisperPosts()]);
    setRefreshing(false);
  }, [user?.username, user?._id]);

  useEffect(() => {
    console.log('🔍 ProfileScreen useEffect triggered');
    console.log('🔍 user?.username:', user?.username);
    console.log('🔍 user?._id:', user?._id);
    if (user?._id || user?.username) {
      loadUserPosts();
      loadWhisperPosts();
    }
  }, [user?.username, user?._id]);

  // Refresh posts when screen comes into focus (e.g., after creating a post)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔍 ProfileScreen useFocusEffect triggered');
      if (user?._id || user?.username) {
        loadUserPosts();
        loadWhisperPosts();
      }
    }, [user?.username, user?._id])
  );

  // Debug: Log whisperPosts state changes
  useEffect(() => {
    console.log('🔍 Whispers state changed:', whisperPosts.length, 'whispers');
    console.log('🔍 Whispers:', whisperPosts);
    console.log('🔍 Active tab:', activeTab);
  }, [whisperPosts, activeTab]);

  const handleEditWhisper = (whisper: any) => {
    setWhisperToEdit(whisper);
    setEditWhisperModalVisible(true);
  };

  const handleDeleteWhisper = async (whisperId: string) => {
    try {
      await whisperWallAPI.deleteWhisper(whisperId);
      setWhisperPosts(prevWhispers => prevWhispers.filter(w => w._id !== whisperId));
      Toast.show({
        type: 'success',
        text1: 'Whisper deleted',
        text2: 'Your whisper has been removed',
      });
    } catch (error: any) {
      console.error('Failed to delete whisper:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to delete whisper',
      });
    }
  };

  const loadFollowers = async () => {
    try {
      const response: any = await userAPI.getFollowers(user?.username || '');
      setFollowers(response.followers || []);
    } catch (error) {
      console.error('Error loading followers:', error);
    }
  };

  const loadFollowing = async () => {
    try {
      const response: any = await userAPI.getFollowing(user?.username || '');
      setFollowing(response.following || []);
    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const getMediaPosts = () => {
    const allPosts = [...userPosts];
    const mediaPosts = allPosts.filter(post => {
      const media = post.content?.media || [];
      return media.length > 0;
    });
    
    if (mediaTab === 'photos') {
      return mediaPosts.filter(post => {
        const media = post.content?.media || [];
        return media.some((m: any) => m.type === 'image' || !m.mimetype?.startsWith('video/'));
      });
    } else {
      return mediaPosts.filter(post => {
        const media = post.content?.media || [];
        return media.some((m: any) => m.type === 'video' || m.mimetype?.startsWith('video/'));
      });
    }
  };

  const getVoiceEffectSettings = (effect?: string) => {
    switch (effect) {
      case 'deep':
        return { rate: 0.8, pitchCorrectionQuality: Audio.PitchCorrectionQuality.High };
      case 'soft':
        return { rate: 0.9, pitchCorrectionQuality: Audio.PitchCorrectionQuality.High };
      case 'robot':
        return { rate: 1.0, pitchCorrectionQuality: Audio.PitchCorrectionQuality.Low };
      case 'glitchy':
        return { rate: 1.2, pitchCorrectionQuality: Audio.PitchCorrectionQuality.Low };
      case 'girly':
        return { rate: 1.15, pitchCorrectionQuality: Audio.PitchCorrectionQuality.High };
      case 'boyish':
        return { rate: 0.85, pitchCorrectionQuality: Audio.PitchCorrectionQuality.High };
      default:
        return { rate: 1.0, pitchCorrectionQuality: Audio.PitchCorrectionQuality.High };
    }
  };

  const playVoiceNote = async (postId: string, voiceUrl: string, effect?: string) => {
    try {
      if (voiceNotePlaying[postId] && voiceSounds[postId]) {
        await voiceSounds[postId].pauseAsync();
        setVoiceNotePlaying(prev => ({ ...prev, [postId]: false }));
        return;
      }

      if (voiceSounds[postId]) {
        const status = await voiceSounds[postId].getStatusAsync();
        if (status.isLoaded) {
          if (status.didJustFinish || (status.durationMillis && status.positionMillis >= status.durationMillis)) {
            await voiceSounds[postId].replayAsync();
          } else {
            await voiceSounds[postId].playAsync();
          }
          setVoiceNotePlaying(prev => ({ ...prev, [postId]: true }));
        }
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const playbackSettings = getVoiceEffectSettings(effect);

      const { sound } = await Audio.Sound.createAsync(
        { uri: voiceUrl },
        { 
          shouldPlay: true,
          ...playbackSettings
        },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setVoiceNotePlaying(prev => ({ ...prev, [postId]: false }));
          }
        }
      );

      setVoiceSounds(prev => ({ ...prev, [postId]: sound }));
      setVoiceNotePlaying(prev => ({ ...prev, [postId]: true }));
    } catch (error) {
      console.error('Error playing voice note:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to play voice note' });
    }
  };

  const formatVoiceDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `0:${seconds.toString().padStart(2, '0')}`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderVoiceNote = (voiceNote: { url: string; effect?: string; duration?: number }, postId: string) => {
    const voiceId = 'voice_' + postId;
    const isPlaying = voiceNotePlaying[voiceId] || false;
    const duration = voiceNote.duration || 0;

    return (
      <View style={styles.voiceNoteContainer}>
        <TouchableOpacity
          style={styles.voiceNoteButton}
          onPress={(e) => {
            e.stopPropagation();
            playVoiceNote(voiceId, voiceNote.url, voiceNote.effect);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.playButtonCircle}>
            <Text style={styles.playButtonIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </View>
          
          <View style={styles.voiceWaveformContainer}>
            <View style={styles.waveformBars}>
              {[...Array(25)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.waveformBar,
                    { 
                      height: Math.random() * 16 + 8,
                      backgroundColor: isPlaying ? '#00D4AA' : '#555'
                    }
                  ]} 
                />
              ))}
            </View>
            <View style={styles.voiceNoteFooter}>
              <Text style={styles.voiceNoteDuration}>
                {duration > 0 ? formatVoiceDuration(duration) : '0:00'}
              </Text>
              {voiceNote.effect && voiceNote.effect !== 'none' && (
                <Text style={styles.voiceNoteEffect}>• {voiceNote.effect}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    coverPhoto: {
      height: 200,
      width: '100%',
    },
    header: {
      alignItems: 'center',
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.xl,
      marginTop: -50,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginTop: theme.spacing.md,
    },
    editProfileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    editProfileText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    settingsButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    settingsIcon: {
      fontSize: 18,
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      ...theme.shadows.medium,
      position: 'relative',
    },
    avatarText: {
      fontSize: 40,
      color: theme.colors.primary,
    },
    editAvatarBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.colors.background,
    },
    editAvatarText: {
      fontSize: 14,
    },
    username: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    bio: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    statLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    mediaSection: {
      paddingHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionTitleText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    seeAllButton: {
      fontSize: 14,
      color: theme.colors.primary,
    },
    mediaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    mediaThumbnail: {
      width: (Dimensions.get('window').width - 64) / 3,
      height: (Dimensions.get('window').width - 64) / 3,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    mediaCount: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    mediaCountText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    mediaTabs: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      gap: 8,
    },
    mediaTabButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activeMediaTab: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    mediaTabText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    activeMediaTabText: {
      color: '#000',
    },
    settingsModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    settingsContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: theme.spacing.lg,
      paddingBottom: 40,
      maxHeight: '80%',
    },
    settingsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      fontSize: 24,
      color: theme.colors.textSecondary,
    },
    menuContainer: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    },
    menuIcon: {
      fontSize: 20,
      marginRight: theme.spacing.md,
      width: 30,
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    menuArrow: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    logoutButton: {
      backgroundColor: theme.colors.error,
      marginTop: theme.spacing.lg,
    },
    logoutText: {
      color: theme.colors.textInverse,
    },
    followModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    followModalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      width: '85%',
      maxHeight: '70%',
      padding: theme.spacing.xl,
    },
    followModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    followModalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    followUserItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    followUserAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    followUserAvatarText: {
      fontSize: 20,
      color: theme.colors.primary,
    },
    followUserInfo: {
      flex: 1,
    },
    followUserName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    followUserBio: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    preferencesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.md,
    },
    preferenceTag: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.round,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    preferenceText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    postsSection: {
      paddingHorizontal: 0,
      paddingBottom: theme.spacing.xl,
    },
    postCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 0,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      marginHorizontal: 0,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '60',
      width: '100%',
    },
    postCategory: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
      marginBottom: theme.spacing.sm,
    },
    postText: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
      marginBottom: theme.spacing.md,
    },
    postMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    postDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    postReactions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    reactionEmoji: {
      fontSize: 16,
      marginRight: theme.spacing.xs,
    },
    reactionText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },
    mediaContainer: {
      marginVertical: theme.spacing.md,
    },
    mediaItem: {
      marginRight: theme.spacing.sm,
    },
    mediaContent: {
      height: 200,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
    },
    videoContainer: {
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
    },
    emptyPosts: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 16,
      marginTop: theme.spacing.lg,
    },
    loadingPosts: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 16,
      marginTop: theme.spacing.lg,
    },
    oneTimeBadge: {
      backgroundColor: 'rgba(255, 107, 53, 0.15)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    oneTimeBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FF6B35',
    },
    lockIndicator: {
      fontSize: 11,
      color: theme.colors.error,
      marginTop: 8,
    },
    voiceNoteContainer: {
      marginVertical: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    voiceNoteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
    },
    playButtonCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    playButtonIcon: {
      color: '#000',
      fontSize: 16,
      marginLeft: 2,
    },
    voiceWaveformContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    waveformBars: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 24,
      gap: 2,
      marginBottom: 4,
    },
    waveformBar: {
      width: 2.5,
      borderRadius: 2,
      opacity: 0.8,
    },
    voiceNoteFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    voiceNoteDuration: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    voiceNoteEffect: {
      fontSize: 11,
      color: theme.colors.primary,
      textTransform: 'capitalize',
      fontWeight: '500',
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: 0,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    activeTabText: {
      color: theme.colors.primary,
    },
    tabIcon: {
      fontSize: 18,
      marginBottom: theme.spacing.xs,
    },
  });

  // Media renderer component
  const renderMedia = (media: any[], legacyImage?: string) => {
    // Handle legacy single image format (content.image)
    if (legacyImage && (!media || media.length === 0)) {
      media = [{
        url: legacyImage,
        type: 'image',
      }];
    }
    
    if (!media || media.length === 0) return null;

    const screenWidth = Dimensions.get('window').width;
    const mediaWidth = screenWidth - 80; // Account for padding

    return (
      <View style={styles.mediaContainer}>
        <FlatList
          data={media}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.mediaItem}>
              {item.type === 'video' || item.mimetype?.startsWith('video/') ? (
                <View style={styles.videoContainer}>
                  <Video
                    source={{ uri: item.url }}
                    style={[styles.mediaContent, { width: mediaWidth * 0.8 }]}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                  />
                </View>
              ) : (
                <Image 
                  source={{ uri: item.url }} 
                  style={[styles.mediaContent, { width: mediaWidth * 0.8 }]}
                  resizeMode="cover"
                />
              )}
            </View>
          )}
        />
      </View>
    );
  };

  const settingsMenuItems = [
    { icon: '🚫', title: 'Blocked Users', onPress: () => { setSettingsModalVisible(false); navigation.navigate('BlockedUsers' as never); } },
    { icon: '🎨', title: 'Themes', onPress: () => { setSettingsModalVisible(false); navigation.navigate('Settings' as never); } },
    { icon: '🎭', title: 'Customize Avatar', onPress: () => { setSettingsModalVisible(false); navigation.navigate('AvatarCustomizer' as never); } },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Cover Photo with Theme Gradient */}
      <LinearGradient
        colors={[theme.colors.primary + '80', theme.colors.primary + '40', theme.colors.primary + '20']}
        style={styles.coverPhoto}
      />

      {/* Profile Header */}
      <View style={styles.header}>
        {/* Avatar */}
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => navigation.navigate('AvatarCustomizer' as never)}
        >
          {user?.customAvatar?.enabled ? (
            <AvatarRenderer 
              config={user.customAvatar} 
              size={100}
            />
          ) : user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={{ width: 100, height: 100, borderRadius: 50 }} />
          ) : (
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </Text>
          )}
        </TouchableOpacity>

        {/* User Info */}
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.bio}>
          {user?.bio || 'No bio yet'}
        </Text>

        {/* Preferences */}
        <View style={styles.preferencesContainer}>
          {user?.preferences?.map((preference) => (
            <View key={preference} style={styles.preferenceTag}>
              <Text style={styles.preferenceText}>#{preference}</Text>
            </View>
          ))}
        </View>

        {/* Edit Profile & Settings Buttons */}
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile' as never)}
          >
            <Text style={styles.editProfileText}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setSettingsModalVisible(true)}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats?.postsCount || 0}</Text>
          <Text style={styles.statLabel}>posts</Text>
        </View>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => {
            loadFollowers();
            setFollowersModalVisible(true);
          }}
        >
          <Text style={styles.statNumber}>{user?.stats?.followersCount || 0}</Text>
          <Text style={styles.statLabel}>echoes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => {
            loadFollowing();
            setFollowingModalVisible(true);
          }}
        >
          <Text style={styles.statNumber}>{user?.stats?.followingCount || 0}</Text>
          <Text style={styles.statLabel}>echoing</Text>
        </TouchableOpacity>
      </View>

      {/* Photos Section */}
      <View style={styles.mediaSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleText}>Photos</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllButton}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.mediaGrid}>
          {getMediaPosts()
            .filter(post => {
              const media = post.content?.media || [];
              return media.some((m: any) => m.type === 'image' || !m.mimetype?.startsWith('video/'));
            })
            .slice(0, 6)
            .map((post, index) => {
              const imageMedia = post.content?.media?.find((m: any) => m.type === 'image' || !m.mimetype?.startsWith('video/'));
              return (
                <TouchableOpacity 
                  key={post._id}
                  onPress={() => (navigation as any).navigate('PostDetail', { postId: post._id })}
                >
                  <Image 
                    source={{ uri: imageMedia?.url }} 
                    style={styles.mediaThumbnail}
                    resizeMode="cover"
                  />
                  {index === 5 && getMediaPosts().filter(p => {
                    const media = p.content?.media || [];
                    return media.some((m: any) => m.type === 'image' || !m.mimetype?.startsWith('video/'));
                  }).length > 6 && (
                    <View style={styles.mediaCount}>
                      <Text style={styles.mediaCountText}>
                        +{getMediaPosts().filter(p => {
                          const media = p.content?.media || [];
                          return media.some((m: any) => m.type === 'image' || !m.mimetype?.startsWith('video/'));
                        }).length - 6}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
        </View>
      </View>

      {/* Videos Section */}
      <View style={styles.mediaSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleText}>Videos</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllButton}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.mediaGrid}>
          {getMediaPosts()
            .filter(post => {
              const media = post.content?.media || [];
              return media.some((m: any) => m.type === 'video' || m.mimetype?.startsWith('video/'));
            })
            .slice(0, 6)
            .map((post, index) => {
              const videoMedia = post.content?.media?.find((m: any) => m.type === 'video' || m.mimetype?.startsWith('video/'));
              return (
                <TouchableOpacity 
                  key={post._id}
                  onPress={() => (navigation as any).navigate('PostDetail', { postId: post._id })}
                >
                  <Video
                    source={{ uri: videoMedia?.url }}
                    style={styles.mediaThumbnail}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                  />
                  {index === 5 && getMediaPosts().filter(p => {
                    const media = p.content?.media || [];
                    return media.some((m: any) => m.type === 'video' || m.mimetype?.startsWith('video/'));
                  }).length > 6 && (
                    <View style={styles.mediaCount}>
                      <Text style={styles.mediaCountText}>
                        +{getMediaPosts().filter(p => {
                          const media = p.content?.media || [];
                          return media.some((m: any) => m.type === 'video' || m.mimetype?.startsWith('video/'));
                        }).length - 6}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
        </View>
      </View>

      {/* Tabs Section */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'home' && styles.activeTab]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'radar' && styles.activeTab]}
          onPress={() => setActiveTab('radar')}
        >
          <Text style={[styles.tabText, activeTab === 'radar' && styles.activeTabText]}>
            Radar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'whisper' && styles.activeTab]}
          onPress={() => setActiveTab('whisper')}
        >
          <Text style={[styles.tabText, activeTab === 'whisper' && styles.activeTabText]}>
            Whispers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Posts Section */}
      <View style={styles.postsSection}>
        {loading ? (
          <Text style={[styles.loadingPosts, { paddingHorizontal: theme.spacing.xl }]}>Loading posts...</Text>
        ) : activeTab === 'whisper' ? (
          // Whisper posts with WhisperBubble UI
          (() => {
            console.log('🎨 Rendering whisper tab');
            console.log('🎨 whisperPosts.length:', whisperPosts.length);
            console.log('🎨 whisperPosts:', whisperPosts);
            
            return whisperPosts.length > 0 ? (
              <View style={{ position: 'relative', minHeight: 400, padding: 20 }}>
                {whisperPosts.map((whisper, index) => {
                  console.log(`🎨 Rendering whisper ${index}:`, whisper._id);
                  return (
                    <WhisperBubble
                      key={whisper._id}
                      whisper={whisper}
                      index={index}
                      theme={getDailyTheme()}
                      onPress={() => {
                        setSelectedWhisper(whisper);
                        setWhisperModalVisible(true);
                      }}
                      onMenuPress={() => {
                        console.log('🔘 Menu button pressed for whisper:', whisper._id);
                        setSelectedWhisperForMenu(whisper);
                        setWhisperOptionsVisible(true);
                      }}
                    />
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.emptyPosts, { paddingHorizontal: theme.spacing.xl }]}>
                No whispers yet. Visit WhisperWall to share anonymously!
              </Text>
            );
          })()
        ) : (() => {
          // Regular posts (home and radar)
          let filteredPosts: any[] = [];
          
          if (activeTab === 'radar') {
            // Show radar posts (location-enabled posts)
            filteredPosts = userPosts.filter(post => post.locationEnabled && post.geoLocation);
          } else {
            // Home posts: regular posts without location
            filteredPosts = userPosts.filter(post => !post.locationEnabled);
          }

          return filteredPosts.length > 0 ? (
            filteredPosts.map((post: any) => (
              <TouchableOpacity 
                key={post._id} 
                style={styles.postCard}
                onPress={() => (navigation as any).navigate('PostDetail', { postId: post._id })}
              >
                {post.category && <Text style={styles.postCategory}>#{post.category}</Text>}
                
                {/* One-Time Post Badge */}
                {post.oneTime?.enabled && (
                  <View style={styles.oneTimeBadge}>
                    <Text style={styles.oneTimeBadgeText}>
                      ✨ One-Time Post • {post.oneTime.viewedBy?.length || 0} views
                    </Text>
                  </View>
                )}
                
                {/* Location Badge for Radar Posts */}
                {post.locationEnabled && post.location && (
                  <View style={[styles.oneTimeBadge, { backgroundColor: 'rgba(0, 212, 170, 0.15)' }]}>
                    <Text style={[styles.oneTimeBadgeText, { color: '#00D4AA' }]}>
                      📍 {post.location.city || 'Location'} {post.location.emoji || ''}
                    </Text>
                  </View>
                )}
                
                {/* Content */}
                {post.content?.text && (
                  <Text style={styles.postText}>{censorText(post.content.text)}</Text>
                )}
                {post.content?.voiceNote?.url && renderVoiceNote(post.content.voiceNote, post._id)}
                {renderMedia(post.content?.media, (post.content as any)?.image)}
                
                <View style={styles.postMeta}>
                  <Text style={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Text>
                  <View style={styles.postReactions}>
                    <Text style={styles.reactionEmoji}>❤️</Text>
                    <Text style={styles.reactionText}>
                      {post.reactionCounts?.total || 0} • {post.comments?.length || 0} comments
                    </Text>
                  </View>
                </View>
                
                {/* Lock indicators */}
                {(post.interactions?.reactionsLocked || post.interactions?.commentsLocked) && (
                  <Text style={styles.lockIndicator}>
                    🔒 {post.interactions?.reactionsLocked && post.interactions?.commentsLocked 
                      ? 'Reactions & Comments locked' 
                      : post.interactions?.reactionsLocked 
                        ? 'Reactions locked' 
                        : 'Comments locked'}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.emptyPosts, { paddingHorizontal: theme.spacing.xl }]}>
              {activeTab === 'radar'
                ? 'No radar posts yet. Enable location when creating a post!'
                : 'No posts yet. Start sharing your thoughts!'}
            </Text>
          );
        })()}
      </View>

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.settingsModal}
          activeOpacity={1}
          onPress={() => setSettingsModalVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.settingsContent}>
              <View style={styles.settingsHeader}>
                <Text style={styles.settingsTitle}>Settings</Text>
                <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.menuContainer}>
                {settingsMenuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={styles.menuText}>{item.title}</Text>
                    <Text style={styles.menuArrow}>›</Text>
                  </TouchableOpacity>
                ))}

                {/* Logout Button */}
                <TouchableOpacity
                  style={[styles.menuItem, styles.logoutButton]}
                  onPress={() => {
                    setSettingsModalVisible(false);
                    logout();
                  }}
                >
                  <Text style={[styles.menuIcon, styles.logoutText]}>🚪</Text>
                  <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Followers Modal */}
      <Modal
        visible={followersModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFollowersModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.followModal}
          activeOpacity={1}
          onPress={() => setFollowersModalVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.followModalContent}>
              <View style={styles.followModalHeader}>
                <Text style={styles.followModalTitle}>Echoes</Text>
                <TouchableOpacity onPress={() => setFollowersModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {followers.map((follower) => (
                  <TouchableOpacity
                    key={follower._id}
                    style={styles.followUserItem}
                    onPress={() => {
                      setFollowersModalVisible(false);
                      (navigation as any).navigate('UserProfile', { username: follower.username });
                    }}
                  >
                    <View style={styles.followUserAvatar}>
                      {follower.customAvatar?.enabled ? (
                        <AvatarRenderer config={follower.customAvatar} size={50} />
                      ) : (
                        <Text style={styles.followUserAvatarText}>
                          {follower.username?.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={styles.followUserInfo}>
                      <Text style={styles.followUserName}>@{follower.username}</Text>
                      <Text style={styles.followUserBio} numberOfLines={1}>
                        {follower.bio || 'No bio'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {followers.length === 0 && (
                  <Text style={[styles.emptyPosts, { textAlign: 'center', marginTop: 20 }]}>
                    No echoes yet
                  </Text>
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Following Modal */}
      <Modal
        visible={followingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFollowingModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.followModal}
          activeOpacity={1}
          onPress={() => setFollowingModalVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.followModalContent}>
              <View style={styles.followModalHeader}>
                <Text style={styles.followModalTitle}>Echoing</Text>
                <TouchableOpacity onPress={() => setFollowingModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {following.map((followedUser) => (
                  <TouchableOpacity
                    key={followedUser._id}
                    style={styles.followUserItem}
                    onPress={() => {
                      setFollowingModalVisible(false);
                      (navigation as any).navigate('UserProfile', { username: followedUser.username });
                    }}
                  >
                    <View style={styles.followUserAvatar}>
                      {followedUser.customAvatar?.enabled ? (
                        <AvatarRenderer config={followedUser.customAvatar} size={50} />
                      ) : (
                        <Text style={styles.followUserAvatarText}>
                          {followedUser.username?.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={styles.followUserInfo}>
                      <Text style={styles.followUserName}>@{followedUser.username}</Text>
                      <Text style={styles.followUserBio} numberOfLines={1}>
                        {followedUser.bio || 'No bio'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {following.length === 0 && (
                  <Text style={[styles.emptyPosts, { textAlign: 'center', marginTop: 20 }]}>
                    Not echoing anyone yet
                  </Text>
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Whisper Detail Modal */}
      {selectedWhisper && (
        <WhisperDetailModal
          visible={whisperModalVisible}
          whisper={selectedWhisper}
          theme={getDailyTheme()}
          onClose={() => {
            setWhisperModalVisible(false);
            setSelectedWhisper(null);
          }}
          onReact={async (reactionType: string) => {
            try {
              await whisperWallAPI.reactToWhisper(
                selectedWhisper._id, 
                reactionType as 'funny' | 'rage' | 'shock' | 'relatable' | 'love' | 'thinking'
              );
              // Refresh whispers to show updated reaction
              loadWhisperPosts();
            } catch (error) {
              console.error('Error reacting to whisper:', error);
            }
          }}
        />
      )}

      {/* Whisper Options Menu */}
      <WhisperPostOptions
        visible={whisperOptionsVisible}
        onClose={() => {
          setWhisperOptionsVisible(false);
          setSelectedWhisperForMenu(null);
        }}
        postId={selectedWhisperForMenu?._id || ''}
        onEdit={() => {
          if (selectedWhisperForMenu) {
            handleEditWhisper(selectedWhisperForMenu);
          }
        }}
        onDelete={() => {
          if (selectedWhisperForMenu) {
            handleDeleteWhisper(selectedWhisperForMenu._id);
          }
        }}
      />

      {/* Edit Whisper Modal */}
      <EditWhisperModal
        visible={editWhisperModalVisible}
        whisper={whisperToEdit}
        onClose={() => {
          setEditWhisperModalVisible(false);
          setWhisperToEdit(null);
        }}
        onSuccess={() => {
          loadWhisperPosts();
        }}
      />
    </ScrollView>
  );
};

export default ProfileScreen;
