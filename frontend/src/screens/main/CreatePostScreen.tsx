import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  FlatList,
  Platform,
  StatusBar,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { postsAPI, mediaAPI } from '../../services/api';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { requestAudioPermission } from '../../utils/mediaUtils';

const CreatePostScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  // Create dynamic styles based on theme
  const dynamicStyles = React.useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: 16, 
      backgroundColor: theme.colors.surface, 
      borderBottomWidth: 1, 
      borderBottomColor: theme.colors.border 
    },
    title: { fontSize: 20, fontWeight: '600', color: theme.colors.text },
    postButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    postButtonDisabled: { opacity: 0.5 },
    postButtonText: { color: theme.colors.textInverse, fontWeight: '600' },
    content: { flex: 1, padding: 16 },
    textInput: { 
      backgroundColor: theme.colors.surface, 
      borderRadius: 8, 
      padding: 16, 
      fontSize: 16, 
      color: theme.colors.text, 
      minHeight: 150, 
      marginBottom: 8, 
      borderWidth: 1, 
      borderColor: theme.colors.border, 
      textAlignVertical: 'top' 
    },
    characterCount: { textAlign: 'right', color: theme.colors.textSecondary, fontSize: 12, marginBottom: 24 },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
    sectionDescription: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 12, lineHeight: 20 },
    addMediaButton: { backgroundColor: theme.colors.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    addMediaButtonText: { color: theme.colors.primary, fontSize: 14, fontWeight: '500' },
    mediaItem: { position: 'relative', marginRight: 12 },
    mediaPreviewImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: theme.colors.card },
    removeMediaButton: { position: 'absolute', top: -8, right: -8, backgroundColor: theme.colors.error, borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
    removeMediaButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    categoryItem: { 
      backgroundColor: theme.colors.surface, 
      borderRadius: 8, 
      padding: 12, 
      alignItems: 'center', 
      minWidth: 70, 
      borderWidth: 1, 
      borderColor: theme.colors.border 
    },
    categoryItemSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    categoryIcon: { fontSize: 24, marginBottom: 4 },
    categoryName: { color: theme.colors.text, fontSize: 12, fontWeight: '500' },
    
    // Voice note styles
    voiceControls: { marginTop: 8 },
    voiceButton: { backgroundColor: theme.colors.card, padding: 16, borderRadius: 8, alignItems: 'center' },
    voiceButtonText: { color: theme.colors.text, fontSize: 16, fontWeight: '600' },
    recordingContainer: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: theme.colors.surface, 
      padding: 16, 
      borderRadius: 12,
      gap: 12
    },
    recordingWaveform: { 
      flex: 1, 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 12 
    },
    recordingDot: { 
      width: 12, 
      height: 12, 
      borderRadius: 6, 
      backgroundColor: theme.colors.error 
    },
    recordingBars: { 
      flex: 1, 
      flexDirection: 'row', 
      alignItems: 'center', 
      height: 30, 
      gap: 2 
    },
    recordingBar: { 
      width: 3, 
      backgroundColor: theme.colors.primary, 
      borderRadius: 2 
    },
    recordingTime: { 
      color: theme.colors.text, 
      fontSize: 14, 
      fontWeight: '600',
      minWidth: 45
    },
    stopButton: { 
      width: 48, 
      height: 48, 
      borderRadius: 24, 
      backgroundColor: theme.colors.error, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
    stopButtonText: { 
      color: '#fff', 
      fontSize: 24 
    },
    voiceNotePreview: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border },
    voiceNoteContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: theme.colors.card, padding: 12, borderRadius: 20 },
    playButtonCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    playButtonIcon: { color: theme.colors.textInverse, fontSize: 20, marginLeft: 2 },
    voiceWaveformContainer: { flex: 1, justifyContent: 'center' },
    waveformBars: { flexDirection: 'row', alignItems: 'center', height: 30, gap: 2, marginBottom: 4 },
    waveformBar: { width: 3, borderRadius: 2, opacity: 0.7 },
    voiceNoteFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    voiceNoteDuration: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '500' },
    voiceEffectPreview: { fontSize: 11, color: theme.colors.primary, fontWeight: '600', textTransform: 'capitalize' },
    voiceEffectRow: { marginBottom: 12 },
    voiceEffectLabel: { color: theme.colors.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: '500' },
    effectScroll: { flexGrow: 0 },
    effectButton: { backgroundColor: theme.colors.card, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
    effectButtonSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    effectButtonText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' },
    effectButtonTextSelected: { color: theme.colors.textInverse, fontWeight: '600' },
    removeVoiceButton: { backgroundColor: theme.colors.error, padding: 12, borderRadius: 8, alignItems: 'center' },
    removeVoiceButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    
    // Poll styles
    pollContainer: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border },
    pollQuestionInput: { backgroundColor: theme.colors.card, color: theme.colors.text, padding: 12, borderRadius: 6, marginBottom: 12, fontSize: 16 },
    pollTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    pollTypeButton: { flex: 1, backgroundColor: theme.colors.card, padding: 10, borderRadius: 6, alignItems: 'center' },
    pollTypeButtonSelected: { backgroundColor: theme.colors.primary },
    pollTypeButtonText: { color: theme.colors.text, fontSize: 14, textTransform: 'capitalize' },
    pollOptionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    pollEmojiInput: { backgroundColor: theme.colors.card, color: theme.colors.text, padding: 10, borderRadius: 6, width: 50, textAlign: 'center', fontSize: 18 },
    pollOptionInput: { flex: 1, backgroundColor: theme.colors.card, color: theme.colors.text, padding: 10, borderRadius: 6, fontSize: 14 },
    removePollOption: { color: theme.colors.error, fontSize: 20, fontWeight: 'bold', paddingHorizontal: 8 },
    addPollOptionButton: { backgroundColor: theme.colors.card, padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 8 },
    addPollOptionText: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' },
    pollSettingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
    pollSettingLabel: { color: theme.colors.text, fontSize: 14, flex: 1 },
    
    // Vanish mode styles
    vanishModeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    vanishModeLabel: { color: theme.colors.text, fontSize: 16 },
    vanishOptions: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border },
    durationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    durationButton: { backgroundColor: theme.colors.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
    durationButtonSelected: { backgroundColor: theme.colors.primary },
    durationButtonText: { color: theme.colors.text, fontSize: 14 },
    customTimerContainer: { marginTop: 12 },
    customTimerLabel: { color: theme.colors.text, fontSize: 14, marginBottom: 8 },
    slider: { width: '100%', height: 40 },
    
    // Lock styles
    lockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    lockLabel: { color: theme.colors.text, fontSize: 16 },
  }), [theme]);
  const [postText, setPostText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [visibility, setVisibility] = useState<'normal' | 'disguise'>('normal');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<
    { uri: string; type: string; name: string; mediaType: 'photo' | 'video' | 'audio' }[]
  >([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  
  // Voice note states
  const [voiceNote, setVoiceNote] = useState<{ uri: string; duration: number } | null>(null);
  const [voiceEffect, setVoiceEffect] = useState<'none' | 'deep' | 'robot' | 'soft' | 'glitchy' | 'girly' | 'boyish'>('none');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingInterval = React.useRef<NodeJS.Timeout | null>(null);
  
  // Poll states
  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollType, setPollType] = useState<'yesno' | 'emoji' | 'multi'>('yesno');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<Array<{ text: string; emoji?: string }>>([
    { text: 'Yes' }, { text: 'No' }
  ]);
  const [revealAfterVote, setRevealAfterVote] = useState(false);
  
  // Interaction locks
  const [commentsLocked, setCommentsLocked] = useState(false);
  const [reactionsLocked, setReactionsLocked] = useState(false);
  const categories = [
    { id: 'Gaming', name: 'Gaming', icon: '🎮' },
    { id: 'Education', name: 'Education', icon: '📚' },
    { id: 'Beauty', name: 'Beauty', icon: '💄' },
    { id: 'Fitness', name: 'Fitness', icon: '💪' },
    { id: 'Music', name: 'Music', icon: '🎵' },
    { id: 'Technology', name: 'Technology', icon: '💻' },
    { id: 'Art', name: 'Art', icon: '🎨' },
    { id: 'Food', name: 'Food', icon: '🍕' },
  ];

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll permission is needed.', [{ text: 'OK' }]);
      return false;
    }
    return true;
  };

  const selectMedia = async () => {
    if (Platform.OS === 'web') {
      // Web file upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*';
      input.multiple = true;
      
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
          handleWebFiles(files);
        }
      };
      
      input.click();
    } else {
      // Mobile file picker
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      Alert.alert('Select Media', 'Choose how to add media', [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleWebFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (selectedMedia.length >= 5) {
        Toast.show({ type: 'error', text1: 'Limit Reached', text2: 'Max 5 media per post' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const mediaItem = {
          uri: e.target?.result as string,
          type: file.type,
          name: file.name,
          mediaType: file.type.startsWith('video/') ? 'video' as const : 'photo' as const,
        };
        setSelectedMedia(prev => [...prev, mediaItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) addMediaToSelection(result.assets[0]);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to open camera' });
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets) {
        result.assets.forEach(asset => addMediaToSelection(asset));
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to open gallery' });
    }
  };

  const addMediaToSelection = (asset: any) => {
    if (selectedMedia.length >= 5) {
      Toast.show({ type: 'error', text1: 'Limit Reached', text2: 'Max 5 media per post' });
      return;
    }

    const mediaItem = {
      uri: asset.uri,
      type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
      name: `media_${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
      mediaType: asset.type as 'photo' | 'video',
    };
    setSelectedMedia(prev => [...prev, mediaItem]);
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestAudioPermission();
      if (!hasPermission) {
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer
      recordingInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to start recording' });
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      // Clear timer
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
      
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      const uri = recording.getURI();
      const status = await recording.getStatusAsync();
      
      if (uri) {
        // Use recordingDuration as fallback if status duration is not available
        const durationSeconds = status.durationMillis 
          ? Math.floor(status.durationMillis / 1000) 
          : recordingDuration;
        console.log('Voice note recorded:', { uri, duration: durationSeconds, effect: voiceEffect });
        setVoiceNote({ uri, duration: durationSeconds });
      }
      setRecording(null);
    } catch (err) {
      console.error('Stop recording error:', err);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to stop recording' });
    }
  };

  const playVoiceNote = async () => {
    if (!voiceNote) return;
    
    try {
      // If currently playing, pause
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
        return;
      }

      // If sound exists and is paused, check position and replay if finished
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          // If finished, replay from start
          if (status.didJustFinish || (status.durationMillis && status.positionMillis >= status.durationMillis)) {
            await sound.replayAsync();
          } else {
            await sound.playAsync();
          }
          setIsPlaying(true);
        }
      } else {
        // Create new sound with pitch/rate adjustments based on effect
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        // Apply voice effect settings
        const playbackSettings = getVoiceEffectSettings(voiceEffect);

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: voiceNote.uri },
          { 
            shouldPlay: true,
            ...playbackSettings
          },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Voice playback error:', err);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to play voice note' });
    }
  };

  const getVoiceEffectSettings = (effect: string) => {
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

  const removeVoiceNote = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setVoiceNote(null);
    setVoiceEffect('none');
    setIsPlaying(false);
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.floor(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const addPollOption = () => {
    if (pollOptions.length >= 6) {
      Toast.show({ type: 'error', text1: 'Limit Reached', text2: 'Max 6 options allowed' });
      return;
    }
    setPollOptions([...pollOptions, { text: '', emoji: '' }]);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length <= 2) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Minimum 2 options required' });
      return;
    }
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const updatePollOption = (index: number, field: 'text' | 'emoji', value: string) => {
    const updated = [...pollOptions];
    updated[index][field] = value;
    setPollOptions(updated);
  };

  const handlePost = async () => {
    if (!postText.trim() && selectedMedia.length === 0 && !voiceNote && !pollEnabled) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Add content, media, voice note, or poll' });
      return;
    }
    if (!selectedCategory) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Select a category' });
      return;
    }

    if (pollEnabled) {
      if (!pollQuestion.trim()) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Poll question required' });
        return;
      }
      if (pollOptions.some(opt => !opt.text.trim())) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'All poll options must have text' });
        return;
      }
    }

    setIsCreating(true);
    let uploadedMedia: any[] = [];
    let uploadedVoiceNote: any = null;

    if (selectedMedia.length > 0) {
      setIsUploadingMedia(true);
      try {
        console.log('📤 Uploading media:', selectedMedia);
        const uploadResponse = await mediaAPI.uploadMultiple(selectedMedia as any);
        console.log('📥 Upload response:', uploadResponse);
        if (uploadResponse.success && (uploadResponse as any).files) uploadedMedia = (uploadResponse as any).files;
        else throw new Error(uploadResponse.message || 'Media upload failed');
      } catch (err: any) {
        console.log('❌ Upload error:', err);
        Toast.show({ type: 'error', text1: 'Upload Failed', text2: err.message });
        setIsUploadingMedia(false);
        setIsCreating(false);
        return;
      }
      setIsUploadingMedia(false);
    }

    if (voiceNote) {
      try {
        console.log('🎤 Uploading voice note:', { 
          duration: voiceNote.duration, 
          effect: voiceEffect,
          uri: voiceNote.uri 
        });
        
        const voiceFile: any = {
          uri: voiceNote.uri,
          type: 'audio/m4a',
          name: `voice_${Date.now()}.m4a`,
          mediaType: 'photo' // Workaround for type checking
        };
        const uploadResponse = await mediaAPI.uploadMultiple([voiceFile]);
        
        if (uploadResponse.success && (uploadResponse as any).files?.[0]) {
          uploadedVoiceNote = {
            url: (uploadResponse as any).files[0].url,
            effect: voiceEffect,
            duration: voiceNote.duration
          };
          console.log('✅ Voice note uploaded:', uploadedVoiceNote);
        } else {
          throw new Error('Voice upload failed - no file returned');
        }
      } catch (err: any) {
        console.error('❌ Voice upload error:', err);
        Toast.show({ type: 'error', text1: 'Voice Upload Failed', text2: err.message });
        setIsCreating(false);
        return;
      }
    }

    const postData: any = {
      content: { 
        text: postText.trim() || '', 
        media: uploadedMedia.map((file: any) => ({
          url: file.url,
          type: file.mimetype.startsWith('video/') ? 'video' as const : 
                file.mimetype.startsWith('audio/') ? 'audio' as const : 'image' as const,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size
        })),
        voiceNote: uploadedVoiceNote
      },
      category: selectedCategory,
      visibility,
      poll: pollEnabled ? {
        enabled: true,
        type: pollType,
        question: pollQuestion,
        options: pollOptions.map(opt => ({
          text: opt.text,
          emoji: opt.emoji || undefined,
          votes: [],
          voteCount: 0
        })),
        revealAfterVote,
        isAnonymous: true
      } : { enabled: false },
      interactions: {
        commentsLocked,
        reactionsLocked
      }
    };

    console.log('📝 Creating post with data:', JSON.stringify(postData, null, 2));
    console.log('🎤 Voice note in post data:', postData.content.voiceNote);

    try {
      const response = await postsAPI.createPost(postData);
      console.log('📥 Post creation response:', JSON.stringify(response, null, 2));
      if (response.success) {
        Toast.show({ type: 'success', text1: 'Success', text2: 'Post created!' });
        navigation.goBack();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: response.message || 'Failed to post' });
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Something went wrong';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[dynamicStyles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: theme.colors.textSecondary }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Create Post</Text>
        <TouchableOpacity
          style={[dynamicStyles.postButton, (!postText.trim() && selectedMedia.length === 0 && !voiceNote && !pollEnabled) || !selectedCategory ? dynamicStyles.postButtonDisabled : {}]}
          onPress={handlePost}
          disabled={(!postText.trim() && selectedMedia.length === 0 && !voiceNote && !pollEnabled) || !selectedCategory || isCreating || isUploadingMedia}
        >
          <Text style={dynamicStyles.postButtonText}>{isCreating ? 'Creating...' : 'Post'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={dynamicStyles.content}>
        <TextInput
          style={dynamicStyles.textInput}
          placeholder="What's on your mind?"
          placeholderTextColor={theme.colors.textSecondary}
          value={postText}
          onChangeText={setPostText}
          multiline
          maxLength={2000}
        />
        <Text style={dynamicStyles.characterCount}>{postText.length}/2000</Text>

        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Text style={dynamicStyles.sectionTitle}>Media</Text>
            <TouchableOpacity style={dynamicStyles.addMediaButton} onPress={selectMedia} disabled={selectedMedia.length >= 5}>
              <Text style={dynamicStyles.addMediaButtonText}>📎 Add Media ({selectedMedia.length}/5)</Text>
            </TouchableOpacity>
          </View>

          {selectedMedia.length > 0 && (
            <FlatList
              horizontal
              data={selectedMedia}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={dynamicStyles.mediaItem}>
                  {item.mediaType === 'photo' ? (
                    <Image source={{ uri: item.uri }} style={dynamicStyles.mediaPreviewImage} />
                  ) : (
                    <View style={[dynamicStyles.mediaPreviewImage, { backgroundColor: theme.colors.card, justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ color: theme.colors.text }}>Video</Text>
                    </View>
                  )}
                  <TouchableOpacity style={dynamicStyles.removeMediaButton} onPress={() => removeMedia(index)}>
                    <Text style={dynamicStyles.removeMediaButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Voice Note</Text>
          {!voiceNote ? (
            <View style={dynamicStyles.voiceControls}>
              {!isRecording ? (
                <TouchableOpacity 
                  style={dynamicStyles.voiceButton} 
                  onPress={startRecording}
                >
                  <Text style={dynamicStyles.voiceButtonText}>🎤 Record Voice Note</Text>
                </TouchableOpacity>
              ) : (
                <View style={dynamicStyles.recordingContainer}>
                  <View style={dynamicStyles.recordingWaveform}>
                    <View style={dynamicStyles.recordingDot} />
                    <View style={dynamicStyles.recordingBars}>
                      {[...Array(30)].map((_, i) => (
                        <View 
                          key={i} 
                          style={[
                            dynamicStyles.recordingBar,
                            { 
                              height: 10 + Math.sin((recordingDuration * 5 + i) * 0.5) * 15,
                              opacity: 0.3 + Math.sin((recordingDuration * 3 + i) * 0.3) * 0.5
                            }
                          ]} 
                        />
                      ))}
                    </View>
                    <Text style={dynamicStyles.recordingTime}>{formatDuration(recordingDuration)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={dynamicStyles.stopButton} 
                    onPress={stopRecording}
                  >
                    <Text style={dynamicStyles.stopButtonText}>⏹</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={dynamicStyles.voiceNotePreview}>
              <View style={dynamicStyles.voiceNoteContainer}>
                <TouchableOpacity 
                  style={dynamicStyles.playButtonCircle} 
                  onPress={playVoiceNote}
                >
                  <Text style={dynamicStyles.playButtonIcon}>
                    {isPlaying ? '⏸' : '▶'}
                  </Text>
                </TouchableOpacity>
                
                <View style={dynamicStyles.voiceWaveformContainer}>
                  <View style={dynamicStyles.waveformBars}>
                    {[...Array(20)].map((_, i) => (
                      <View 
                        key={i} 
                        style={[
                          dynamicStyles.waveformBar,
                          { 
                            height: Math.random() * 20 + 10,
                            backgroundColor: isPlaying ? theme.colors.primary : theme.colors.textSecondary
                          }
                        ]} 
                      />
                    ))}
                  </View>
                  <View style={dynamicStyles.voiceNoteFooter}>
                    <Text style={dynamicStyles.voiceNoteDuration}>
                      {voiceNote.duration > 0 ? formatDuration(voiceNote.duration) : '0:00'}
                    </Text>
                    {voiceEffect && voiceEffect !== 'none' && (
                      <Text style={dynamicStyles.voiceEffectPreview}>• {voiceEffect}</Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={dynamicStyles.voiceEffectRow}>
                <Text style={dynamicStyles.voiceEffectLabel}>Voice Effect:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.effectScroll}>
                  {['none', 'deep', 'robot', 'soft', 'glitchy', 'girly', 'boyish'].map(effect => (
                    <TouchableOpacity
                      key={effect}
                      style={[dynamicStyles.effectButton, voiceEffect === effect && dynamicStyles.effectButtonSelected]}
                      onPress={() => setVoiceEffect(effect as any)}
                    >
                      <Text style={[dynamicStyles.effectButtonText, voiceEffect === effect && dynamicStyles.effectButtonTextSelected]}>
                        {effect.charAt(0).toUpperCase() + effect.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <TouchableOpacity style={dynamicStyles.removeVoiceButton} onPress={removeVoiceNote}>
                <Text style={dynamicStyles.removeVoiceButtonText}>✕ Remove Voice Note</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Text style={dynamicStyles.sectionTitle}>Poll</Text>
            <Switch value={pollEnabled} onValueChange={setPollEnabled} />
          </View>
          {pollEnabled && (
            <View style={dynamicStyles.pollContainer}>
              <TextInput
                style={dynamicStyles.pollQuestionInput}
                placeholder="Poll question..."
                placeholderTextColor={theme.colors.textSecondary}
                value={pollQuestion}
                onChangeText={setPollQuestion}
                maxLength={200}
              />
              <View style={dynamicStyles.pollTypeRow}>
                {['yesno', 'emoji', 'multi'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[dynamicStyles.pollTypeButton, pollType === type && dynamicStyles.pollTypeButtonSelected]}
                    onPress={() => setPollType(type as any)}
                  >
                    <Text style={dynamicStyles.pollTypeButtonText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {pollOptions.map((option, index) => (
                <View key={index} style={dynamicStyles.pollOptionRow}>
                  {pollType === 'emoji' && (
                    <TextInput
                      style={dynamicStyles.pollEmojiInput}
                      placeholder="😀"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={option.emoji}
                      onChangeText={(val) => updatePollOption(index, 'emoji', val)}
                      maxLength={2}
                    />
                  )}
                  <TextInput
                    style={dynamicStyles.pollOptionInput}
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={option.text}
                    onChangeText={(val) => updatePollOption(index, 'text', val)}
                    maxLength={100}
                  />
                  {pollOptions.length > 2 && (
                    <TouchableOpacity onPress={() => removePollOption(index)}>
                      <Text style={dynamicStyles.removePollOption}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {pollOptions.length < 6 && (
                <TouchableOpacity style={dynamicStyles.addPollOptionButton} onPress={addPollOption}>
                  <Text style={dynamicStyles.addPollOptionText}>+ Add Option</Text>
                </TouchableOpacity>
              )}
              <View style={dynamicStyles.pollSettingRow}>
                <Text style={dynamicStyles.pollSettingLabel}>Reveal results only after vote</Text>
                <Switch value={revealAfterVote} onValueChange={setRevealAfterVote} />
              </View>
            </View>
          )}
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Interaction Settings</Text>
          <View style={dynamicStyles.lockRow}>
            <Text style={dynamicStyles.lockLabel}>Lock Comments</Text>
            <Switch value={commentsLocked} onValueChange={setCommentsLocked} />
          </View>
          <View style={dynamicStyles.lockRow}>
            <Text style={dynamicStyles.lockLabel}>Lock Reactions</Text>
            <Switch value={reactionsLocked} onValueChange={setReactionsLocked} />
          </View>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Category</Text>
          <View style={dynamicStyles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity key={cat.id} style={[dynamicStyles.categoryItem, selectedCategory === cat.id && dynamicStyles.categoryItemSelected]} onPress={() => setSelectedCategory(cat.id)}>
                <Text style={dynamicStyles.categoryIcon}>{cat.icon}</Text>
                <Text style={dynamicStyles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

export default CreatePostScreen;
