import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  PanResponder,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { whisperWallAPI } from '../../services/api';
import Toast from 'react-native-toast-message';
import { WhisperTheme } from '../../utils/whisperThemes';
import WhisperBackgroundAnimation from './WhisperBackgroundAnimation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WhisperDetailModalProps {
  visible: boolean;
  whisper: any;
  theme: WhisperTheme;
  onClose: () => void;
  onReact: (reactionType: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const REACTIONS = [
  { type: 'funny', emoji: '😂' },
  { type: 'rage', emoji: '😡' },
  { type: 'shock', emoji: '😱' },
  { type: 'relatable', emoji: '💯' },
  { type: 'love', emoji: '❤️' },
  { type: 'thinking', emoji: '🤔' },
];

const WhisperDetailModal: React.FC<WhisperDetailModalProps> = ({
  visible,
  whisper,
  theme: whisperTheme,
  onClose,
  onReact,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}) => {
  const { theme } = useTheme();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(whisper?.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const panX = useRef(new Animated.Value(0)).current;
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Pan responder for swipe gestures (down, left, right)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Capture any significant movement
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        
        if (isVertical && gestureState.dy > 0) {
          // Vertical swipe down
          panY.setValue(gestureState.dy);
          panX.setValue(0);
        } else if (!isVertical) {
          // Horizontal swipe
          panX.setValue(gestureState.dx);
          panY.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        
        console.log('🔄 Swipe detected:', {
          dx: gestureState.dx,
          dy: gestureState.dy,
          isVertical,
          hasNext,
          hasPrevious,
        });
        
        if (isVertical && gestureState.dy > 100) {
          // Swipe down - close modal
          console.log('⬇️ Closing modal');
          onClose();
          setTimeout(() => {
            panY.setValue(0);
            panX.setValue(0);
          }, 300);
        } else if (!isVertical && Math.abs(gestureState.dx) > 50) {
          // Horizontal swipe - reduced threshold to 50px
          if (gestureState.dx > 0 && hasPrevious && onPrevious) {
            // Swipe right - previous post
            console.log('➡️ Going to previous post');
            setSwipeDirection('right');
            Animated.timing(panX, {
              toValue: SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              onPrevious();
            });
          } else if (gestureState.dx < 0 && hasNext && onNext) {
            // Swipe left - next post
            console.log('⬅️ Going to next post');
            setSwipeDirection('left');
            Animated.timing(panX, {
              toValue: -SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              onNext();
            });
          } else {
            // Not enough swipe or no next/previous - spring back
            console.log('↩️ Spring back');
            Animated.spring(panX, {
              toValue: 0,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }).start();
          }
        } else {
          // Not enough swipe - spring back to original position
          Animated.parallel([
            Animated.spring(panY, {
              toValue: 0,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
            Animated.spring(panX, {
              toValue: 0,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  useEffect(() => {
    if (visible) {
      // Mark one-time post as viewed
      if (whisper?.oneTime?.enabled) {
        markAsViewed();
      }
      
      // Determine entry position based on swipe direction
      if (swipeDirection === 'left') {
        // Swiped left, so new post comes from right
        panX.setValue(SCREEN_WIDTH);
      } else if (swipeDirection === 'right') {
        // Swiped right, so new post comes from left
        panX.setValue(-SCREEN_WIDTH);
      } else {
        // Initial open - slide from bottom
        panX.setValue(0);
      }
      
      // Reset other animation values
      scaleAnim.setValue(swipeDirection ? 1 : 0);
      slideAnim.setValue(swipeDirection ? 0 : SCREEN_HEIGHT);
      panY.setValue(0);
      
      // Entry animation
      if (swipeDirection) {
        // Horizontal slide animation
        Animated.spring(panX, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }).start(() => {
          setSwipeDirection(null);
        });
      } else {
        // Initial popup animation
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, whisper]);

  // Update comments when whisper changes
  useEffect(() => {
    if (whisper) {
      setComments(whisper.comments || []);
    }
  }, [whisper]);

  const markAsViewed = async () => {
    try {
      await whisperWallAPI.markWhisperViewed(whisper._id);
      console.log('✅ Marked one-time whisper as viewed:', whisper._id);
    } catch (error) {
      console.error('Error marking whisper as viewed:', error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const response = await whisperWallAPI.addWhisperComment(whisper._id, comment);
      
      if (response.success) {
        const newComment = (response as any).comment;
        setComments([...comments, newComment]);
        setComment('');
        Toast.show({
          type: 'success',
          text1: '💬 Comment Added',
          text2: 'Your anonymous comment was posted',
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add comment',
      });
    } finally {
      setSubmitting(false);
    }
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

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: SCREEN_WIDTH * 0.95,
      maxHeight: SCREEN_HEIGHT * 0.85,
      backgroundColor: whisperTheme.headerColor,
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: whisperTheme.accentColor + '44',
    },
    swipeIndicatorContainer: {
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    swipeIndicator: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: whisperTheme.textColor + '44',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: whisperTheme.accentColor + '33',
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: whisperTheme.accentColor + '33',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    categoryText: {
      fontSize: 14,
      fontWeight: '600',
      color: whisperTheme.textColor,
      marginLeft: 6,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: whisperTheme.accentColor + '33',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 20,
      color: whisperTheme.textColor,
    },
    content: {
      padding: 20,
    },
    whisperImage: {
      width: '100%',
      height: 300,
      borderRadius: 12,
      marginBottom: 20,
    },
    whisperText: {
      fontSize: 18,
      lineHeight: 28,
      color: whisperTheme.textColor,
      marginBottom: 20,
    },
    authorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    authorName: {
      fontSize: 14,
      fontWeight: '600',
      color: whisperTheme.textColor + 'CC',
    },
    timestamp: {
      fontSize: 12,
      color: whisperTheme.textColor + '99',
      marginLeft: 12,
    },
    reactionBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: whisperTheme.accentColor + '33',
      marginBottom: 20,
    },
    reactionButton: {
      alignItems: 'center',
      padding: 8,
    },
    reactionEmoji: {
      fontSize: 24,
    },
    reactionCount: {
      fontSize: 12,
      fontWeight: '600',
      color: whisperTheme.textColor,
      marginTop: 4,
    },
    commentsSection: {
      marginTop: 20,
    },
    commentsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    commentsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: whisperTheme.textColor,
    },
    toggleCommentsButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: whisperTheme.accentColor + '33',
    },
    toggleCommentsText: {
      fontSize: 12,
      fontWeight: '600',
      color: whisperTheme.accentColor,
    },
    commentsList: {
      maxHeight: 200,
    },
    commentItem: {
      backgroundColor: whisperTheme.backgroundColor + 'CC',
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
    },
    commentAuthor: {
      fontSize: 12,
      fontWeight: '600',
      color: whisperTheme.textColor + 'CC',
      marginBottom: 4,
    },
    commentText: {
      fontSize: 14,
      color: whisperTheme.textColor,
      lineHeight: 20,
    },
    commentInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      gap: 8,
    },
    commentInput: {
      flex: 1,
      backgroundColor: whisperTheme.backgroundColor + 'CC',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 14,
      color: whisperTheme.textColor,
      borderWidth: 1,
      borderColor: whisperTheme.accentColor + '33',
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: whisperTheme.accentColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonText: {
      fontSize: 20,
    },
    emptyComments: {
      padding: 20,
      alignItems: 'center',
    },
    emptyCommentsText: {
      fontSize: 14,
      color: whisperTheme.textColor + '99',
      fontStyle: 'italic',
    },
  });

  if (!whisper) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        {/* Background Animation */}
        {whisper?.backgroundAnimation && (
          <WhisperBackgroundAnimation animation={whisper.backgroundAnimation} />
        )}
        
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.modalContent,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: Animated.add(slideAnim, panY) },
                { translateX: panX },
              ],
            },
          ]}
        >
          {/* Swipe Indicator */}
          <View style={styles.swipeIndicatorContainer}>
            <View style={styles.swipeIndicator} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.categoryBadge}>
              <Text style={styles.reactionEmoji}>
                {getCategoryEmoji(whisper.category)}
              </Text>
              <Text style={styles.categoryText}>{whisper.category}</Text>
            </View>
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Whisper Image */}
            {whisper.content?.media && whisper.content.media.length > 0 && (
              <Image
                source={{ uri: whisper.content.media[0].url }}
                style={styles.whisperImage}
                resizeMode="cover"
              />
            )}

            {/* Whisper Content */}
            {whisper.content?.text && (
              <Text style={styles.whisperText}>{whisper.content.text}</Text>
            )}

            {/* Author Info */}
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>👻 {whisper.randomUsername}</Text>
              <Text style={styles.timestamp}>
                {new Date(whisper.createdAt).toLocaleTimeString()}
              </Text>
            </View>

            {/* Reaction Bar */}
            <View style={styles.reactionBar}>
              {REACTIONS.map(reaction => (
                <TouchableOpacity
                  key={reaction.type}
                  style={styles.reactionButton}
                  onPress={() => onReact(reaction.type)}
                >
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  <Text style={styles.reactionCount}>
                    {whisper.reactions?.[reaction.type] || 0}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comments Section */}
            <View style={styles.commentsSection}>
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>
                  💬 Comments ({comments.length})
                </Text>
                <TouchableOpacity
                  style={styles.toggleCommentsButton}
                  onPress={() => setShowComments(!showComments)}
                >
                  <Text style={styles.toggleCommentsText}>
                    {showComments ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showComments && (
                <ScrollView style={styles.commentsList}>
                  {comments.length > 0 ? (
                    comments.map((c: any, index: number) => (
                      <View key={index} style={styles.commentItem}>
                        <Text style={styles.commentAuthor}>
                          👻 {c.randomUsername}
                        </Text>
                        <Text style={styles.commentText}>{c.content}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyComments}>
                      <Text style={styles.emptyCommentsText}>
                        No comments yet. Be the first!
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}

              {/* Comment Input */}
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add anonymous comment..."
                  placeholderTextColor={whisperTheme.textColor + '66'}
                  value={comment}
                  onChangeText={setComment}
                  maxLength={500}
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleAddComment}
                  disabled={submitting || !comment.trim()}
                >
                  <Text style={styles.sendButtonText}>
                    {submitting ? '⏳' : '➤'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default WhisperDetailModal;
