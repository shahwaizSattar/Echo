import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  Platform,
  Image,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { whisperWallAPI, mediaAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import Toast from 'react-native-toast-message';
import WhisperBubble from '../../components/whisper/WhisperBubble';
import { WhisperTheme } from '../../components/whisper/WhisperTheme';
import WhisperDetailModal from '../../components/whisper/WhisperDetailModal';
import { getDailyTheme, getThemeByMood } from '../../utils/whisperThemes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WhisperWallScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [whispers, setWhispers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWhisper, setSelectedWhisper] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWhisperText, setNewWhisperText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Random');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [selectedAnimation, setSelectedAnimation] = useState<'none' | 'rain' | 'neon' | 'fire' | 'snow' | 'hearts' | 'mist'>('none');
  const [vanishMode, setVanishMode] = useState(false);
  const [vanishDuration, setVanishDuration] = useState<'1hour' | '6hours' | '12hours' | '24hours' | 'custom'>('24hours');
  const [customVanishMinutes, setCustomVanishMinutes] = useState(60);
  const [oneTimePost, setOneTimePost] = useState(false);
  const [vanishingWhispers, setVanishingWhispers] = useState<Set<string>>(new Set());
  
  // Use global theme instead of daily theme
  const dailyTheme = React.useMemo(() => ({
    name: '🎨 Custom Theme',
    backgroundColor: theme.colors.background,
    headerColor: theme.colors.surface,
    textColor: theme.colors.text,
    accentColor: theme.colors.primary,
    bubbleColors: [
      theme.colors.card,
      theme.colors.surface,
      theme.colors.primary + '33',
      theme.colors.secondary + '33',
    ],
    particleType: 'none' as const,
    mood: 'calm' as const,
  }), [theme]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadWhispers();
    updateResetTimer();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Update timer every minute
    const timer = setInterval(updateResetTimer, 60000);
    
    // Check for expired posts every 5 seconds
    const expiryChecker = setInterval(checkExpiredPosts, 5000);
    
    // Initialize socket and listen for events
    const socket = getSocket();
    socket.on('whispers:vanished', handleWhispersVanished);
    socket.on('whispers:new', handleNewWhisper);
    socket.on('whispers:updated', handleWhisperUpdated);
    socket.on('whispers:deleted', handleWhisperDeleted);
    
    return () => {
      clearInterval(timer);
      clearInterval(expiryChecker);
      socket.off('whispers:vanished', handleWhispersVanished);
      socket.off('whispers:new', handleNewWhisper);
      socket.off('whispers:updated', handleWhisperUpdated);
      socket.off('whispers:deleted', handleWhisperDeleted);
    };
  }, []);

  const checkExpiredPosts = () => {
    const now = new Date().getTime();
    setWhispers(prevWhispers => 
      prevWhispers.filter(whisper => {
        if (whisper.vanishMode?.enabled && whisper.vanishMode?.vanishAt) {
          const vanishTime = new Date(whisper.vanishMode.vanishAt).getTime();
          if (vanishTime <= now) {
            console.log('⏱️ Removing expired whisper:', whisper._id);
            return false; // Remove expired post
          }
        }
        return true; // Keep post
      })
    );
  };

  const handleWhispersVanished = (data: { postIds: string[] }) => {
    console.log('🔔 Whispers vanished event:', data.postIds);
    setWhispers(prevWhispers => 
      prevWhispers.filter(whisper => !data.postIds.includes(whisper._id))
    );
  };

  const handleNewWhisper = (data: { whisper: any }) => {
    console.log('🔔 New whisper event:', data.whisper);
    setWhispers(prevWhispers => [data.whisper, ...prevWhispers]);
  };

  const handleWhisperUpdated = (data: { whisper: any }) => {
    console.log('🔔 Whisper updated event:', data.whisper);
    setWhispers(prevWhispers => 
      prevWhispers.map(whisper => 
        whisper._id === data.whisper._id ? data.whisper : whisper
      )
    );
    // Also update selectedWhisper if it's the one being viewed
    setSelectedWhisper((prev: any) => 
      prev?._id === data.whisper._id ? data.whisper : prev
    );
  };

  const handleWhisperDeleted = (data: { postId: string }) => {
    console.log('🔔 Whisper deleted event:', data.postId);
    setWhispers(prevWhispers => 
      prevWhispers.filter(whisper => whisper._id !== data.postId)
    );
    // Close modal if the deleted whisper is currently being viewed
    setSelectedWhisper((prev: any) => 
      prev?._id === data.postId ? null : prev
    );
  };

  const handleWhisperVanish = (whisperId: string) => {
    console.log('✨ Whisper vanished with animation:', whisperId);
    // Remove from list after animation completes
    setTimeout(() => {
      setWhispers(prevWhispers => prevWhispers.filter(w => w._id !== whisperId));
    }, 100);
  };

  const updateResetTimer = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    setTimeUntilReset(`${hours}h ${minutes}m`);
  };

  const loadWhispers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading whispers...');
      const response = await whisperWallAPI.getWhispers();
      console.log('📥 Whispers response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        const whispersList = response.whispers || [];
        console.log('✅ Loaded whispers count:', whispersList.length);
        console.log('✅ Whispers data:', whispersList);
        setWhispers(whispersList);
        console.log('✅ State updated with whispers');
      } else {
        console.error('❌ Failed to load whispers:', response);
      }
    } catch (error: any) {
      console.error('❌ Error loading whispers:', error);
      console.error('❌ Error details:', error.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load whispers',
      });
    } finally {
      setLoading(false);
      console.log('✅ Loading complete, loading state:', false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for bubble
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image',
      });
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleCreateWhisper = async () => {
    if (!newWhisperText.trim() && !selectedImage) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter text or select an image',
      });
      return;
    }

    try {
      setUploadingImage(true);
      console.log('📤 Creating whisper:', { text: newWhisperText, category: selectedCategory, hasImage: !!selectedImage });
      
      let mediaData: any[] = [];
      
      // Upload image if selected
      if (selectedImage) {
        try {
          console.log('📤 Uploading image:', selectedImage);
          
          const uploadResult = await mediaAPI.uploadSingle({
            uri: selectedImage,
            type: 'image/jpeg',
            name: selectedImage.split('/').pop() || 'image.jpg',
          });
          
          console.log('📥 Upload result:', uploadResult);
          
          const fileData = (uploadResult as any).file;
          if (uploadResult.success && fileData) {
            mediaData = [{
              url: fileData.url,
              type: 'image',
              filename: fileData.filename,
              originalName: fileData.originalname || fileData.originalName,
              size: fileData.size,
            }];
            console.log('✅ Media data prepared:', mediaData);
          } else {
            throw new Error('Upload failed: ' + (uploadResult.message || 'Unknown error'));
          }
        } catch (uploadError: any) {
          console.error('❌ Image upload error:', uploadError);
          Toast.show({
            type: 'error',
            text1: 'Upload Failed',
            text2: uploadError.message || 'Failed to upload image',
          });
          setUploadingImage(false);
          return;
        }
      }

      const response = await whisperWallAPI.createWhisper({
        content: { 
          text: newWhisperText,
          media: mediaData,
        },
        category: selectedCategory,
        backgroundAnimation: selectedAnimation,
        vanishMode: vanishMode ? {
          enabled: true,
          duration: vanishDuration,
          customMinutes: vanishDuration === 'custom' ? customVanishMinutes : undefined,
        } : { enabled: false },
        oneTime: {
          enabled: oneTimePost,
        },
      });
      console.log('📥 Create response:', response);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: '✨ Whisper Posted',
          text2: 'Your anonymous whisper is now floating...',
        });
        setNewWhisperText('');
        setSelectedImage(null);
        setSelectedAnimation('none');
        setVanishMode(false);
        setVanishDuration('24hours');
        setCustomVanishMinutes(60);
        setOneTimePost(false);
        setShowCreateModal(false);
        
        // Reload whispers to show the new one
        await loadWhispers();
        
        // Update streak
        setUserStreak(prev => prev + 1);
      } else {
        console.error('❌ Failed to create whisper:', response);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to post whisper',
        });
      }
    } catch (error: any) {
      console.error('❌ Error creating whisper:', error);
      console.error('Error details:', error.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to post whisper',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleReact = async (reactionType: string) => {
    if (!selectedWhisper) return;

    try {
      const response = await whisperWallAPI.reactToWhisper(
        selectedWhisper._id,
        reactionType as any
      );

      if (response.success) {
        const reactions = (response as any).reactions;
        // Update whisper in list
        setWhispers(prev =>
          prev.map(w =>
            w._id === selectedWhisper._id
              ? { ...w, reactions }
              : w
          )
        );
        
        // Update selected whisper
        setSelectedWhisper({
          ...selectedWhisper,
          reactions,
        });

        Toast.show({
          type: 'success',
          text1: '✨ Reacted',
          text2: 'Your reaction was added',
        });
      }
    } catch (error) {
      console.error('Error reacting:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add reaction',
      });
    }
  };

  const categories = [
    { name: 'Random', emoji: '🎲' },
    { name: 'Vent', emoji: '😤' },
    { name: 'Confession', emoji: '🤫' },
    { name: 'Advice', emoji: '💡' },
    { name: 'Gaming', emoji: '🎮' },
    { name: 'Love', emoji: '❤️' },
  ];

  const animations = [
    { name: 'none', emoji: '🚫', label: 'None' },
    { name: 'rain', emoji: '🌧️', label: 'Rain' },
    { name: 'neon', emoji: '⚡', label: 'Neon Flicker' },
    { name: 'fire', emoji: '🔥', label: 'Fire Spark' },
    { name: 'snow', emoji: '❄️', label: 'Snow' },
    { name: 'hearts', emoji: '💕', label: 'Floating Hearts' },
    { name: 'mist', emoji: '🌫️', label: 'Mist / Haze' },
  ];

  // Debug: Log whispers state whenever it changes
  useEffect(() => {
    console.log('🔍 Whispers state changed:', whispers.length, 'whispers');
    console.log('🔍 Whispers:', whispers);
  }, [whispers]);

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dailyTheme.backgroundColor,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: dailyTheme.headerColor + '99',
      alignItems: 'center',
    },
    resetTimer: {
      fontSize: 16,
      fontWeight: '600',
      color: dailyTheme.textColor,
      textAlign: 'center',
    },

    content: {
      flex: 1,
    },
    bubblesContainer: {
      padding: 20,
      minHeight: SCREEN_HEIGHT,
    },
    createButton: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: dailyTheme.accentColor,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    createButtonText: {
      fontSize: 32,
      color: '#fff',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalScrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    modalContent: {
      width: SCREEN_WIDTH * 0.9,
      maxHeight: SCREEN_HEIGHT * 0.85,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      overflow: 'hidden',
    },
    modalInnerScroll: {
      maxHeight: SCREEN_HEIGHT * 0.85,
    },
    modalInnerContent: {
      padding: 24,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    categorySelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 20,
      gap: 10,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    categoryButtonActive: {
      backgroundColor: dailyTheme.accentColor + '33',
      borderColor: dailyTheme.accentColor,
    },
    categoryButtonText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    animationSelector: {
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    animationGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    animationButton: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    animationButtonActive: {
      backgroundColor: dailyTheme.accentColor + '33',
      borderColor: dailyTheme.accentColor,
    },
    animationButtonText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
      minHeight: 120,
      textAlignVertical: 'top',
      marginBottom: 20,
    },
    characterCount: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'right',
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.background,
    },
    postButton: {
      backgroundColor: dailyTheme.accentColor,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.colors.text,
    },
    postButtonText: {
      color: '#fff',
    },
    optionSection: {
      marginBottom: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    durationSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    durationButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    durationButtonActive: {
      backgroundColor: dailyTheme.accentColor,
      borderColor: dailyTheme.accentColor,
    },
    durationButtonText: {
      fontSize: 12,
      color: theme.colors.text,
    },
    durationButtonTextActive: {
      color: '#fff',
      fontWeight: '600',
    },
    customDurationContainer: {
      marginTop: 12,
      padding: 12,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    customDurationLabel: {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 8,
      fontWeight: '600',
    },
    slider: {
      width: '100%',
      height: 40,
    },
    imagePickerContainer: {
      marginBottom: 20,
    },
    imagePickerButton: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: dailyTheme.accentColor + '44',
      borderStyle: 'dashed',
    },
    imagePickerIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    imagePickerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    selectedImageContainer: {
      position: 'relative',
      borderRadius: 12,
      overflow: 'hidden',
    },
    selectedImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
    },
    removeImageButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeImageText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    loadingText: {
      fontSize: 16,
      color: dailyTheme.textColor,
      opacity: 0.7,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
      paddingHorizontal: 40,
    },
    emptyEmoji: {
      fontSize: 80,
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: dailyTheme.textColor,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: dailyTheme.textColor,
      opacity: 0.8,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptyHint: {
      fontSize: 14,
      color: dailyTheme.accentColor,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  }), [theme, dailyTheme]);

  return (
    <View style={styles.container}>
      <WhisperTheme theme={dailyTheme} />
      
      <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
        <View style={styles.header}>
          <Text style={styles.resetTimer}>⏰ Resets in {timeUntilReset}</Text>
        </View>
      </SafeAreaView>

      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={styles.bubblesContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading whispers...</Text>
          </View>
        ) : whispers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>👻</Text>
            <Text style={styles.emptyTitle}>No Whispers Yet</Text>
            <Text style={styles.emptyText}>
              Be the first to share an anonymous whisper!
            </Text>
            <Text style={styles.emptyHint}>
              Tap the + button below to create one
            </Text>
          </View>
        ) : (
          whispers.map((whisper, index) => (
            <WhisperBubble
              key={whisper._id}
              whisper={whisper}
              index={index}
              theme={dailyTheme}
              onPress={() => setSelectedWhisper(whisper)}
              onVanish={() => handleWhisperVanish(whisper._id)}
              shouldVanish={vanishingWhispers.has(whisper._id)}
            />
          ))
        )}
      </Animated.ScrollView>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonText}>+</Text>
      </TouchableOpacity>

      {/* Create Whisper Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          Keyboard.dismiss();
          setShowCreateModal(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView
                  style={styles.modalInnerScroll}
                  contentContainerStyle={styles.modalInnerContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                >
                  <Text style={styles.modalTitle}>✨ Create Whisper</Text>
            
            <View style={styles.categorySelector}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat.name && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <Text style={styles.categoryButtonText}>
                    {cat.emoji} {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Share your whisper anonymously..."
              placeholderTextColor={theme.colors.textSecondary}
              value={newWhisperText}
              onChangeText={setNewWhisperText}
              multiline
              maxLength={500}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
            />
            
            <Text style={styles.characterCount}>
              {newWhisperText.length}/500
            </Text>

            {/* Background Animation Selector */}
            <View style={styles.animationSelector}>
              <Text style={styles.sectionLabel}>Background Animation</Text>
              <View style={styles.animationGrid}>
                {animations.map(anim => (
                  <TouchableOpacity
                    key={anim.name}
                    style={[
                      styles.animationButton,
                      selectedAnimation === anim.name && styles.animationButtonActive,
                    ]}
                    onPress={() => setSelectedAnimation(anim.name as any)}
                  >
                    <Text>{anim.emoji}</Text>
                    <Text style={styles.animationButtonText}>{anim.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Vanish Mode */}
            <View style={styles.optionSection}>
              <View style={styles.optionRow}>
                <View>
                  <Text style={styles.optionLabel}>⏱️ Timed Post (Self-Destruct)</Text>
                  <Text style={styles.optionDescription}>Auto-delete after set time</Text>
                </View>
                <Switch value={vanishMode} onValueChange={setVanishMode} />
              </View>
              {vanishMode && (
                <>
                  <View style={styles.durationSelector}>
                    {['1hour', '6hours', '12hours', '24hours', 'custom'].map(duration => (
                      <TouchableOpacity
                        key={duration}
                        style={[
                          styles.durationButton,
                          vanishDuration === duration && styles.durationButtonActive,
                        ]}
                        onPress={() => setVanishDuration(duration as any)}
                      >
                        <Text style={[
                          styles.durationButtonText,
                          vanishDuration === duration && styles.durationButtonTextActive,
                        ]}>
                          {duration}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {vanishDuration === 'custom' && (
                    <View style={styles.customDurationContainer}>
                      <Text style={styles.customDurationLabel}>
                        Custom: {customVanishMinutes} minutes ({Math.floor(customVanishMinutes / 60)}h {customVanishMinutes % 60}m)
                      </Text>
                      <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={1440}
                        step={1}
                        value={customVanishMinutes}
                        onValueChange={setCustomVanishMinutes}
                        minimumTrackTintColor={theme.colors.primary}
                        maximumTrackTintColor={theme.colors.border}
                      />
                    </View>
                  )}
                </>
              )}
            </View>

            {/* One-Time Post */}
            <View style={styles.optionSection}>
              <View style={styles.optionRow}>
                <View>
                  <Text style={styles.optionLabel}>✨ One-Time View</Text>
                  <Text style={styles.optionDescription}>Disappears after being viewed once</Text>
                </View>
                <Switch value={oneTimePost} onValueChange={setOneTimePost} />
              </View>
            </View>

            {/* Image Picker */}
            <View style={styles.imagePickerContainer}>
              {selectedImage ? (
                <View style={styles.selectedImageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                  <Text style={styles.imagePickerIcon}>📷</Text>
                  <Text style={styles.imagePickerText}>Add Image (Optional)</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.postButton]}
                onPress={() => {
                  Keyboard.dismiss();
                  handleCreateWhisper();
                }}
                disabled={uploadingImage}
              >
                <Text style={[styles.modalButtonText, styles.postButtonText]}>
                  {uploadingImage ? 'Uploading...' : 'Post Whisper'}
                </Text>
              </TouchableOpacity>
            </View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Whisper Detail Modal */}
      <WhisperDetailModal
        key={selectedWhisper?._id || 'no-whisper'}
        visible={!!selectedWhisper}
        whisper={selectedWhisper}
        theme={dailyTheme}
        onClose={() => {
          // If it was a one-time post, mark it for vanishing
          if (selectedWhisper?.oneTime?.enabled) {
            setVanishingWhispers(prev => new Set(prev).add(selectedWhisper._id));
          }
          setSelectedWhisper(null);
        }}
        onReact={handleReact}
        onNext={() => {
          const currentIndex = whispers.findIndex(w => w._id === selectedWhisper?._id);
          console.log('📱 onNext called:', { currentIndex, totalWhispers: whispers.length });
          if (currentIndex < whispers.length - 1) {
            const nextWhisper = whispers[currentIndex + 1];
            console.log('✅ Setting next whisper:', nextWhisper._id);
            setSelectedWhisper(nextWhisper);
          } else {
            console.log('❌ No next whisper available');
          }
        }}
        onPrevious={() => {
          const currentIndex = whispers.findIndex(w => w._id === selectedWhisper?._id);
          console.log('📱 onPrevious called:', { currentIndex, totalWhispers: whispers.length });
          if (currentIndex > 0) {
            const prevWhisper = whispers[currentIndex - 1];
            console.log('✅ Setting previous whisper:', prevWhisper._id);
            setSelectedWhisper(prevWhisper);
          } else {
            console.log('❌ No previous whisper available');
          }
        }}
        hasNext={selectedWhisper ? whispers.findIndex(w => w._id === selectedWhisper._id) < whispers.length - 1 : false}
        hasPrevious={selectedWhisper ? whispers.findIndex(w => w._id === selectedWhisper._id) > 0 : false}
      />
    </View>
  );
};

export default WhisperWallScreen;
