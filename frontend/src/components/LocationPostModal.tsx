import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';

interface LocationPostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => void;
  location: { latitude: number; longitude: number } | null;
}

type PostType = 'text' | 'poll' | 'rating';
type Duration = '1h' | '3h' | '6h' | '12h' | '24h' | 'permanent';
type Radius = '0.5km' | '2km' | '5km' | 'citywide';
type Category = 'Food' | 'Travel' | 'Sports' | 'Music' | 'Technology' | 'Art' | 'Fashion' | 'Gaming';

const LocationPostModal: React.FC<LocationPostModalProps> = ({
  visible,
  onClose,
  onSubmit,
  location,
}) => {
  const { theme } = useTheme();
  const [postType, setPostType] = useState<PostType>('text');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState<Duration>('24h');
  const [radius, setRadius] = useState<Radius>('2km');
  const [rating, setRating] = useState(0);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [category, setCategory] = useState<Category>('Travel');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const postTypes = [
    { id: 'text', icon: '📝', label: 'Text', color: '#00D4AA' },
    { id: 'rating', icon: '⭐', label: 'Review', color: '#FFA500' },
    { id: 'poll', icon: '📊', label: 'Poll', color: '#A855F7' },
  ];

  const durations = [
    { id: '1h', label: '1 Hour', icon: '⏱️' },
    { id: '3h', label: '3 Hours', icon: '⏰' },
    { id: '6h', label: '6 Hours', icon: '🕐' },
    { id: '12h', label: '12 Hours', icon: '🕛' },
    { id: '24h', label: '24 Hours', icon: '📅' },
    { id: 'permanent', label: 'Permanent', icon: '♾️' },
  ];

  const radiusOptions = [
    { id: '0.5km', label: '0.5 km', icon: '🔵', desc: 'Ultra-local' },
    { id: '2km', label: '2 km', icon: '🟣', desc: 'Nearby' },
    { id: '5km', label: '5 km', icon: '🟠', desc: 'Area-wide' },
    { id: 'citywide', label: 'City', icon: '🌐', desc: 'Everyone' },
  ];

  const categories: Category[] = ['Food', 'Travel', 'Sports', 'Music', 'Technology', 'Art', 'Fashion', 'Gaming'];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType('image');
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType('video');
    }
  };

  const removeMedia = () => {
    setMediaUri(null);
    setMediaType(null);
  };

  const handleSubmit = () => {
    if (!location) {
      Alert.alert('Location Required', 'Please enable location services to post');
      return;
    }
    
    const postData = {
      type: postType,
      content,
      duration,
      radius,
      category,
      rating: postType === 'rating' ? rating : undefined,
      pollOptions: postType === 'poll' ? pollOptions.filter(o => o.trim()) : undefined,
      location,
      mediaUri,
      mediaType,
    };
    onSubmit(postData);
    onClose();
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
      paddingBottom: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '40',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 18,
      color: theme.colors.text,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    postTypesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    postTypeButton: {
      width: '31%',
      aspectRatio: 1,
      borderRadius: 16,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.sm,
    },
    postTypeIcon: {
      fontSize: 28,
      marginBottom: 4,
    },
    postTypeLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    textInput: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
      minHeight: 120,
      textAlignVertical: 'top',
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    textInputFocused: {
      borderColor: theme.colors.primary,
    },
    charCounter: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'right',
      marginTop: 4,
    },
    optionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    optionButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: 12,
      borderWidth: 2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    optionIcon: {
      fontSize: 14,
    },
    optionLabel: {
      fontSize: 13,
      fontWeight: '600',
    },
    optionDesc: {
      fontSize: 10,
      marginTop: 2,
    },
    ratingContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
    },
    star: {
      fontSize: 32,
    },
    pollInput: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: theme.spacing.md,
      fontSize: 14,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
    },
    addOptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.sm,
      borderRadius: 12,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      gap: 6,
    },
    submitButton: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    submitGradient: {
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    submitText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    locationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '15',
      padding: theme.spacing.md,
      borderRadius: 12,
      gap: 8,
      marginBottom: theme.spacing.md,
    },
    locationText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    locationToggle: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    locationToggleButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    mediaContainer: {
      marginTop: theme.spacing.md,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    mediaPreview: {
      width: '100%',
      height: 200,
      borderRadius: 12,
    },
    removeMediaButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    mediaButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    mediaButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
  });

  const renderPostTypeContent = () => {
    switch (postType) {
      case 'poll':
        return (
          <View>
            <TextInput
              style={styles.textInput}
              placeholder="What's your question?"
              placeholderTextColor={theme.colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={200}
            />
            <Text style={styles.charCounter}>{content.length}/200</Text>
            
            <View style={{ marginTop: theme.spacing.md }}>
              <Text style={styles.sectionTitle}>Poll Options</Text>
              {pollOptions.map((option, index) => (
                <TextInput
                  key={index}
                  style={styles.pollInput}
                  placeholder={`Option ${index + 1}`}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={option}
                  onChangeText={(text) => {
                    const newOptions = [...pollOptions];
                    newOptions[index] = text;
                    setPollOptions(newOptions);
                  }}
                />
              ))}
              {pollOptions.length < 4 && (
                <TouchableOpacity
                  style={styles.addOptionButton}
                  onPress={() => setPollOptions([...pollOptions, ''])}
                >
                  <Text style={{ fontSize: 18 }}>➕</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                    Add Option
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case 'rating':
        return (
          <View>
            <TextInput
              style={styles.textInput}
              placeholder="Share your review..."
              placeholderTextColor={theme.colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={300}
            />
            <Text style={styles.charCounter}>{content.length}/300</Text>
            
            <View style={{ marginTop: theme.spacing.md }}>
              <Text style={styles.sectionTitle}>Your Rating</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Text style={styles.star}>{star <= rating ? '⭐' : '☆'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      default:
        return (
          <View>
            <TextInput
              style={styles.textInput}
              placeholder="What's happening here?"
              placeholderTextColor={theme.colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={500}
            />
            <Text style={styles.charCounter}>{content.length}/500</Text>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📍 Post to Location</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Post Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Post Type</Text>
              <View style={styles.postTypesGrid}>
                {postTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.postTypeButton,
                      {
                        borderColor: postType === type.id ? type.color : theme.colors.border,
                        backgroundColor: postType === type.id ? type.color + '15' : 'transparent',
                      },
                    ]}
                    onPress={() => setPostType(type.id as PostType)}
                  >
                    <Text style={styles.postTypeIcon}>{type.icon}</Text>
                    <Text
                      style={[
                        styles.postTypeLabel,
                        { color: postType === type.id ? type.color : theme.colors.text },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Content Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Content</Text>
              {renderPostTypeContent()}
              
              {/* Media Upload */}
              {mediaUri ? (
                <View style={styles.mediaContainer}>
                  {mediaType === 'image' ? (
                    <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
                  ) : (
                    <Video
                      source={{ uri: mediaUri }}
                      style={styles.mediaPreview}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                    />
                  )}
                  <TouchableOpacity style={styles.removeMediaButton} onPress={removeMedia}>
                    <Text style={{ color: '#FFF', fontSize: 18 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.mediaButtons}>
                  <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                    <Text style={{ fontSize: 20 }}>🖼️</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                      Add Image
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
                    <Text style={{ fontSize: 20 }}>🎥</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                      Add Video
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Duration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duration</Text>
              <View style={styles.optionsRow}>
                {durations.map((dur) => (
                  <TouchableOpacity
                    key={dur.id}
                    style={[
                      styles.optionButton,
                      {
                        borderColor: duration === dur.id ? theme.colors.primary : theme.colors.border,
                        backgroundColor: duration === dur.id ? theme.colors.primary + '15' : 'transparent',
                      },
                    ]}
                    onPress={() => setDuration(dur.id as Duration)}
                  >
                    <Text style={styles.optionIcon}>{dur.icon}</Text>
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: duration === dur.id ? theme.colors.primary : theme.colors.text },
                      ]}
                    >
                      {dur.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.optionsRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.optionButton,
                      {
                        borderColor: category === cat ? theme.colors.primary : theme.colors.border,
                        backgroundColor: category === cat ? theme.colors.primary + '15' : 'transparent',
                      },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: category === cat ? theme.colors.primary : theme.colors.text },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Radius */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Visibility Radius</Text>
              <View style={styles.optionsRow}>
                {radiusOptions.map((rad) => (
                  <TouchableOpacity
                    key={rad.id}
                    style={[
                      styles.optionButton,
                      {
                        borderColor: radius === rad.id ? theme.colors.primary : theme.colors.border,
                        backgroundColor: radius === rad.id ? theme.colors.primary + '15' : 'transparent',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      },
                    ]}
                    onPress={() => setRadius(rad.id as Radius)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.optionIcon}>{rad.icon}</Text>
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: radius === rad.id ? theme.colors.primary : theme.colors.text },
                        ]}
                      >
                        {rad.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.optionDesc,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {rad.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={
              !content.trim() && 
              !(postType === 'poll' && pollOptions.filter(o => o.trim()).length >= 2) &&
              !(postType === 'rating' && rating > 0)
            }
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary || theme.colors.primary]}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={{ fontSize: 20 }}>🚀</Text>
              <Text style={styles.submitText}>Post to Area</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LocationPostModal;
