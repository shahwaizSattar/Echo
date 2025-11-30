import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  FlatList,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { postsAPI, userAPI } from '../../services/api';
import { reactionsAPI } from '../../services/reactions';
import { RootStackParamList } from '../../types/navigation';
import Toast from 'react-native-toast-message';
import NotificationBell from '../../components/NotificationBell';
import MessageBell from '../../components/MessageBell';
import ReactionPopup from '../../components/ReactionPopup';
import PostOptions from '../../components/PostOptions';
import UserPostOptions from '../../components/UserPostOptions';
import EditPostModal from '../../components/EditPostModal';
import OneTimePostCard from '../../components/OneTimePostCard';
import { convertAvatarUrl } from '../../utils/imageUtils';
import { censorText } from '../../utils/censorUtils';
import { formatTimeAgo } from '../../utils/timeUtils';
import ModeratedContent from '../../components/moderation/ModeratedContent';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type ReactionType = 'funny' | 'rage' | 'shock' | 'relatable' | 'love' | 'thinking';

const REACTION_ICONS: Record<ReactionType, string> = {
  funny: '😂',
  rage: '😡',
  shock: '😱',
  relatable: '💯',
  love: '❤️',
  thinking: '🤔',
};

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [reactionPopup, setReactionPopup] = useState<{
    visible: boolean;
    postId: string;
    position: { x: number; y: number };
  }>({
    visible: false,
    postId: '',
    position: { x: 0, y: 0 },
  });
  const buttonPositions = useRef<{ [key: string]: { x: number; y: number; width: number; height: number } }>({});
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [postToEdit, setPostToEdit] = useState<any>(null);
  const postCardRefs = useRef<{ [key: string]: Animated.Value }>({});
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [voiceNotePlaying, setVoiceNotePlaying] = useState<{ [key: string]: boolean }>({});
  const [voiceSounds, setVoiceSounds] = useState<{ [key: string]: Audio.Sound }>({});
  const [undoAction, setUndoAction] = useState<{
    type: 'mute' | 'hide' | null;
    userId?: string;
    postId?: string;
    username?: string;
    timeout?: NodeJS.Timeout;
    removedPosts?: any[];
  }>({ type: null });
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Scroll ref for scroll to top functionality
  const scrollViewRef = useRef<ScrollView>(null);

  const loadPosts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading feed posts...');

      const response = await postsAPI.getFeed(1, 20); // API call
      if (response.success) {
        // Note: Backend should filter muted/blocked users, but we can add client-side filtering as backup
        setPosts(response.data || []);
        console.log('✅ Feed loaded:', response.data?.length || 0, 'posts');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load feed',
        });
      }
    } catch (error: any) {
      console.log('❌ Error loading posts:', error);
      const message = error?.response?.data?.message || 'Failed to load feed';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    if (user) {
      setRefreshing(true);
      await loadPosts();
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadPosts();
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        // Reload posts when screen comes into focus
        // This ensures posts from unblocked users appear immediately
        loadPosts();
      }
    }, [user])
  );

  // Listen for tab press to scroll to top and refresh
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, (e: any) => {
      // Scroll to top
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      
      // Refresh feed
      if (user) {
        onRefresh();
      }
    });

    return unsubscribe;
  }, [navigation, user]);

  const showReactionPopup = (postId: string, event?: any) => {
    // Try to measure the button position first
    const buttonRef = likeButtonRefs.current[postId];
    if (buttonRef) {
      (buttonRef as any).measure((fx: number, fy: number, fwidth: number, fheight: number, pageX: number, pageY: number) => {
        setReactionPopup({
          visible: true,
          postId,
          position: { 
            x: pageX + fwidth / 2, // Center of button horizontally
            y: pageY, // Top of button (we'll position popup above this)
          },
        });
      });
    } else {
      // Fallback: use event position or estimate
      let x = Dimensions.get('window').width / 6; // First button is usually at 1/6 of screen
      let y = Dimensions.get('window').height - 200; // Near bottom
      
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

  const handleReaction = async (postId: string, reactionType: 'funny' | 'rage' | 'shock' | 'relatable' | 'love' | 'thinking') => {
    try {
      const post = posts.find(p => p._id === postId);
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
      
      // Track preference if post is outside user's preferences
      if (post.isOutsidePreferences && post.category) {
        try {
          await userAPI.trackPreference(post.category);
          Toast.show({
            type: 'info',
            text1: 'Preference Updated',
            text2: `${post.category} added to your interests`,
            visibilityTime: 2000,
          });
        } catch (error) {
          console.error('Failed to track preference:', error);
        }
      }
      
      let response;
      if (post.userReaction === reactionType) {
        response = await reactionsAPI.removeReaction(postId);
      } else {
        response = await reactionsAPI.addReaction(postId, reactionType);
      }
      
      console.log('Reaction response:', response);
      
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
        console.error('Invalid response format:', response);
        await loadPosts();
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

  const handleReactionSelect = async (reactionType: 'funny' | 'rage' | 'shock' | 'relatable' | 'love' | 'thinking') => {
    if (reactionPopup.postId) {
      await handleReaction(reactionPopup.postId, reactionType);
    }
  };

  const formatTimeRemaining = (vanishAt: string) => {
    const now = new Date();
    const vanishTime = new Date(vanishAt);
    const diff = vanishTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const handleShare = (post: any) => {
    // Simple share functionality - you can enhance this later
    Toast.show({
      type: 'info',
      text1: 'Share',
      text2: `Shared post by @${post.author?.username || 'Unknown'}`,
    });
  };

  const handleMuteUser = (userId: string, username: string) => {
    // Clear any existing undo timeout
    if (undoAction.timeout) {
      clearTimeout(undoAction.timeout);
    }

    // Store removed posts before filtering
    const removedPosts = posts.filter(p => p.author?._id === userId);
    
    // Remove posts from this user immediately
    setPosts(prevPosts => prevPosts.filter(p => p.author?._id !== userId));

    // Show toast with undo option
    Toast.show({
      type: 'info',
      text1: 'All posts muted',
      text2: `All posts from @${username} are now hidden`,
      visibilityTime: 15000,
    });

    // Set undo action with 15 second timeout
    const timeout = setTimeout(async () => {
      try {
        await userAPI.muteUser(userId);
        setUndoAction({ type: null });
      } catch (error) {
        console.error('Failed to mute user:', error);
        // Reload posts if mute fails
        await loadPosts();
      }
    }, 15000);

    setUndoAction({ type: 'mute', userId, username, timeout, removedPosts });
  };

  const handleHidePost = (postId: string) => {
    // Clear any existing undo timeout
    if (undoAction.timeout) {
      clearTimeout(undoAction.timeout);
    }

    // Store the removed post before filtering
    const removedPost = posts.find(p => p._id === postId);
    
    // Remove post immediately
    setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));

    // Show toast with undo option
    Toast.show({
      type: 'info',
      text1: 'Post hidden',
      text2: 'This post has been removed from your feed',
      visibilityTime: 15000,
    });

    // Set undo action with 15 second timeout
    const timeout = setTimeout(async () => {
      try {
        await postsAPI.hidePost(postId);
        setUndoAction({ type: null });
      } catch (error) {
        console.error('Failed to hide post:', error);
        // Reload posts if hide fails
        await loadPosts();
      }
    }, 15000);

    setUndoAction({ type: 'hide', postId, timeout, removedPosts: removedPost ? [removedPost] : [] });
  };

  const handleBlockUser = async (userId: string, username: string) => {
    try {
      await userAPI.blockUser(userId);
      
      // Remove all posts and messages from this user
      setPosts(prevPosts => prevPosts.filter(p => p.author?._id !== userId));
      
      Toast.show({
        type: 'success',
        text1: 'User blocked',
        text2: `@${username} has been blocked. You can unblock them from your profile.`,
        visibilityTime: 5000,
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

  const handleUndo = async () => {
    if (!undoAction.type) return;

    // Clear the timeout
    if (undoAction.timeout) {
      clearTimeout(undoAction.timeout);
    }

    // Restore the removed posts
    if (undoAction.removedPosts && undoAction.removedPosts.length > 0) {
      setPosts(prevPosts => {
        // Merge removed posts back in, maintaining chronological order
        const allPosts = [...prevPosts, ...undoAction.removedPosts!];
        // Sort by creation date (newest first)
        return allPosts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }

    Toast.show({
      type: 'success',
      text1: 'Action undone',
      text2: undoAction.type === 'mute' ? 'Posts restored' : 'Post restored',
    });

    setUndoAction({ type: null });
  };



  const handleCategoryFilter = async (category: string) => {
    try {
      setLoading(true);
      setActiveCategory(category);
      
      console.log('🔍 Filtering posts by category:', category);
      // Get posts by category using explore endpoint
      const response = await postsAPI.getExplorePosts(1, 50, category, 'recent');
      console.log('📊 Category filter response:', response);
      if (response.success && response.data) {
        console.log('✅ Found', response.data.length, 'posts in category:', category);
        setFilteredPosts(response.data);
      } else {
        console.log('❌ No posts found or request failed');
        setFilteredPosts([]);
      }
    } catch (error) {
      console.log('❌ Error filtering by category:', error);
      setFilteredPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const clearCategoryFilter = () => {
    setActiveCategory(null);
    setFilteredPosts([]);
  };

  // Search handler with debounce
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Show dropdown immediately
    setShowSearchDropdown(true);
    setIsSearching(true);

    // Debounce search by 200ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const isUserSearch = query.startsWith('@');
        const isHashtagSearch = query.startsWith('#');
        const searchTerm = isUserSearch || isHashtagSearch ? query.slice(1) : query;

        let results: any[] = [];

        // Search users and posts
        const [userResponse, postResponse] = await Promise.all([
          userAPI.searchUsers(searchTerm, 1, isUserSearch ? 8 : 4),
          postsAPI.searchPosts(searchTerm, 1, isUserSearch ? 0 : 8),
        ]);

        // Add user results
        if (userResponse.success && userResponse.data) {
          results = [
            ...results,
            ...userResponse.data.map((user: any) => ({
              type: 'user',
              data: user,
            })),
          ];
        }

        // Add post results
        if (postResponse.success && postResponse.data) {
          results = [
            ...results,
            ...postResponse.data.map((post: any) => ({
              type: 'post',
              data: post,
            })),
          ];
        }

        // Add category suggestions
        const categories = ['tech', 'sports', 'music', 'gaming', 'food', 'travel', 'art', 'fashion'];
        const matchingCategories = categories.filter(cat => 
          cat.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matchingCategories.length > 0 && !isUserSearch) {
          results = [
            ...matchingCategories.map(cat => ({
              type: 'category',
              data: { name: cat },
            })),
            ...results,
          ];
        }

        // Add hashtag suggestion
        if (isHashtagSearch && searchTerm.length > 0) {
          results = [
            {
              type: 'hashtag',
              data: { tag: searchTerm },
            },
            ...results,
          ];
        }

        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);
  };

  const handleSearchResultClick = (result: any) => {
    if (result.type === 'user') {
      navigation.navigate('UserProfile', { username: result.data.username });
    } else if (result.type === 'post') {
      navigation.navigate('PostDetail', { postId: result.data._id });
    } else if (result.type === 'category') {
      handleCategoryFilter(result.data.name);
    } else if (result.type === 'hashtag') {
      // For hashtag, just filter by the tag as a category
      handleCategoryFilter(result.data.tag);
    }
    
    // Close dropdown and clear search
    setShowSearchDropdown(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);



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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undoAction.timeout) {
        clearTimeout(undoAction.timeout);
      }
    };
  }, [undoAction.timeout]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      ...theme.shadows.small,
      minHeight: 60,
      justifyContent: 'center',
    },
    headerContent: { 
      flexDirection: 'row', 
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
      minWidth: 100,
      maxWidth: '35%',
    },
    avatarContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
      overflow: 'hidden',
    },
    avatarImage: { width: 40, height: 40, borderRadius: 20 },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
    usernameText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flexShrink: 1,
    },

    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
      justifyContent: 'flex-end',
      minWidth: 80,
      marginLeft: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.small,
    },
    iconText: {
      fontSize: 20,
    },
    content: { flex: 1, paddingHorizontal: 0, paddingVertical: 0 },
    placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderIcon: { fontSize: 80, marginBottom: theme.spacing.lg },
    placeholderTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    placeholderText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: theme.spacing.xl,
    },
    startButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.medium,
    },
    startButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textInverse,
    },
    streakContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      alignSelf: 'flex-start',
      marginTop: theme.spacing.sm,
    },
    streakEmoji: { fontSize: 16 },
    streakText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
      marginLeft: theme.spacing.sm,
    },
    postCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 0,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      marginHorizontal: 0,
      ...theme.shadows.small,
      borderWidth: 0,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '60',
      overflow: 'visible',
      width: '100%',
    },
    postCardGlow: {
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 8,
    },
    postCategory: { fontSize: 12, fontWeight: '600', marginBottom: theme.spacing.sm },
    postText: { 
      fontSize: 16, 
      lineHeight: 24, 
      marginBottom: theme.spacing.md,
      color: theme.colors.text,
    },
    postMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    postDate: { fontSize: 12 },
    postReactions: { flexDirection: 'row', alignItems: 'center' },
    reactionText: { fontSize: 12, marginLeft: theme.spacing.sm },
    commentButton: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    commentButtonText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '600',
    },
    mediaContainer: { 
      marginVertical: theme.spacing.md,
      marginHorizontal: -theme.spacing.lg, // Negative margin to extend beyond post padding
      alignItems: 'center',
      justifyContent: 'center',
      width: Dimensions.get('window').width,
    },
    mediaItem: { marginRight: theme.spacing.sm },
    mediaContent: {
      height: 200,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
    },
    videoContainer: { borderRadius: theme.borderRadius.md, overflow: 'hidden' },
    postHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '40',
    },
    authorInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { 
      width: 44, 
      height: 44, 
      borderRadius: 22, 
      marginRight: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.primary + '30',
    },
    avatarPlaceholder: { 
      width: 44, 
      height: 44, 
      borderRadius: 22, 
      marginRight: theme.spacing.sm, 
      justifyContent: 'center', 
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary + '30',
    },
    username: { 
      fontSize: 16, 
      fontWeight: '600',
      color: theme.colors.text,
    },
    reactionEmoji: { fontSize: 20, marginRight: theme.spacing.xs },
    postTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    whisperTag: {
      fontSize: 12,
      fontWeight: '600',
      backgroundColor: 'rgba(255, 107, 53, 0.1)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    hashtagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.xs,
    },
    hashtag: {
      fontSize: 12,
      fontWeight: '500',
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '40',
      marginTop: theme.spacing.sm,
      paddingTop: 4,
      alignItems: 'center',
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.md,
      flex: 1,
      minHeight: 36,
    },
    activeActionBtn: {
      backgroundColor: theme.colors.primary + '15',
    },
    actionBtnIcon: {
      fontSize: 18,
      marginRight: 6,
    },
    actionBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginRight: 4,
    },
    actionBtnCount: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    undoContainer: {
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 2000,
    },
    undoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.large,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    undoIcon: {
      fontSize: 20,
      marginRight: theme.spacing.sm,
      color: theme.colors.primary,
    },
    undoText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    categoryFilterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.primary + '15',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary + '30',
    },
    categoryFilterContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    categoryFilterIcon: {
      fontSize: 20,
      marginRight: theme.spacing.sm,
    },
    categoryFilterText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
      marginRight: theme.spacing.sm,
    },
    categoryFilterCount: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    categoryFilterClose: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryFilterCloseText: {
      fontSize: 18,
      color: theme.colors.text,
      fontWeight: 'bold',
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
      height: 40,
    },
    searchIcon: {
      fontSize: 16,
      marginRight: 8,
      color: theme.colors.textSecondary,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.text,
      paddingVertical: 0,
      height: 40,
    },
    clearButton: {
      padding: 4,
    },
    clearButtonText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    searchBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
    },
    searchDropdown: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.xs,
      maxHeight: 400,
      ...theme.shadows.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
      zIndex: 1000,
    },
    searchResultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '40',
    },
    searchResultIcon: {
      fontSize: 24,
      marginRight: theme.spacing.md,
    },
    searchResultContent: {
      flex: 1,
    },
    searchResultTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    searchResultSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    searchLoadingText: {
      padding: theme.spacing.lg,
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    searchEmptyText: {
      padding: theme.spacing.lg,
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    voiceNoteContainer: {
      marginVertical: theme.spacing.md,
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

  const playVoiceNote = async (postId: string, voiceUrl: string, effect?: string) => {
    try {
      // If already playing, pause it
      if (voiceNotePlaying[postId] && voiceSounds[postId]) {
        await voiceSounds[postId].pauseAsync();
        setVoiceNotePlaying(prev => ({ ...prev, [postId]: false }));
        return;
      }

      // If sound exists but not playing, check if finished and replay
      if (voiceSounds[postId]) {
        const status = await voiceSounds[postId].getStatusAsync();
        if (status.isLoaded) {
          // If finished, replay from start
          if (status.didJustFinish || (status.durationMillis && status.positionMillis >= status.durationMillis)) {
            await voiceSounds[postId].replayAsync();
          } else {
            await voiceSounds[postId].playAsync();
          }
          setVoiceNotePlaying(prev => ({ ...prev, [postId]: true }));
        }
        return;
      }

      // Create new sound with voice effect settings
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

  const renderVoiceNote = (voiceNote: { url: string; effect?: string; duration?: number }) => {
    const postId = 'voice_' + voiceNote.url;
    const isPlaying = voiceNotePlaying[postId] || false;
    const duration = voiceNote.duration || 0;
    
    console.log('🎤 Rendering voice note:', { 
      url: voiceNote.url, 
      duration, 
      effect: voiceNote.effect,
      formatted: formatVoiceDuration(duration)
    });

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

  const handlePollVote = async (postId: string, optionIndex: number) => {
    try {
      const response: any = await postsAPI.voteOnPoll(postId, optionIndex);
      
      if (response.success && response.poll) {
        // Update the post in the local state
        setPosts(prevPosts =>
          prevPosts.map(p => {
            if (p._id === postId) {
              return {
                ...p,
                poll: {
                  ...p.poll,
                  options: response.poll.options,
                  totalVotes: response.poll.totalVotes
                }
              };
            }
            return p;
          })
        );
        
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

  const renderPoll = (post: any) => {
    if (!post.poll?.enabled) return null;

    const userHasVoted = post.poll.options.some((opt: any) =>
      opt.votes?.some((vote: any) => vote.equals?.(user?._id) || vote === user?._id)
    );

    return (
      <View style={styles.pollContainer}>
        <Text style={styles.pollQuestion}>{post.poll.question}</Text>
        {post.poll.options.map((option: any, index: number) => {
          const percentage = post.poll.totalVotes > 0
            ? Math.round((option.voteCount / post.poll.totalVotes) * 100)
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
              onPress={(e) => {
                e.stopPropagation();
                handlePollVote(post._id, index);
              }}
              disabled={post.poll.revealAfterVote && !userHasVoted ? false : false}
            >
              <View style={styles.pollOptionContent}>
                {option.emoji && (
                  <Text style={styles.pollOptionEmoji}>{option.emoji}</Text>
                )}
                <Text style={styles.pollOptionText}>{option.text}</Text>
              </View>
              {(userHasVoted || !post.poll.revealAfterVote) && (
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
          {post.poll.totalVotes} {post.poll.totalVotes === 1 ? 'vote' : 'votes'}
        </Text>
      </View>
    );
  };

  const renderMedia = (media: any[], legacyImage?: string) => {
    // Handle legacy single image format (content.image)
    if (legacyImage && (!media || media.length === 0)) {
      media = [{
        url: legacyImage,
        type: 'image',
        filename: 'legacy-image',
        originalName: 'image',
        size: 0
      }];
    }
    
    if (!media || media.length === 0) return null;
    
    console.log('🎬 Rendering media:', media); // Debug log
    
    const screenWidth = Dimensions.get('window').width;
    // Full width of screen (no padding)
    const imageWidth = screenWidth;
    const imageHeight = imageWidth * 0.75; // 4:3 aspect ratio, adjust as needed
    
    return (
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={(e) => e.stopPropagation()}
        style={styles.mediaContainer}
      >
        {media.length === 1 ? (
          // Single image - display centered and full width
          <View style={styles.mediaItem}>
            {media[0].type === 'video' ? (
              <View style={styles.videoContainer}>
                <Video
                  source={{ uri: media[0].url }}
                  style={[styles.mediaContent, { width: imageWidth, height: imageHeight }]}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping={false}
                  shouldPlay={false}
                  isMuted={false}
                  onError={(error) => {
                    console.log('❌ Video load error:', error, 'URL:', media[0].url);
                    console.log('❌ Full error object:', JSON.stringify(error, null, 2));
                  }}
                  onLoad={() => console.log('✅ Video loaded successfully:', media[0].url)}
                  onLoadStart={() => console.log('🔄 Video loading started:', media[0].url)}
                  onReadyForDisplay={() => console.log('📺 Video ready for display:', media[0].url)}
                />
              </View>
            ) : (
              <Image 
                source={{ uri: media[0].url }} 
                style={[styles.mediaContent, { width: imageWidth, height: imageHeight }]} 
                resizeMode="cover"
                onError={(error) => console.log('❌ Image load error:', error.nativeEvent.error, 'URL:', media[0].url)}
                onLoad={() => console.log('✅ Image loaded successfully:', media[0].url)}
              />
            )}
          </View>
        ) : (
          // Multiple images - horizontal scroll
        <FlatList
          data={media}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ alignItems: 'center' }}
          renderItem={({ item }) => {
            console.log('🖼️ Rendering media item:', item); // Debug log
            return (
              <View style={styles.mediaItem}>
                {item.type === 'video' ? (
                  <View style={styles.videoContainer}>
                    <Video
                      source={{ uri: item.url }}
                      style={[styles.mediaContent, { width: imageWidth * 0.9, height: imageHeight * 0.9 }]}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      isLooping={false}
                      shouldPlay={false}
                      isMuted={false}
                      onError={(error) => {
                        console.log('❌ Video load error:', error, 'URL:', item.url);
                        console.log('❌ Full error object:', JSON.stringify(error, null, 2));
                      }}
                      onLoad={() => console.log('✅ Video loaded successfully:', item.url)}
                      onLoadStart={() => console.log('🔄 Video loading started:', item.url)}
                      onReadyForDisplay={() => console.log('📺 Video ready for display:', item.url)}
                    />
                  </View>
                ) : (
                  <Image 
                    source={{ uri: item.url }} 
                      style={[styles.mediaContent, { width: imageWidth * 0.9, height: imageHeight * 0.9 }]} 
                    resizeMode="cover"
                    onError={(error) => console.log('❌ Image load error:', error.nativeEvent.error, 'URL:', item.url)}
                    onLoad={() => console.log('✅ Image loaded successfully:', item.url)}
                  />
                )}
              </View>
            );
          }}
        />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.surface }}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Left: Avatar + Username */}
          <View style={styles.leftSection}>
            <TouchableOpacity 
              onPress={() => user && navigation.navigate('Profile' as never)}
              style={styles.avatarContainer}
            >
            {user?.avatar ? (
                <Image 
                  source={{ uri: convertAvatarUrl(user.avatar) || '' }} 
                  style={styles.avatarImage} 
                  resizeMode="cover"
                  onError={(error) => {
                    console.log('Avatar image failed to load:', error.nativeEvent.error);
                    console.log('Avatar URL:', user.avatar);
                  }}
                />
            ) : (
                <Text style={styles.avatarText}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
            )}
            </TouchableOpacity>
            <Text style={styles.usernameText} numberOfLines={1}>
              {user?.username || 'User'}
            </Text>
          </View>
          
          {/* Center: Search Bar */}
          <View style={{ flex: 1, marginHorizontal: theme.spacing.sm }}>
            <View style={styles.searchInputContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchDropdown(false);
                  }}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Right: Messaging and Notification Icons */}
          <View style={styles.rightSection}>
            <MessageBell />
            <NotificationBell />
          </View>
        </View>
      </View>
      </SafeAreaView>

      {/* Search Backdrop */}
      {showSearchDropdown && (
        <TouchableOpacity
          style={styles.searchBackdrop}
          activeOpacity={1}
          onPress={() => {
            setShowSearchDropdown(false);
            setSearchQuery('');
            setSearchResults([]);
          }}
        />
      )}

      {/* Search Dropdown */}
      {showSearchDropdown && (
        <View style={styles.searchDropdown}>
          <ScrollView style={{ maxHeight: 400 }}>
            {isSearching ? (
              <Text style={styles.searchLoadingText}>Searching...</Text>
            ) : searchResults.length === 0 ? (
              <Text style={styles.searchEmptyText}>No results found</Text>
            ) : (
              searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultItem}
                  onPress={() => handleSearchResultClick(result)}
                >
                  <Text style={styles.searchResultIcon}>
                    {result.type === 'user' ? '👤' : 
                     result.type === 'post' ? '📝' : 
                     result.type === 'category' ? '📂' : '🏷️'}
                  </Text>
                  <View style={styles.searchResultContent}>
                    <Text style={styles.searchResultTitle}>
                      {result.type === 'user' ? `@${result.data.username}` :
                       result.type === 'post' ? result.data.content?.text?.substring(0, 50) + '...' :
                       result.type === 'category' ? `#${result.data.name}` :
                       `#${result.data.tag}`}
                    </Text>
                    <Text style={styles.searchResultSubtitle}>
                      {result.type === 'user' ? result.data.bio?.substring(0, 60) || 'No bio' :
                       result.type === 'post' ? `by @${result.data.author?.username || 'Unknown'}` :
                       result.type === 'category' ? 'Category' :
                       'Hashtag'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* Category Filter Header */}
      {activeCategory && (
        <View style={styles.categoryFilterHeader}>
          <View style={styles.categoryFilterContent}>
            <Text style={styles.categoryFilterIcon}>📂</Text>
            <Text style={styles.categoryFilterText}>#{activeCategory}</Text>
            <Text style={styles.categoryFilterCount}>
              {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
            </Text>
          </View>
          <TouchableOpacity onPress={clearCategoryFilter} style={styles.categoryFilterClose}>
            <Text style={styles.categoryFilterCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {(activeCategory ? filteredPosts : posts).length > 0 ? (
          (activeCategory ? filteredPosts : posts).map(post => (
            (() => {
              // Initialize animation value if not exists
              if (!postCardRefs.current[post._id]) {
                postCardRefs.current[post._id] = new Animated.Value(1);
              }
              const scaleAnim = postCardRefs.current[post._id];
              
              return (
              <Animated.View
                key={post._id}
                style={[
                  styles.postCard,
                  hoveredPost === post._id && styles.postCardGlow,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  onPressIn={() => setHoveredPost(post._id)}
                  onPressOut={() => setHoveredPost(null)}
                  onPress={() => {
                    // Animation sequence: compress -> lift -> navigate
                    Animated.parallel([
                      // Compress post (8% shrink) then expand
                      Animated.sequence([
                        Animated.timing(scaleAnim, {
                          toValue: 0.92,
                          duration: 100,
                          useNativeDriver: true,
                        }),
                        Animated.timing(scaleAnim, {
                          toValue: 1.05,
                          duration: 300,
                          useNativeDriver: true,
                        }),
                      ]),
                      // Darken background
                      Animated.timing(overlayOpacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                      }),
                    ]).start(() => {
                      // Navigate after animation
                      navigation.navigate('PostDetail', { postId: post._id });
                      // Reset after navigation
                      setTimeout(() => {
                        scaleAnim.setValue(1);
                        overlayOpacity.setValue(0);
                      }, 100);
                    });
                  }}
                >
              <View style={styles.postHeader}>
                <View style={styles.authorInfo}>
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      if (post.author?.username) {
                        navigation.navigate('UserProfile', { username: post.author.username });
                      }
                    }} 
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    {post.author?.avatar ? (
                      <Image source={{ uri: convertAvatarUrl(post.author.avatar) || '' }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.avatarText}>{post.author?.username?.charAt(0).toUpperCase() || '?'}</Text>
                      </View>
                    )}
                    <Text style={[styles.username, { color: theme.colors.text }]}>{post.author?.username || 'Unknown User'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.postDate, { color: theme.colors.textSecondary, marginRight: 12 }]}>{formatTimeAgo(post.createdAt)}</Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      // Check if this is the logged-in user's post
                      if (post.author?._id === user?._id) {
                        setUserPostOptions({
                          visible: true,
                          postId: post._id,
                        });
                      } else {
                        setPostOptions({
                          visible: true,
                          postId: post._id,
                          authorId: post.author?._id,
                          authorUsername: post.author?.username,
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
                      <View style={{ 
                        width: 4, 
                        height: 4, 
                        borderRadius: 2, 
                        backgroundColor: theme.colors.text,
                        marginBottom: 3,
                      }} />
                      <View style={{ 
                        width: 4, 
                        height: 4, 
                        borderRadius: 2, 
                        backgroundColor: theme.colors.text,
                        marginBottom: 3,
                      }} />
                      <View style={{ 
                        width: 4, 
                        height: 4, 
                        borderRadius: 2, 
                        backgroundColor: theme.colors.text,
                      }} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.postTags}>
                {post.category && <Text style={[styles.postCategory, { color: theme.colors.primary }]}>#{post.category}</Text>}
                {post.isWhisperWall && (
                  <Text style={[styles.whisperTag, { color: theme.colors.warning || '#FF6B35' }]}>
                    👻 WhisperWall • {formatTimeRemaining(post.expiresAt)}
                  </Text>
                )}
                {post.vanishMode?.enabled && !post.isWhisperWall && (
                  <Text style={[styles.whisperTag, { color: theme.colors.warning || '#FF6B35' }]}>
                    👻 WhisperWall • {formatTimeRemaining(post.vanishMode.vanishAt)}
                  </Text>
                )}
                {post.tags && post.tags.length > 0 && (
                  <View style={styles.hashtagsContainer}>
                    {post.tags.map((tag: string, index: number) => (
                      <Text key={index} style={[styles.hashtag, { color: theme.colors.secondary || '#6B73FF' }]}>
                        #{tag}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
              {/* One-Time Post or Normal Post */}
              {post.oneTime?.enabled ? (
                <OneTimePostCard post={post} />
              ) : (
                <>
                  {post.content?.text && (
                    <ModeratedContent moderation={post.content?.moderation}>
                      <Text style={[styles.postText, { color: theme.colors.text }]} numberOfLines={3}>
                        {censorText(post.content.text)}
                      </Text>
                    </ModeratedContent>
                  )}
                  {post.content?.voiceNote?.url && renderVoiceNote(post.content.voiceNote)}
                  {renderMedia(post.content.media, post.content?.image)}
                  {post.poll?.enabled && renderPoll(post)}
                </>
              )}
              
              {/* Like, Comment Actions */}
              <View style={styles.actionButtons}>
                <View
                  ref={(ref) => {
                    if (ref) {
                      likeButtonRefs.current[post._id] = ref;
                    }
                  }}
                  style={{ flex: 1 }}
                >
                <TouchableOpacity 
                  style={[
                    styles.actionBtn, 
                    post.userReaction && styles.activeActionBtn,
                    post.interactions?.reactionsLocked && { opacity: 0.4 }
                  ]}
                  disabled={post.interactions?.reactionsLocked}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (post.interactions?.reactionsLocked) {
                        Toast.show({
                          type: 'error',
                          text1: 'Reactions Locked',
                          text2: 'Reactions are locked on this post',
                        });
                        return;
                      }
                      showReactionPopup(post._id, e);
                    }}
                >
                  <Text style={styles.actionBtnIcon}>
                    {post.userReaction ? REACTION_ICONS[post.userReaction as ReactionType] : '👍'}
                  </Text>
                  <Text style={styles.actionBtnText}>
                    {post.userReaction 
                      ? (post.userReaction.charAt(0).toUpperCase() + post.userReaction.slice(1))
                      : 'Like'}
                  </Text>
                    {(post.reactionCounts?.total || 0) > 0 && (
                  <Text style={styles.actionBtnCount}>{post.reactionCounts?.total || 0}</Text>
                    )}
                </TouchableOpacity>
                </View>
                
                <View style={{ flex: 1 }}>
                <TouchableOpacity 
                  style={[
                    styles.actionBtn,
                    post.interactions?.commentsLocked && { opacity: 0.4 }
                  ]}
                  disabled={post.interactions?.commentsLocked}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (post.interactions?.commentsLocked) {
                        Toast.show({
                          type: 'error',
                          text1: 'Comments Locked',
                          text2: 'Comments are locked on this post',
                        });
                        return;
                      }
                      navigation.navigate('PostDetail', { postId: post._id });
                    }}
                >
                  <Text style={styles.actionBtnIcon}>💬</Text>
                  <Text style={styles.actionBtnText}>Comment</Text>
                    {(post.comments?.length || 0) > 0 && (
                  <Text style={styles.actionBtnCount}>{post.comments?.length || 0}</Text>
                    )}
                </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.postMeta}>
                <Text style={[styles.reactionText, { color: theme.colors.textSecondary }]}>
                  {post.reactionCounts?.total || 0} likes • {post.comments?.length || 0} comments
                </Text>
                {(post.interactions?.reactionsLocked || post.interactions?.commentsLocked) && (
                  <Text style={{ fontSize: 11, color: theme.colors.error, marginTop: 4 }}>
                    🔒 {post.interactions?.reactionsLocked && post.interactions?.commentsLocked 
                      ? 'Reactions & Comments locked' 
                      : post.interactions?.reactionsLocked 
                        ? 'Reactions locked' 
                        : 'Comments locked'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
              </Animated.View>
              );
            })()
          ))
        ) : loading ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>⏳</Text>
            <Text style={styles.placeholderTitle}>
              {activeCategory ? `Loading ${activeCategory} posts...` : 'Loading your feed...'}
            </Text>
          </View>
        ) : activeCategory ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>📂</Text>
            <Text style={styles.placeholderTitle}>No posts in #{activeCategory}</Text>
            <Text style={styles.placeholderText}>
              There are no posts in this category yet. Try searching for something else or create the first post!
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={clearCategoryFilter}>
              <Text style={styles.startButtonText}>Back to Feed</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>📱</Text>
            <Text style={styles.placeholderTitle}>Your Feed is Ready!</Text>
            <Text style={styles.placeholderText}>Start creating posts and following users to see content from your community appear here.</Text>
            <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('CreatePost')}>
              <Text style={styles.startButtonText}>Create Your First Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Transition Overlay - Darkens background during animation */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            opacity: overlayOpacity,
            zIndex: 1000,
          },
        ]}
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
          loadPosts();
        }}
      />
      
      {/* Undo Button */}
      {undoAction.type && (
        <View style={styles.undoContainer}>
          <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
            <Text style={styles.undoIcon}>↶</Text>
            <Text style={styles.undoText}>Undo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default HomeScreen;

