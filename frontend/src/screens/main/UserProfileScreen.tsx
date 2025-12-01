import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, FlatList, Dimensions, Platform, Animated } from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { useTheme } from '../../context/ThemeContext';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { postsAPI, userAPI } from '../../services/api';
import { reactionsAPI } from '../../services/reactions';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import ReactionPopup from '../../components/ReactionPopup';
import PostOptions from '../../components/PostOptions';
import UserPostOptions from '../../components/UserPostOptions';
import EditPostModal from '../../components/EditPostModal';
import OneTimePostCard from '../../components/OneTimePostCard';
import { convertAvatarUrl } from '../../utils/imageUtils';
import { censorText } from '../../utils/censorUtils';
import { formatTimeAgo } from '../../utils/timeUtils';
import { getFullMediaUrl, handleMediaError } from '../../utils/mediaUtils';

type UserProfileRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;

type ReactionType = 'funny' | 'rage' | 'shock' | 'relatable' | 'love' | 'thinking';

const REACTION_ICONS: Record<ReactionType, string> = {
  funny: '😂',
  rage: '😡',
  shock: '😱',
  relatable: '💯',
  love: '❤️',
  thinking: '🤔',
};

const UserProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<UserProfileRouteProp>();
  const navigation = useNavigation();
  const { user: authUser } = useAuth();

  const { username } = route.params;

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [reactionPopup, setReactionPopup] = useState<{
    visible: boolean;
    postId: string;
    position: { x: number; y: number };
  }>({
    visible: false,
    postId: '',
    position: { x: 0, y: 0 },
  });
  const likeButtonRefs = useRef<{ [key: string]: any }>({});
  const [postOptions, setPostOptions] = useState<{
    visible: boolean;
    postId: string;
    authorId?: string;
    authorUsername?: string;
  }>({
    visible: false,
    postId: '',
    authorId: undefined,
    authorUsername: undefined,
  });
  const [userPostOptions, setUserPostOptions] = useState<{
    visible: boolean;
    postId: string;
  }>({
    visible: false,
    postId: '',
  });
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const [voiceNotePlaying, setVoiceNotePlaying] = useState<{ [key: string]: boolean }>({});
  const [voiceSounds, setVoiceSounds] = useState<{ [key: string]: Audio.Sound }>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [postToEdit, setPostToEdit] = useState<any>(null);

  const isOwnProfile = useMemo(() => authUser?.username === username, [authUser?.username, username]);

  const isEchoing = useMemo(() => {
    if (!authUser || !profile?.followers) return false;
    return profile.followers.some((f: any) => f._id === authUser._id);
  }, [authUser, profile]);

  // Header title is configured in navigator options using route params

  const loadProfileAndPosts = async (reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      const [profileRes, postsRes] = await Promise.all([
        userAPI.getProfile(username),
        postsAPI.getUserPosts(username, reset ? 1 : page, 20),
      ]);

      const userData = profileRes.user || profileRes.data?.user || profileRes.data;
      setProfile(userData);

      const newPosts = (postsRes as any).posts || (postsRes as any).data || [];
      setPosts(reset ? newPosts : [...posts, ...newPosts]);
      const pagination = (postsRes as any).pagination;
      setHasMore(pagination ? !!pagination.hasMore : newPosts.length >= 20);
      if (!reset) setPage(p => p + 1);
    } catch (e: any) {
      console.log('UserProfile load error', e);
      const message = e?.response?.data?.message || 'Failed to load profile';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
      // keep screen visible; show minimal header
      setProfile((prev: any) => prev || { username, bio: '', followers: [], following: [], stats: {} });
      if (reset) setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfileAndPosts(true);
  }, [username]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileAndPosts(true);
  };

  const loadMore = async () => {
    if (loading || refreshing || !hasMore) return;
    await loadProfileAndPosts(false);
  };

  const handleToggleFollow = async () => {
    if (!profile?._id || isOwnProfile || followLoading) return;
    try {
      setFollowLoading(true);
      if (isEchoing) {
        await userAPI.unechoUser(profile._id);
        setProfile({
          ...profile,
          followers: profile.followers.filter((f: any) => f._id !== authUser?._id),
          stats: { ...profile.stats, followersCount: Math.max(0, (profile.stats?.followersCount || 1) - 1) },
        });
      } else {
        await userAPI.echoUser(profile._id);
        setProfile({
          ...profile,
          followers: [...(profile.followers || []), { _id: authUser?._id, username: authUser?.username, avatar: authUser?.avatar }],
          stats: { ...profile.stats, followersCount: (profile.stats?.followersCount || 0) + 1 },
        });
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={{ paddingVertical: 6, paddingRight: 12 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerTop}>
        <View style={styles.avatarWrapper}>
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}> 
              <Text style={{ color: theme.colors.textInverse, fontSize: 28, fontWeight: '700' }}>{profile?.username?.charAt(0)?.toUpperCase() || '?'}</Text>
            </View>
          )}
        </View>
        <View style={styles.nameSection}>
          <Text style={[styles.usernameText, { color: theme.colors.text }]}>@{profile?.username}</Text>
          {!!profile?.bio && (
            <Text style={[styles.bioText, { color: theme.colors.textSecondary }]} numberOfLines={3}>{profile.bio}</Text>
          )}
          <View style={styles.statsRow}>
            <Stat label="Posts" value={profile?.stats?.postsCount || 0} />
            <Stat label="Followers" value={profile?.stats?.followersCount || (profile?.followers?.length || 0)} />
            <Stat label="Following" value={profile?.stats?.followingCount || (profile?.following?.length || 0)} />
          </View>
        </View>
      </View>
      {isOwnProfile && (
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            onPress={() => (navigation as any).navigate('EditProfile')}
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary, flex: 1 }]}
          >
            <Text style={{ color: theme.colors.textInverse, fontWeight: '700' }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      )}
      {!isOwnProfile && (
        <View style={styles.actionsRow}>
          <TouchableOpacity disabled={followLoading} onPress={handleToggleFollow} style={[styles.primaryButton, { backgroundColor: isEchoing ? theme.colors.surface : theme.colors.primary, borderColor: theme.colors.primary, borderWidth: isEchoing ? 1 : 0 }]}> 
            <Text style={{ color: isEchoing ? theme.colors.primary : theme.colors.textInverse, fontWeight: '700' }}>{isEchoing ? 'Following' : 'Add Friend'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => profile && (navigation as any).navigate('Chat', { peerId: profile._id, username: profile.username, avatar: profile.avatar })}
            style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
          > 
            <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Message</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );

  const showReactionPopup = (postId: string, event?: any) => {
    const buttonRef = likeButtonRefs.current[postId];
    if (buttonRef) {
      (buttonRef as any).measure((fx: number, fy: number, fwidth: number, fheight: number, pageX: number, pageY: number) => {
        setReactionPopup({
          visible: true,
          postId,
          position: { 
            x: pageX + fwidth / 2,
            y: pageY,
          },
        });
      });
    } else {
      let x = Dimensions.get('window').width / 6;
      let y = Dimensions.get('window').height - 200;
      
      if (event?.nativeEvent) {
        const touch = event.nativeEvent.touches?.[0] || event.nativeEvent;
        if (touch?.pageX) x = touch.pageX;
        if (touch?.pageY) y = touch.pageY - 80;
      }
      
      setReactionPopup({
        visible: true,
        postId,
        position: { x, y },
      });
    }
  };

  const hideReactionPopup = () => {
    setReactionPopup({
      visible: false,
      postId: '',
      position: { x: 0, y: 0 },
    });
  };

  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    try {
      const post = posts.find(p => p._id === postId);
      if (!post) return;
      
      let response;
      if (post.userReaction === reactionType) {
        response = await reactionsAPI.removeReaction(postId);
      } else {
        response = await reactionsAPI.addReaction(postId, reactionType);
      }
      
      if (response.success && response.reactions) {
        setPosts(prevPosts => 
          prevPosts.map(p => {
            if (p._id === postId) {
              return { 
                ...p, 
                reactionCounts: response.reactions,
                userReaction: response.userReaction || null
              };
            }
            return p;
          })
        );
      } else {
        await loadProfileAndPosts(true);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update reaction',
      });
    }
  };

  const handleReactionSelect = async (reactionType: ReactionType) => {
    if (reactionPopup.postId) {
      await handleReaction(reactionPopup.postId, reactionType);
    }
  };

  const handleEditPost = (postId: string) => {
    const post = posts.find(p => p._id === postId);
    if (post) {
      setPostToEdit(post);
      setEditModalVisible(true);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await postsAPI.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
      Toast.show({
        type: 'success',
        text1: 'Post deleted',
        text2: 'Your post has been removed',
      });
    } catch (error) {
      console.error('Failed to delete post:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete post. Please try again.',
      });
    }
  };

  const handleHidePost = async (postId: string) => {
    try {
      await postsAPI.hidePost(postId);
      setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
      Toast.show({
        type: 'success',
        text1: 'Post hidden',
        text2: 'This post has been removed from your feed',
      });
    } catch (error) {
      console.error('Failed to hide post:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to hide post. Please try again.',
      });
    }
  };

  const handleBlockUser = async (userId: string, username: string) => {
    try {
      await userAPI.blockUser(userId);
      setPosts(prevPosts => prevPosts.filter(p => p.author?._id !== userId));
      Toast.show({
        type: 'success',
        text1: 'User blocked',
        text2: `@${username} has been blocked.`,
      });
    } catch (error) {
      console.error('Failed to block user:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to block user. Please try again.',
      });
    }
  };

  const handleMuteUser = async (userId: string, username: string) => {
    try {
      await userAPI.muteUser(userId);
      setPosts(prevPosts => prevPosts.filter(p => p.author?._id !== userId));
      Toast.show({
        type: 'success',
        text1: 'User muted',
        text2: `All posts from @${username} are now hidden`,
      });
    } catch (error) {
      console.error('Failed to mute user:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to mute user. Please try again.',
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
        { uri: getFullMediaUrl(voiceUrl) },
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

  const renderVoiceNote = (voiceNote: { url: string; effect?: string; duration?: number }) => {
    const postId = 'voice_' + voiceNote.url;
    const isPlaying = voiceNotePlaying[postId] || false;
    const duration = voiceNote.duration || 0;

    return (
      <View style={styles.voiceNoteContainer}>
        <TouchableOpacity
          style={styles.voiceNoteButton}
          onPress={(e) => {
            e.stopPropagation();
            playVoiceNote(postId, voiceNote.url, voiceNote.effect);
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
    const imageWidth = screenWidth;
    const imageHeight = imageWidth * 0.75;
    
    return (
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={(e) => e.stopPropagation()}
        style={styles.mediaContainer}
      >
        {media.length === 1 ? (
          <View style={styles.mediaItem}>
            {media[0].type === 'video' ? (
              <View style={styles.videoContainer}>
                <Video
                  source={{ uri: getFullMediaUrl(media[0].url) }}
                  style={[styles.mediaContent, { width: imageWidth, height: imageHeight }]}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping={false}
                  onError={(error) => handleMediaError(error, 'video', media[0].url)}
                />
              </View>
            ) : (
              <Image 
                source={{ uri: getFullMediaUrl(media[0].url) }} 
                style={[styles.mediaContent, { width: imageWidth, height: imageHeight }]} 
                resizeMode="cover"
                onError={(error) => handleMediaError(error, 'image', media[0].url)}
              />
            )}
          </View>
        ) : (
          <FlatList
            data={media}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ alignItems: 'center' }}
            renderItem={({ item }) => (
              <View style={styles.mediaItem}>
                {item.type === 'video' ? (
                  <View style={styles.videoContainer}>
                    <Video
                      source={{ uri: item.url }}
                      style={[styles.mediaContent, { width: imageWidth * 0.9, height: imageHeight * 0.9 }]}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      isLooping={false}
                    />
                  </View>
                ) : (
                  <Image 
                    source={{ uri: item.url }} 
                    style={[styles.mediaContent, { width: imageWidth * 0.9, height: imageHeight * 0.9 }]} 
                    resizeMode="cover"
                  />
                )}
              </View>
            )}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderPost = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.postCard,
        hoveredPost === item._id && styles.postCardGlow,
      ]}
      activeOpacity={0.9}
      onPressIn={() => setHoveredPost(item._id)}
      onPressOut={() => setHoveredPost(null)}
      onPress={() => (navigation as any).navigate('PostDetail', { postId: item._id })}
    >
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              if (item.author?.username) {
                (navigation as any).navigate('UserProfile', { username: item.author.username });
              }
            }} 
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            {item.author?.avatar ? (
              <Image source={{ uri: convertAvatarUrl(item.author.avatar) || '' }} style={styles.postAvatar} />
            ) : (
              <View style={[styles.postAvatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.avatarText}>{item.author?.username?.charAt(0).toUpperCase() || '?'}</Text>
              </View>
            )}
            <Text style={[styles.postUsername, { color: theme.colors.text }]}>{item.author?.username || 'Unknown User'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.postDate, { color: theme.colors.textSecondary, marginRight: 12 }]}>{formatTimeAgo(item.createdAt)}</Text>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              if (item.author?._id === authUser?._id) {
                setUserPostOptions({
                  visible: true,
                  postId: item._id,
                });
              } else {
                setPostOptions({
                  visible: true,
                  postId: item._id,
                  authorId: item.author?._id,
                  authorUsername: item.author?.username,
                });
              }
            }}
            style={{
              padding: 10,
              borderRadius: 20,
              backgroundColor: theme.colors.background,
              borderWidth: 1,
              borderColor: theme.colors.border,
              minWidth: 40,
              minHeight: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={0.6}
          >
            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.text, marginBottom: 3 }} />
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.text, marginBottom: 3 }} />
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.text }} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {item.category && <Text style={[styles.postCategory, { color: theme.colors.primary }]}>#{item.category}</Text>}
      
      {/* One-Time Post or Normal Post */}
      {item.oneTime?.enabled ? (
        <>
          {/* Always show one-time badge for one-time posts on profile (author can always see their posts) */}
          <View style={styles.oneTimeBadge}>
            <Text style={styles.oneTimeBadgeText}>
              ✨ One-Time Post • {item.oneTime.viewedBy?.length || 0} views
            </Text>
          </View>
          
          {/* Show content for author, OneTimePostCard for others */}
          {item.author?._id === authUser?._id ? (
            <>
              {item.content?.text && (
                <Text style={[styles.postText, { color: theme.colors.text }]} numberOfLines={3}>
                  {censorText(item.content.text)}
                </Text>
              )}
              {item.content?.voiceNote?.url && renderVoiceNote(item.content.voiceNote)}
              {renderMedia(item.content.media, (item.content as any)?.image)}
            </>
          ) : (
            <OneTimePostCard post={item} />
          )}
        </>
      ) : (
        <>
          {item.content?.text && <Text style={[styles.postText, { color: theme.colors.text }]} numberOfLines={3}>{censorText(item.content.text)}</Text>}
          {item.content?.voiceNote?.url && renderVoiceNote(item.content.voiceNote)}
          {renderMedia(item.content.media, (item.content as any)?.image)}
        </>
      )}
      
      <View style={styles.actionButtons}>
        <View
          ref={(ref) => {
            if (ref) {
              likeButtonRefs.current[item._id] = ref;
            }
          }}
          style={{ flex: 1 }}
        >
          <TouchableOpacity 
            style={[
              styles.actionBtn, 
              item.userReaction && styles.activeActionBtn,
              item.interactions?.reactionsLocked && { opacity: 0.4 }
            ]}
            disabled={item.interactions?.reactionsLocked}
            onPress={(e) => {
              e.stopPropagation();
              if (item.interactions?.reactionsLocked) {
                Toast.show({
                  type: 'error',
                  text1: 'Reactions Locked',
                  text2: 'Reactions are locked on this post',
                });
                return;
              }
              showReactionPopup(item._id, e);
            }}
          >
            <Text style={styles.actionBtnIcon}>
              {item.userReaction ? REACTION_ICONS[item.userReaction as ReactionType] : '👍'}
            </Text>
            <Text style={styles.actionBtnText}>
              {item.userReaction 
                ? (item.userReaction.charAt(0).toUpperCase() + item.userReaction.slice(1))
                : 'Like'}
            </Text>
            {(item.reactionCounts?.total || 0) > 0 && (
              <Text style={styles.actionBtnCount}>{item.reactionCounts?.total || 0}</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={{ flex: 1 }}>
          <TouchableOpacity 
            style={[
              styles.actionBtn,
              item.interactions?.commentsLocked && { opacity: 0.4 }
            ]}
            disabled={item.interactions?.commentsLocked}
            onPress={(e) => {
              e.stopPropagation();
              if (item.interactions?.commentsLocked) {
                Toast.show({
                  type: 'error',
                  text1: 'Comments Locked',
                  text2: 'Comments are locked on this post',
                });
                return;
              }
              (navigation as any).navigate('PostDetail', { postId: item._id });
            }}
          >
            <Text style={styles.actionBtnIcon}>💬</Text>
            <Text style={styles.actionBtnText}>Comment</Text>
            {(item.comments?.length || 0) > 0 && (
              <Text style={styles.actionBtnCount}>{item.comments?.length || 0}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.postMeta}>
        <Text style={[styles.reactionText, { color: theme.colors.textSecondary }]}>
          {item.reactionCounts?.total || 0} likes • {item.comments?.length || 0} comments
        </Text>
        {(item.interactions?.reactionsLocked || item.interactions?.commentsLocked) && (
          <Text style={{ fontSize: 11, color: theme.colors.error, marginTop: 4 }}>
            🔒 {item.interactions?.reactionsLocked && item.interactions?.commentsLocked 
              ? 'Reactions & Comments locked' 
              : item.interactions?.reactionsLocked 
                ? 'Reactions locked' 
                : 'Comments locked'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        ListHeaderComponent={<Header />}
        data={posts}
        keyExtractor={(item, index) => item?._id || `post-${index}`}
        renderItem={renderPost}
        contentContainerStyle={{ paddingTop: theme.spacing.xl, paddingHorizontal: 0 }}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={hasMore ? <ActivityIndicator style={{ marginVertical: theme.spacing.lg }} color={theme.colors.primary} /> : <View style={{ height: Platform.OS === 'web' ? 80 : 40 }} />}
      />
      
      <ReactionPopup
        visible={reactionPopup.visible}
        position={reactionPopup.position}
        onSelect={handleReactionSelect}
        onClose={hideReactionPopup}
      />
      <PostOptions
        visible={postOptions.visible}
        onClose={() => setPostOptions({ visible: false, postId: '', authorId: undefined, authorUsername: undefined })}
        postId={postOptions.postId}
        authorId={postOptions.authorId}
        authorUsername={postOptions.authorUsername}
        onPostHidden={() => {
          handleHidePost(postOptions.postId);
          setPostOptions({ visible: false, postId: '', authorId: undefined, authorUsername: undefined });
        }}
        onUserBlocked={() => {
          if (postOptions.authorId && postOptions.authorUsername) {
            handleBlockUser(postOptions.authorId, postOptions.authorUsername);
          }
          setPostOptions({ visible: false, postId: '', authorId: undefined, authorUsername: undefined });
        }}
        onUserMuted={() => {
          if (postOptions.authorId && postOptions.authorUsername) {
            handleMuteUser(postOptions.authorId, postOptions.authorUsername);
          }
          setPostOptions({ visible: false, postId: '', authorId: undefined, authorUsername: undefined });
        }}
      />
      <UserPostOptions
        visible={userPostOptions.visible}
        onClose={() => setUserPostOptions({ visible: false, postId: '' })}
        postId={userPostOptions.postId}
        onEdit={() => handleEditPost(userPostOptions.postId)}
        onDelete={() => handleDeletePost(userPostOptions.postId)}
      />
      <EditPostModal
        visible={editModalVisible}
        post={postToEdit}
        onClose={() => {
          setEditModalVisible(false);
          setPostToEdit(null);
        }}
        onSuccess={() => {
          loadProfileAndPosts(true);
        }}
      />
    </View>
  );
};

const UserProfileScreenStyles = (theme: any) => StyleSheet.create({});

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    backgroundColor: 'transparent',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarWrapper: {
    marginRight: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  nameSection: {
    flex: 1,
  },
  usernameText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    marginRight: 18,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  postCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    paddingHorizontal: 20,
    borderRadius: 0,
    marginBottom: 0,
    width: '100%',
  },
  postCardGlow: {
    shadowColor: '#6B73FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  postHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  authorInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  postAvatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'rgba(107, 115, 255, 0.3)',
  },
  postAvatarPlaceholder: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    marginRight: 8, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(107, 115, 255, 0.3)',
  },
  avatarText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#fff',
  },
  postUsername: { 
    fontSize: 14, 
    fontWeight: '600',
  },
  postCategory: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
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
  postText: { fontSize: 16, lineHeight: 22, marginBottom: 8 },
  postDate: { fontSize: 12 },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    marginTop: 8,
    paddingTop: 8,
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
    minHeight: 36,
  },
  activeActionBtn: {
    backgroundColor: 'rgba(107, 115, 255, 0.15)',
  },
  actionBtnIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  actionBtnCount: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
  },
  postMeta: {
    marginTop: 8,
  },
  reactionText: {
    fontSize: 12,
  },
  mediaContainer: { 
    marginVertical: 12,
    marginHorizontal: -14,
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width,
  },
  mediaItem: { 
    marginRight: 8,
  },
  mediaContent: {
    height: 200,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  videoContainer: { 
    borderRadius: 8, 
    overflow: 'hidden',
  },
  voiceNoteContainer: {
    marginVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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
    backgroundColor: '#6B73FF',
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
    color: 'rgba(255,255,255,0.6)',
  },
  voiceNoteEffect: {
    fontSize: 11,
    color: '#6B73FF',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
});

export default UserProfileScreen;
