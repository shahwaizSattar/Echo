import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ParticleNoiseReveal from './ParticleNoiseReveal';
import { postsAPI } from '../services/api';
import Toast from 'react-native-toast-message';
import { getFullMediaUrl, handleMediaError } from '../utils/mediaUtils';

interface OneTimePostCardProps {
  post: any;
  onReveal?: (postId: string) => void;
}

const OneTimePostCard: React.FC<OneTimePostCardProps> = ({ post, onReveal }) => {
  const { theme } = useTheme();
  const [revealed, setRevealed] = useState(false);
  const [revealing, setRevealing] = useState(false);

  const handleReveal = async () => {
    if (revealed || revealing) return;
    
    setRevealing(true);
    setRevealed(true);
    
    try {
      // Mark as viewed on backend
      await postsAPI.markOneTimeViewed(post._id);
      
      Toast.show({
        type: 'info',
        text1: '✨ Post Revealed',
        text2: 'This post will disappear after refresh',
        visibilityTime: 3000,
      });
      
      if (onReveal) {
        onReveal(post._id);
      }
    } catch (error) {
      console.error('Failed to mark post as viewed:', error);
    } finally {
      setRevealing(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    oneTimeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 107, 53, 0.15)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    oneTimeBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FF6B35',
      marginLeft: 4,
    },
    mediaContainer: {
      position: 'relative',
      width: '100%',
      height: 250,
      marginVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
    },
    blurredMedia: {
      width: '100%',
      height: '100%',
    },
    blurOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    revealButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    revealButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    normalText: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
  });

  return (
    <View style={styles.container}>
      {/* One-Time Badge */}
      {!revealed && (
        <View style={styles.oneTimeBadge}>
          <Text style={styles.oneTimeBadgeText}>✨ ONE-TIME VIEW</Text>
        </View>
      )}

      {/* Media Section */}
      {post.content?.media && post.content.media.length > 0 && (
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: getFullMediaUrl(post.content.media[0].url) }}
            style={styles.blurredMedia}
            blurRadius={revealed ? 0 : 25}
            onError={(error) => handleMediaError(error, 'image', post.content.media[0].url)}
          />
          {!revealed && (
            <View style={styles.blurOverlay}>
              <TouchableOpacity
                style={styles.revealButton}
                onPress={handleReveal}
                disabled={revealing}
              >
                <Text style={styles.revealButtonText}>
                  {revealing ? '⏳ Revealing...' : '👁️ Tap to Reveal'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Caption Section */}
      {post.content?.text && (
        revealed ? (
          <Text style={styles.normalText}>{post.content.text}</Text>
        ) : (
          <ParticleNoiseReveal
            text={post.content.text}
            onReveal={handleReveal}
            revealed={revealed}
          />
        )
      )}
    </View>
  );
};

export default OneTimePostCard;
