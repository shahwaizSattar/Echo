import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
  ImageResizeMode,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode, Audio } from 'expo-av';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { postsAPI } from '../../services/api';
import { reactionsAPI } from '../../services/reactions';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import Toast from 'react-native-toast-message';
import { convertAvatarUrl } from '../../utils/imageUtils';
import { censorText } from '../../utils/censorUtils';
import { formatTimeAgo } from '../../utils/timeUtils';

type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

type CommentItem = {
  type: 'comment';
  _id: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

type ListItem = CommentItem;

const isComment = (item: ListItem): item is CommentItem => {
  return item.type === 'comment';
};

type Reaction = 'funny' | 'rage' | 'shock' | 'relatable' | 'love' | 'thinking';

const REACTION_ICONS = {
  funny: '😂',
  rage: '😡',
  shock: '😱',
  relatable: '💯',
  love: '❤️',
  thinking: '🤔',
};

interface Post {
  _id: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  content: {
    text: string;
    media?: Array<{
      url: string;
      mimetype: string;
    }>;
    voiceNote?: {
      url: string;
      effect?: string;
      duration?: number;
    };
  };
  category: string;
  createdAt: string;
  reactions: {
    funny: any[];
    rage: any[];
    shock: any[];
    relatable: any[];
    love: any[];
    thinking: any[];
  };
  reactionCounts: {
    funny: number;
    rage: number;
    shock: number;
    relatable: number;
    love: number;
    thinking: number;
    total: number;
  };
  userReaction?: Reaction;
  interactions?: {
    commentsLocked?: boolean;
    reactionsLocked?: boolean;
  };
  poll?: {
    enabled: boolean;
    type: 'yesno' | 'emoji' | 'multi';
    question: string;
    options: Array<{
      text: string;
      emoji?: string;
      votes: any[];
      voteCount: number;
    }>;
    revealAfterVote: boolean;
    totalVotes: number;
    isAnonymous: boolean;
  };
  comments: Array<ListItem & {
    type: 'comment';
    _id: string;
    author: {
      _id: string;
      username: string;
      avatar?: string;
    };
    content: string;
    createdAt: string;
  }>;
}

const PostDetailScreen = () => {
  const route = useRoute<PostDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { postId } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<ListItem[]>([]);
  const [voiceSound, setVoiceSound] = useState<Audio.Sound | null>(null);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
    },
    postContainer: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      marginBottom: 10,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: 15,
      marginTop: 15,
      ...theme.shadows.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '40',
    },
    authorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
      borderWidth: 2,
      borderColor: theme.colors.primary + '30',
    },
    avatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary + '30',
    },
    avatarText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    username: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.colors.text,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    postCategory: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 12,
      color: theme.colors.primary,
    },
    postContent: {
      fontSize: 16,
      marginBottom: 15,
      lineHeight: 26,
      color: theme.colors.text,
    },
    mediaContainer: {
      marginBottom: 15,
    },
    mediaItem: {
      marginRight: 10,
    },
    mediaContent: {
      width: 250,
      height: 250,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background,
    },
    reactionBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 15,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '40',
      marginTop: 15,
      paddingTop: 15,
    },
    reactionButton: {
      alignItems: 'center',
      padding: 10,
      borderRadius: 20,
      minWidth: 60,
      backgroundColor: 'transparent',
    },
    activeReaction: {
      backgroundColor: theme.colors.primary + '20',
    },
    reactionEmoji: {
      fontSize: 28,
      marginBottom: 4,
    },
    reactionCount: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    commentContainer: {
      padding: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '30',
      backgroundColor: theme.colors.surface,
      marginHorizontal: 15,
      marginBottom: 8,
      borderRadius: theme.borderRadius.md,
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    commentAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 10,
      borderWidth: 1.5,
      borderColor: theme.colors.primary + '20',
    },
    commentAvatarPlaceholder: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.colors.primary + '20',
    },
    commentAvatarText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    commentAuthor: {
      fontWeight: '600',
      marginRight: 8,
      fontSize: 15,
      color: theme.colors.text,
    },
    commentTimestamp: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    commentContent: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.text,
      paddingLeft: 46,
    },
    commentInputContainer: {
      padding: 16,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '40',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      marginTop: 10,
    },
    commentInput: {
      flex: 1,
      borderWidth: 1.5,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 12,
      minHeight: 44,
      fontSize: 15,
    },
    commentButton: {
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 22,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    commentButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 15,
    },
    voiceNoteContainer: {
      marginVertical: 15,
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
    pollContainer: {
      marginVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pollQuestion: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    pollOption: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pollOptionVoted: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    pollOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    pollOptionEmoji: {
      fontSize: 20,
      marginRight: theme.spacing.sm,
    },
    pollOptionText: {
      fontSize: 15,
      color: theme.colors.text,
      fontWeight: '500',
      flex: 1,
    },
    pollOptionStats: {
      marginTop: theme.spacing.xs,
    },
    pollOptionPercentage: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    pollOptionBar: {
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    pollOptionBarFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 3,
    },
    pollTotalVotes: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
  });

  const fetchPost = async () => {
    try {
      setLoading(true);
      console.log('Fetching post with ID:', postId);
      
      if (!postId) {
        console.error('PostId is undefined or empty');
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Post ID is missing',
        });
        setLoading(false);
        return;
      }
      
      const response = await postsAPI.getPost(postId);
      console.log('Post API response:', JSON.stringify(response, null, 2));
      
      // Handle different response structures
      // Backend returns: { success: true, post: {...} }
      // Some APIs might return: { success: true, data: {...} }
      let postData = null;
      if (response.success) {
        postData = (response as any).post || response.data;
      }
      
      if (postData) {
        console.log('Post data found:', postData);
        setPost(postData);
        const comments = postData.comments || [];
        const transformedComments: CommentItem[] = comments.map((comment: any) => ({
          type: 'comment',
          _id: comment._id,
          author: comment.author,
          content: comment.content || comment.text,
          createdAt: comment.createdAt
        }));
        setData(transformedComments);
      } else {
        console.error('Post not found or invalid response:', response);
        Toast.show({
          type: 'error',
          text1: 'Post not found',
          text2: response.message || 'The post you are looking for does not exist',
        });
      }
    } catch (error: any) {
      console.error('Error fetching post:', error);
      console.error('Error details:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load post details';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleReaction = async (reactionType: Reaction) => {
    try {
      if (!post) return;
      
      // Check if reactions are locked
      if (post.interactions?.reactionsLocked) {
        Toast.show({
          type: 'error',
          text1: 'Reactions Locked',
          text2: 'Reactions are locked on this post',
        });
        return;
      }
      
      let response;
      if (post.userReaction === reactionType) {
        response = await reactionsAPI.removeReaction(postId);
      } else {
        response = await reactionsAPI.addReaction(postId, reactionType);
      }
      
      console.log('Reaction response:', response);
      
      if (response.success && response.reactions) {
        setPost(prevPost => {
          if (!prevPost) return null;
          return {
            ...prevPost,
            reactionCounts: response.reactions || prevPost.reactionCounts,
            userReaction: (response.userReaction as Reaction) || undefined
          };
        });
      } else {
        console.error('Invalid response format:', response);
        fetchPost();
      }
    } catch (error: any) {
      console.error('Error handling reaction:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to update reaction';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;

    // Check if comments are locked
    if (post?.interactions?.commentsLocked) {
      Toast.show({
        type: 'error',
        text1: 'Comments Locked',
        text2: 'Comments are locked on this post',
      });
      return;
    }

    try {
      const response = await postsAPI.addComment(postId, comment);
      if (response.success) {
        // Add comment to state immediately without refetching
        const newComment: CommentItem = {
          type: 'comment',
          _id: (response as any).comment?._id || Date.now().toString(),
          author: {
            _id: user?._id || '',
            username: user?.username || 'You',
            avatar: user?.avatar,
          },
          content: comment,
          createdAt: new Date().toISOString(),
        };
        
        setData(prevData => [...prevData, newComment]);
        setComment('');
        
        // Update post comment count
        if (post) {
          setPost(prevPost => {
            if (!prevPost) return null;
            return {
              ...prevPost,
              comments: [...(prevPost.comments || []), newComment],
            };
          });
        }
      }
    } catch (error: any) {
      console.error('Error adding comment:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to add comment';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  };

  const getVoiceEffectSettings = (effect?: string) => {
    // Apply pitch and rate modifications for different voice effects
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

  const playVoiceNote = async (voiceUrl: string, effect?: string) => {
    try {
      if (isVoicePlaying && voiceSound) {
        await voiceSound.pauseAsync();
        setIsVoicePlaying(false);
        return;
      }

      if (voiceSound) {
        const status = await voiceSound.getStatusAsync();
        if (status.isLoaded) {
          if (status.didJustFinish || (status.durationMillis && status.positionMillis >= status.durationMillis)) {
            await voiceSound.replayAsync();
          } else {
            await voiceSound.playAsync();
          }
          setIsVoicePlaying(true);
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
            setIsVoicePlaying(false);
          }
        }
      );

      setVoiceSound(sound);
      setIsVoicePlaying(true);
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
    const duration = voiceNote.duration || 0;

    return (
      <View style={styles.voiceNoteContainer}>
        <TouchableOpacity
          style={styles.voiceNoteButton}
          onPress={() => playVoiceNote(voiceNote.url, voiceNote.effect)}
          activeOpacity={0.7}
        >
          <View style={styles.playButtonCircle}>
            <Text style={styles.playButtonIcon}>{isVoicePlaying ? '⏸' : '▶'}</Text>
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
                      backgroundColor: isVoicePlaying ? '#00D4AA' : '#555'
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

  const handlePollVote = async (optionIndex: number) => {
    if (!post || !post.poll) return;
    
    try {
      const response: any = await postsAPI.voteOnPoll(post._id, optionIndex);
      
      if (response.success && response.poll) {
        // Update the post with new poll data
        setPost({
          ...post,
          poll: post.poll ? {
            ...post.poll,
            options: response.poll.options,
            totalVotes: response.poll.totalVotes
          } : undefined
        });
        
        Toast.show({
          type: 'success',
          text1: 'Vote Recorded',
          text2: 'Your vote has been counted',
        });
      }
    } catch (error: any) {
      console.error('Poll vote error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to vote',
      });
    }
  };

  const renderPoll = () => {
    if (!post?.poll?.enabled) return null;
    
    const poll = post.poll;

    const userHasVoted = poll.options.some((opt: any) =>
      opt.votes?.some((vote: any) => vote.equals?.(user?._id) || vote === user?._id)
    );

    return (
      <View style={styles.pollContainer}>
        <Text style={styles.pollQuestion}>{poll.question}</Text>
        {poll.options.map((option: any, index: number) => {
          const percentage = poll.totalVotes > 0
            ? Math.round((option.voteCount / poll.totalVotes) * 100)
            : 0;
          const hasVoted = option.votes?.some((vote: any) => 
            vote.equals?.(user?._id) || vote === user?._id
          );

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.pollOption,
                hasVoted && styles.pollOptionVoted
              ]}
              onPress={() => handlePollVote(index)}
              disabled={poll.revealAfterVote && !userHasVoted ? false : false}
            >
              <View style={styles.pollOptionContent}>
                {option.emoji && (
                  <Text style={styles.pollOptionEmoji}>{option.emoji}</Text>
                )}
                <Text style={styles.pollOptionText}>{option.text}</Text>
              </View>
              {(userHasVoted || !poll.revealAfterVote) && (
                <View style={styles.pollOptionStats}>
                  <Text style={styles.pollOptionPercentage}>{percentage}%</Text>
                  <View style={styles.pollOptionBar}>
                    <View
                      style={[
                        styles.pollOptionBarFill,
                        { width: `${percentage}%` }
                      ]}
                    />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <Text style={styles.pollTotalVotes}>
          {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
        </Text>
      </View>
    );
  };

  const renderMedia = (media: Array<{url: string, mimetype?: string, type?: string}> | undefined, legacyImage?: string) => {
    // Handle legacy single image format (content.image)
    if (legacyImage && (!media || media.length === 0)) {
      media = [{
        url: legacyImage,
        type: 'image',
      }];
    }
    
    if (!media || media.length === 0) return null;

    const screenWidth = Dimensions.get('window').width - 70; // Account for padding
    const mediaHeight = screenWidth * 0.75;

    return (
      <View style={styles.mediaContainer}>
        <FlatList
          data={media}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const isVideo = item.type === 'video' || item.mimetype?.startsWith('video/');
            
            return (
              <View style={styles.mediaItem}>
                {isVideo ? (
                  <Video
                    source={{ uri: item.url }}
                    style={[styles.mediaContent, { width: screenWidth, height: mediaHeight }]}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                    onError={(error) => console.log('❌ Video load error:', error, 'URL:', item.url)}
                    onLoad={() => console.log('✅ Video loaded successfully:', item.url)}
                  />
                ) : (
                  <Image
                    source={{ uri: item.url }}
                    style={[styles.mediaContent, { width: screenWidth, height: mediaHeight }]}
                    resizeMode="cover"
                  />
                )}
              </View>
            );
          }}
        />
      </View>
    );
  };

  const ReactionBar = () => {
    if (!post) return null;
    
    const reactionsLocked = post.interactions?.reactionsLocked;
    
    return (
      <View>
        <View style={styles.reactionBar}>
          {Object.entries(REACTION_ICONS).map(([type, emoji]) => (
            <TouchableOpacity
              key={type}
              onPress={() => {
                if (reactionsLocked) {
                  Toast.show({
                    type: 'error',
                    text1: 'Reactions Locked',
                    text2: 'Reactions are locked on this post',
                  });
                  return;
                }
                handleReaction(type as Reaction);
              }}
              disabled={reactionsLocked}
              style={[
                styles.reactionButton,
                post.userReaction === type && styles.activeReaction,
                reactionsLocked && { opacity: 0.4 },
              ]}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              <Text style={styles.reactionCount}>
                {post.reactionCounts?.[type as keyof typeof post.reactionCounts] || 0}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {reactionsLocked && (
          <Text style={{ fontSize: 12, color: theme.colors.error, marginTop: 8, textAlign: 'center' }}>
            🔒 Reactions are locked on this post
          </Text>
        )}
      </View>
    );
  };

  // Memoize the footer component to prevent re-renders that cause keyboard to disappear
  const FooterComponent = useMemo(() => {
    const commentsLocked = post?.interactions?.commentsLocked;
    
    return (
      <View>
        <View style={[styles.commentInputContainer, commentsLocked && { opacity: 0.4 }]}>
          <TextInput
            style={[styles.commentInput, {
              color: theme.colors.text,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            }]}
            value={comment}
            onChangeText={setComment}
            placeholder={commentsLocked ? "Comments are locked" : "Add a comment..."}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            editable={!commentsLocked}
          />
          <TouchableOpacity
            style={[
              styles.commentButton, 
              { backgroundColor: theme.colors.primary },
              commentsLocked && { opacity: 0.4 }
            ]}
            onPress={() => {
              if (commentsLocked) {
                Toast.show({
                  type: 'error',
                  text1: 'Comments Locked',
                  text2: 'Comments are locked on this post',
                });
                return;
              }
              handleComment();
            }}
            disabled={commentsLocked}
          >
            <Text style={styles.commentButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
        {commentsLocked && (
          <Text style={{ 
            fontSize: 12, 
            color: theme.colors.error, 
            textAlign: 'center',
            marginTop: 8,
            marginBottom: 16,
          }}>
            🔒 Comments are locked on this post
          </Text>
        )}
      </View>
    );
  }, [comment, post?.interactions?.commentsLocked, theme.colors]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!post && !loading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
        {/* Header with Back Button */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12 }}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text }}>Post</Text>
        </View>
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Post not found
        </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              marginTop: 20,
              paddingHorizontal: 20,
              paddingVertical: 12,
              backgroundColor: theme.colors.primary,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      {/* Header with Back Button */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 12 }}
        >
          <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text }}>Post</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => `comment-${item._id}`}
        refreshing={refreshing}
        onRefresh={fetchPost}
        ListHeaderComponent={() => {
          if (!post) return null;
          
          return (
            <View style={styles.postContainer}>
              <View style={styles.postHeader}>
                <View style={styles.authorInfo}>
                  {post.author.avatar ? (
                    <Image source={{ uri: convertAvatarUrl(post.author.avatar) || '' }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.avatarText}>
                        {post.author.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.username, { color: theme.colors.text }]}>
                    {post.author.username}
                  </Text>
                </View>
                <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
                  {formatTimeAgo(post.createdAt)}
                </Text>
              </View>
              <Text style={[styles.postCategory, { color: theme.colors.primary }]}>
                #{post.category}
              </Text>
              <Text style={[styles.postContent, { color: theme.colors.text }]}>
                {censorText(post.content.text)}
              </Text>
              {post.content?.voiceNote?.url && renderVoiceNote(post.content.voiceNote)}
              {renderMedia(post.content.media, (post.content as any)?.image)}
              {post.poll?.enabled && renderPoll()}
              <ReactionBar />
            </View>
          );
        }}
        renderItem={({ item }: { item: CommentItem }) => (
          <View style={styles.commentContainer}>
            <View style={styles.commentHeader}>
              {item.author.avatar ? (
                <Image source={{ uri: convertAvatarUrl(item.author.avatar) || '' }} style={styles.commentAvatar} />
              ) : (
                <View style={[styles.commentAvatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.commentAvatarText}>
                    {item.author.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={[styles.commentAuthor, { color: theme.colors.text }]}>
                {item.author.username}
              </Text>
              <Text style={[styles.commentTimestamp, { color: theme.colors.textSecondary }]}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[styles.commentContent, { color: theme.colors.text }]}>
              {censorText(item.content)}
            </Text>
          </View>
        )}
        ListFooterComponent={FooterComponent}
      />
    </SafeAreaView>
  );
};

export default PostDetailScreen;
