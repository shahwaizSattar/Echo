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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { whisperWallAPI, mediaAPI } from '../../services/api';
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
  const [dailyTheme, setDailyTheme] = useState(getDailyTheme());
  const [userStreak, setUserStreak] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [selectedAnimation, setSelectedAnimation] = useState('none');
  
  // Debug: Force Neon Rush theme for testing (remove this later)
  // Uncomment the line below to test Neon Rush theme
  // useEffect(() => { setDailyTheme(getThemeByMood('energetic')); }, []);
  
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
    return () => clearInterval(timer);
  }, []);

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

  const styles = StyleSheet.create({
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
      paddingVertical: 20,
    },
    modalContent: {
      width: SCREEN_WIDTH * 0.9,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      maxHeight: SCREEN_HEIGHT * 0.8,
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
  });

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
              <TouchableWithoutFeedback onPress={() => {}}>
                <ScrollView
                  contentContainerStyle={styles.modalScrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.modalContent}>
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
                    onPress={() => setSelectedAnimation(anim.name)}
                  >
                    <Text>{anim.emoji}</Text>
                    <Text style={styles.animationButtonText}>{anim.label}</Text>
                  </TouchableOpacity>
                ))}
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
          </View>
                </ScrollView>
              </TouchableWithoutFeedback>
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
        onClose={() => setSelectedWhisper(null)}
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
