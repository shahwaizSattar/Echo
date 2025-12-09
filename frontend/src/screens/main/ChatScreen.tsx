import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Animated, Pressable, Dimensions, Keyboard, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { chatAPI, mediaAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import Toast from 'react-native-toast-message';
import { getFullMediaUrl, playAudioWithPermission, handleMediaError, requestAudioPermission } from '../../utils/mediaUtils';
// Removed iOS picker fix imports - using direct ImagePicker instead
import ReactionPopup from '../../components/ReactionPopup';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { Audio } from 'expo-av';
import { useMessageNotification } from '../../context/MessageNotificationContext';

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

type ReactionType = 'funny' | 'rage' | 'shock' | 'relatable' | 'love' | 'thinking';

interface Reaction {
  user: string;
  type: ReactionType;
  createdAt: string;
}

interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'audio';
  filename: string;
  originalName: string;
  size: number;
}

interface MessageItem {
  id: string;
  text: string;
  media?: MediaItem[];
  createdAt: string;
  senderId: string;
  reactions?: Reaction[];
  editedAt?: string;
}

const REACTION_ICONS: Record<ReactionType, string> = {
  funny: '😂',
  rage: '😡',
  shock: '😱',
  relatable: '💯',
  love: '❤️',
  thinking: '🤔',
};

const ChatScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<ChatRouteProp>();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { refreshUnreadCount } = useMessageNotification();
  const { peerId, username, avatar } = route.params;

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<{ [key: string]: Audio.Sound }>({});
  const [audioStatus, setAudioStatus] = useState<{ [key: string]: { isPlaying: boolean; duration: number; position: number } }>({});
  const [fullscreenMedia, setFullscreenMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [previewingAudio, setPreviewingAudio] = useState<{ [key: string]: Audio.Sound }>({});
  const listRef = useRef<FlatList<MessageItem>>(null);
  const [actionFor, setActionFor] = useState<{ id: string; text: string; position: { x: number; y: number } } | null>(null);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [reactionPopup, setReactionPopup] = useState<{ visible: boolean; messageId: string; position: { x: number; y: number } }>({ visible: false, messageId: '', position: { x: 0, y: 0 } });
  const blurAnim = useRef(new Animated.Value(0)).current;
  const editingMessageY = useRef(new Animated.Value(0)).current;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    headerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
    headerName: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
    list: { flex: 1 },
    bubbleRow: { paddingHorizontal: theme.spacing.xl, marginVertical: 6 },
    bubble: { padding: 10, borderRadius: 14 },
    bubbleMe: { backgroundColor: theme.colors.primary },
    bubbleOther: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
    bubbleTextMe: { color: theme.colors.textInverse, fontSize: 15 },
    bubbleTextOther: { color: theme.colors.text, fontSize: 15 },
    time: { fontSize: 10, marginTop: 4, opacity: 0.7 },
    reactionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4,
      gap: 4,
    },
    reactionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      gap: 2,
    },
    reactionEmoji: {
      fontSize: 12,
    },
    reactionCount: {
      fontSize: 10,
      fontWeight: '600',
    },
    composerWrap: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      elevation: 10,
    },
    composerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    mediaPreviewContainer: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 4,
      gap: 8,
      flexWrap: 'wrap',
    },
    mediaPreviewItem: {
      width: 80,
      height: 80,
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: theme.colors.background,
    },
    mediaPreviewImage: {
      width: '100%',
      height: '100%',
    },
    removeMediaBtn: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    mediaButton: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginRight: 8,
    },
    messageMedia: {
      marginTop: 8,
      borderRadius: 12,
      overflow: 'hidden',
    },
    messageImage: {
      width: 250,
      height: 250,
      borderRadius: 8,
    },
    messageVideo: {
      width: 250,
      height: 250,
      borderRadius: 8,
    },
    messageAudio: {
      width: '100%',
      height: 50,
    },
    audioContainer: {
      minWidth: 200,
      maxWidth: 280,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 20,
      padding: 12,
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    audioContainerMe: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    audioContainerOther: {
      backgroundColor: 'rgba(0,0,0,0.05)',
    },
    playButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    audioWaveform: {
      flex: 1,
      height: 30,
      justifyContent: 'center',
    },
    audioDuration: {
      fontSize: 11,
      opacity: 0.8,
    },
    audioProgress: {
      fontSize: 10,
      opacity: 0.6,
      marginTop: 2,
    },
    recordingTimer: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: 'monospace',
      color: '#ff4444',
    },
    audioPreviewContainer: {
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 8,
      padding: 8,
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    mediaContainer: {
      marginTop: 4,
      borderRadius: 8,
      overflow: 'hidden',
    },
    videoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    videoPlayButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255,255,255,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    recordButton: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginRight: 8,
    },
    emojiButton: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginRight: 8,
    },
    emojiPickerModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    emojiPickerContainer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingBottom: 40,
      maxHeight: '50%',
    },
    emojiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 16,
      gap: 8,
    },
    emojiItem: {
      fontSize: 32,
      padding: 8,
    },
    attachMenuModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    attachMenuContainer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingVertical: 20,
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    attachMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: theme.colors.background,
    },
    attachMenuIcon: {
      fontSize: 28,
      marginRight: 16,
    },
    attachMenuText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    plusButton: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginRight: 8,
    },
    fullscreenModal: {
      flex: 1,
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullscreenImage: {
      width: '100%',
      height: '100%',
    },
    fullscreenVideo: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height * 0.6,
    },
    fullscreenCloseButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 40,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      elevation: 10,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: Platform.select({ ios: 12, android: 8, default: 10 }),
      marginRight: 10,
    },
    sendBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
    },
    sendText: { color: theme.colors.textInverse, fontWeight: '700' },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await chatAPI.getMessages(peerId, 1, 30);
        const msgsRaw: MessageItem[] = (res.messages || []).map((m: any): MessageItem => ({
          id: m._id || Math.random().toString(36).slice(2),
          text: m.text || '',
          media: m.media || [],
          createdAt: m.createdAt || new Date().toISOString(),
          senderId: m.sender || '',
          reactions: m.reactions || [],
          editedAt: m.editedAt,
        }));
        const msgs = msgsRaw.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setMessages(msgs);
        // Mark messages as read when opening chat
        chatAPI.markRead(peerId).then(() => refreshUnreadCount()).catch(() => {});
      } catch (e: any) {
        console.error('Failed to load messages:', e);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load messages' });
        setMessages([]);
      }
    };
    load();
  }, [peerId]);

  useEffect(() => {
    if (editing || actionFor) {
      Animated.parallel([
        Animated.timing(blurAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.spring(editingMessageY, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(blurAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(editingMessageY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [editing, actionFor]);

  useEffect(() => {
    const socket = getSocket();
    if (user?._id) socket.emit('join-room', user._id);
    const onNewMessage = (payload: any) => {
      try {
        const { sender, message } = payload || {};
        const senderId = String(sender?._id || sender);
        const peer = String(peerId);
        const myId = String(user?._id || '');
        const messageId = message?._id;
        
        // Append only if message is from the peer (not me)
        if (senderId && senderId === peer && senderId !== myId && messageId) {
          setMessages(prev => {
            // Check if message already exists
            const exists = prev.some(m => m.id === messageId);
            if (exists) {
              return prev; // Don't add duplicate
            }
            
            const next = [...prev, { 
              id: messageId, 
              text: message?.text || '', 
              media: message?.media || [], 
              createdAt: message?.createdAt || new Date().toISOString(), 
              senderId: sender?._id || '', 
              reactions: message?.reactions || [] 
            }];
            requestAnimationFrame(() => {
              listRef.current?.scrollToEnd({ animated: true });
            });
            return next;
          });
          // keep thread read while viewing
          chatAPI.markRead(peerId).then(() => refreshUnreadCount()).catch(() => {});
        }
      } catch (e) {}
    };
    socket.on('chat:new-message', onNewMessage);
    const onUpdated = (payload: any) => {
      try {
        const { messageId, text, editedAt, sender } = payload || {};
        if (String(sender?._id || sender) === String(peerId)) {
          setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text, editedAt } : m));
        }
      } catch (e) {}
    };
    const onDeleted = (payload: any) => {
      try {
        const { messageId, sender } = payload || {};
        if (String(sender?._id || sender) === String(peerId)) {
          setMessages(prev => prev.filter(m => m.id !== messageId));
        }
      } catch (e) {}
    };
    const onReacted = (payload: any) => {
      try {
        const { messageId, reactions } = payload || {};
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: reactions || [] } : m));
      } catch (e) {}
    };
    socket.on('chat:new-message', onNewMessage);
    socket.on('chat:message-updated', onUpdated);
    socket.on('chat:message-deleted', onDeleted);
    socket.on('chat:message-reacted', onReacted);
    return () => {
      socket.off('chat:new-message', onNewMessage);
      socket.off('chat:message-updated', onUpdated);
      socket.off('chat:message-deleted', onDeleted);
      socket.off('chat:message-reacted', onReacted);
      if (user?._id) socket.emit('leave-room', user._id);
      
      // Clean up audio players
      Object.values(playingAudio).forEach(async (sound) => {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (e) {}
      });
      
      // Clean up preview audio players
      Object.values(previewingAudio).forEach(async (sound) => {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (e) {}
      });
    };
  }, [peerId, user?._id, playingAudio]);

  // Recording timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1000);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const requestMediaPermissions = async () => {
    try {
      console.log('🔐 Requesting media library permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📸 Media permission response:', { status });
      
      if (status === 'granted') {
        console.log('✅ Media permission granted');
        return true;
      }
      
      Alert.alert('Permission Required', 'Camera roll permission is needed.', [{ text: 'OK' }]);
      return false;
    } catch (error) {
      console.error('❌ Error requesting media permissions:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to request gallery permission' });
      return false;
    }
  };



  const selectMedia = async () => {
    if (Platform.OS === 'web') {
      // Web file upload with better error handling
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*,audio/*';
        input.multiple = true;
        input.style.display = 'none';
        
        // Add to DOM temporarily
        document.body.appendChild(input);
        
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            console.log('🌐 Files selected:', files.length);
            handleWebFiles(files);
          } else {
            console.log('🌐 No files selected');
          }
          // Clean up
          document.body.removeChild(input);
        };
        
        input.oncancel = () => {
          console.log('🌐 File selection canceled');
          document.body.removeChild(input);
        };
        
        // Trigger file picker
        input.click();
      } catch (error) {
        console.error('❌ Web file picker error:', error);
        Toast.show({ 
          type: 'error', 
          text1: 'File Picker Error', 
          text2: 'Failed to open file picker. Please try again.' 
        });
      }
    } else {
      // Mobile file picker - use Alert like CreatePostScreen (which works)
      const hasPermission = await requestMediaPermissions();
      if (!hasPermission) return;

      Alert.alert('Select Media', 'Choose how to add media', [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleWebFiles = (files: FileList) => {
    console.log('🌐 Processing web files:', files.length);
    
    Array.from(files).forEach((file, index) => {
      if (selectedMedia.length >= 5) {
        Toast.show({ type: 'error', text1: 'Limit Reached', text2: 'Max 5 media per message' });
        return;
      }

      console.log(`🌐 Processing web file ${index + 1}:`, {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Validate file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
        Toast.show({ 
          type: 'error', 
          text1: 'Invalid File Type', 
          text2: `${file.name} is not a supported media file` 
        });
        return;
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        Toast.show({ 
          type: 'error', 
          text1: 'File Too Large', 
          text2: `${file.name} exceeds 50MB limit` 
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) {
          console.error('❌ Failed to read file:', file.name);
          Toast.show({ type: 'error', text1: 'Read Error', text2: `Failed to read ${file.name}` });
          return;
        }

        const mediaItem = {
          uri: result,
          type: file.type,
          name: file.name,
          mediaType: file.type.startsWith('video/') ? 'video' as const : 'photo' as const,
        };
        
        console.log('✅ File read successfully:', file.name);
        uploadMediaItem(mediaItem);
      };
      
      reader.onerror = (error) => {
        console.error('❌ FileReader error:', error);
        Toast.show({ type: 'error', text1: 'Read Error', text2: `Failed to read ${file.name}` });
      };
      
      reader.readAsDataURL(file);
    });
  };

  const openCamera = async () => {
    try {
      console.log('📷 Opening camera...');
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false, // Disable editing to prevent iOS issues
        quality: 0.8,
        videoMaxDuration: 60,
        exif: false,
      });

      console.log('📷 Camera result - canceled:', result.canceled, 'assets:', result.assets?.length || 0);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('📷 Camera asset:', result.assets[0]);
        addMediaToSelection(result.assets[0]);
      } else {
        console.log('📷 Camera selection canceled by user');
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to open camera' });
    }
  };

  const openGallery = async () => {
    try {
      console.log('📱 Opening gallery...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false, // Fix the warning about allowsEditing + allowsMultipleSelection
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        exif: false,
      });

      console.log('📱 Gallery result - canceled:', result.canceled, 'assets:', result.assets?.length || 0);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('📱 Selected assets count:', result.assets.length);
        result.assets.forEach((asset, idx) => {
          console.log(`📱 Asset ${idx + 1}:`, asset);
          addMediaToSelection(asset);
        });
      } else {
        console.log('📱 Gallery selection canceled by user');
      }
    } catch (error) {
      console.error('❌ Gallery error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to open gallery' });
    }
  };

  const addMediaToSelection = (asset: any) => {
    if (selectedMedia.length >= 5) {
      Toast.show({ type: 'error', text1: 'Limit Reached', text2: 'Max 5 media per message' });
      return;
    }

    console.log('📸 Media selected:', { uri: asset.uri, type: asset.type });
    
    const mediaItem = {
      uri: asset.uri,
      type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
      name: asset.fileName || `media_${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
      mediaType: asset.type as 'photo' | 'video',
    };
    
    uploadMediaItem(mediaItem);
  };

  const uploadMediaItem = async (mediaItem: any) => {
    try {
      console.log('📤 Uploading media item:', {
        name: mediaItem.name,
        type: mediaItem.type,
        mediaType: mediaItem.mediaType,
        uriLength: mediaItem.uri?.length || 0,
        isDataUrl: mediaItem.uri?.startsWith('data:') || false
      });
      
      setUploading(true);
      
      // Add retry logic for uploads
      let uploadRes;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          uploadRes = await mediaAPI.uploadMultiple([mediaItem]);
          break; // Success, exit retry loop
        } catch (error: any) {
          retryCount++;
          console.warn(`⚠️ Upload attempt ${retryCount} failed:`, error?.message);
          
          if (retryCount >= maxRetries) {
            throw error; // Re-throw on final attempt
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      console.log('📥 Upload response:', {
        success: uploadRes?.success,
        message: uploadRes?.message,
        filesCount: (uploadRes as any)?.files?.length || 0
      });
      
      const responseFiles = (uploadRes as any)?.files;
      
      if (uploadRes?.success && responseFiles && Array.isArray(responseFiles) && responseFiles.length > 0) {
        const uploadedMedia = responseFiles.map((file: any) => {
          const mimeType = file.mimetype || '';
          const mediaUrl = file.url || file.filename || file.path;
          console.log('📎 Uploaded file:', {
            filename: file.filename,
            url: mediaUrl,
            mimetype: mimeType
          });
          
          return {
            url: mediaUrl,
            type: mimeType.startsWith('video/') ? 'video' as const : 
                  mimeType.startsWith('audio/') ? 'audio' as const : 'image' as const,
            filename: file.filename || file.name,
            originalName: file.originalname || file.name,
            size: file.size || 0
          };
        });
        
        console.log('✅ Media uploaded successfully:', uploadedMedia.length, 'files');
        setSelectedMedia(prev => [...prev, ...uploadedMedia]);
        Toast.show({ type: 'success', text1: 'Media added', text2: 'Ready to send' });
      } else {
        const errorMessage = uploadRes?.message || 'Upload returned no files';
        console.error('❌ Upload failed - invalid response:', uploadRes);
        Toast.show({ type: 'error', text1: 'Upload failed', text2: errorMessage });
      }
    } catch (error: any) {
      console.error('❌ Upload error:', {
        fullError: error,
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        responseData: error?.response?.data,
        config: error?.config?.url,
        networkError: error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error'),
      });
      
      let errorMsg = 'Failed to upload media';
      
      // Handle network errors specifically
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
        errorMsg = 'Network error. Please check your connection and try again.';
      } else if (error?.response?.status === 413) {
        errorMsg = 'File too large. Please select a smaller file.';
      } else if (error?.response?.status === 400) {
        errorMsg = error?.response?.data?.message || 'Invalid file format or size.';
      } else if (error?.response?.status === 500) {
        errorMsg = 'Server error. Please try again later.';
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      console.error('📌 Final error message to user:', errorMsg);
      Toast.show({ type: 'error', text1: 'Upload failed', text2: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  const COMMON_EMOJIS = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋',
    '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫',
    '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳',
    '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭',
    '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
    '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '👍', '👎', '👌',
    '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️',
    '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '💪', '🙏', '✍️', '💅',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '⭐', '🌟', '✨', '⚡', '🔥', '💥', '☄️', '🌈', '☀️', '🌤️',
    '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️',
  ];

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
      Toast.show({ type: 'info', text1: 'Recording...', text2: 'Tap again to stop' });
    } catch (error) {
      console.error('Failed to start recording:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to start recording' });
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        setUploading(true);
        const file = {
          uri,
          type: 'audio/m4a',
          name: `audio_${Date.now()}.m4a`,
          mediaType: 'photo' as 'photo' | 'video',
        };

        const uploadRes = await mediaAPI.uploadMultiple([file]);
        const responseFiles = (uploadRes as any)?.files;
        
        if (uploadRes?.success && responseFiles && Array.isArray(responseFiles)) {
          const mediaItems = responseFiles.map((file: any) => ({
            url: file.url,
            type: 'audio' as const,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size
          }));
          setSelectedMedia(prev => [...prev, ...mediaItems]);
          Toast.show({ type: 'success', text1: 'Audio recorded', text2: 'Ready to send' });
        } else {
          console.error('❌ Audio upload failed:', uploadRes);
          Toast.show({ type: 'error', text1: 'Upload failed', text2: uploadRes?.message || 'Failed to upload audio' });
        }
        setUploading(false);
      }
      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to save recording' });
      setRecording(null);
      setRecordingDuration(0);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playAudio = async (audioUrl: string, messageId: string) => {
    try {
      // Stop any currently playing audio
      if (playingAudio[messageId]) {
        await playingAudio[messageId].stopAsync();
        await playingAudio[messageId].unloadAsync();
        const newPlayingAudio = { ...playingAudio };
        delete newPlayingAudio[messageId];
        setPlayingAudio(newPlayingAudio);
        setAudioStatus(prev => ({ ...prev, [messageId]: { ...prev[messageId], isPlaying: false } }));
        return;
      }

      // Use the new audio utility with permission handling
      const sound = await playAudioWithPermission(audioUrl, (status) => {
        if (status.isLoaded) {
          setAudioStatus(prev => ({
            ...prev,
            [messageId]: {
              isPlaying: status.isPlaying,
              duration: status.durationMillis || 0,
              position: status.positionMillis || 0,
            }
          }));
          
          if (status.didJustFinish) {
            setPlayingAudio(prev => {
              const newState = { ...prev };
              delete newState[messageId];
              return newState;
            });
          }
        }
      });

      if (sound) {
        setPlayingAudio(prev => ({ ...prev, [messageId]: sound }));
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      handleMediaError(error, 'audio', audioUrl);
    }
  };

  const formatDuration = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const previewAudio = async (audioUrl: string, mediaIndex: number) => {
    try {
      const previewKey = `preview_${mediaIndex}`;
      
      // Stop any currently playing preview
      if (previewingAudio[previewKey]) {
        await previewingAudio[previewKey].stopAsync();
        await previewingAudio[previewKey].unloadAsync();
        const newPreviewing = { ...previewingAudio };
        delete newPreviewing[previewKey];
        setPreviewingAudio(newPreviewing);
        return;
      }

      // Use the audio utility with permission handling
      const sound = await playAudioWithPermission(audioUrl, (status) => {
        if (status.isLoaded) {
          setAudioStatus(prev => ({
            ...prev,
            [previewKey]: {
              isPlaying: status.isPlaying,
              duration: status.durationMillis || 0,
              position: status.positionMillis || 0,
            }
          }));
          
          if (status.didJustFinish) {
            setPreviewingAudio(prev => {
              const newState = { ...prev };
              delete newState[previewKey];
              return newState;
            });
          }
        }
      });

      if (sound) {
        setPreviewingAudio(prev => ({ ...prev, [previewKey]: sound }));
      }
    } catch (error) {
      console.error('Error previewing audio:', error);
      handleMediaError(error, 'audio', audioUrl);
    }
  };

  const sendMessage = () => {
    console.log('📤 sendMessage called, input:', input, 'selectedMedia:', selectedMedia.length);
    const trimmed = input.trim();
    if (!trimmed && selectedMedia.length === 0) {
      console.log('⚠️ Empty message, not sending');
      return;
    }
    
    console.log('✅ Sending message:', trimmed);
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const newMsg: MessageItem = {
      id: tempId,
      text: trimmed,
      media: selectedMedia,
      createdAt: new Date().toISOString(),
      senderId: user?._id || 'me',
      reactions: [],
    };
    setMessages(prev => {
      const updated = [...prev, newMsg];
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
      return updated;
    });
    setInput('');
    setSelectedMedia([]);
    chatAPI.sendMessage(peerId, trimmed, selectedMedia.length > 0 ? selectedMedia : undefined)
      .then((res: any) => {
        console.log('✅ Message sent successfully:', res);
        const serverMsg = res?.data?.message || res?.message;
        const serverId = serverMsg?._id;
        const serverCreatedAt = serverMsg?.createdAt;
        if (serverId) {
          setMessages(prev => {
            // Replace temp message with server message
            return prev.map(m => m.id === tempId ? { ...m, id: serverId, createdAt: serverCreatedAt || m.createdAt } : m);
          });
        }
      })
      .catch((e: any) => {
        console.error('❌ Failed to send message:', e);
        const msg = e?.response?.data?.message || 'Failed to send message';
        setMessages(prev => prev.filter(m => m.id !== tempId));
        Toast.show({ type: 'error', text1: 'Error', text2: msg });
      });
  };

  const handleReaction = async (messageId: string, reactionType: ReactionType) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const myReaction = message.reactions?.find(r => r.user === user?._id);
    
    try {
      if (myReaction) {
        // Remove reaction if same type, otherwise update
        if (myReaction.type === reactionType) {
          await chatAPI.removeMessageReaction(peerId, messageId);
          setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: m.reactions?.filter(r => r.user !== user?._id) } : m));
        } else {
          await chatAPI.reactToMessage(peerId, messageId, reactionType);
          setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: m.reactions?.map(r => r.user === user?._id ? { ...r, type: reactionType } : r) } : m));
        }
      } else {
        // Add new reaction
        await chatAPI.reactToMessage(peerId, messageId, reactionType);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: [...(m.reactions || []), { user: user?._id || '', type: reactionType, createdAt: new Date().toISOString() }] } : m));
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to react' });
    }
  };

  const renderItem = ({ item, index }: { item: MessageItem; index: number }) => {
    const isMe = item.senderId === user?._id || item.senderId === 'me';
    const isEditing = editing?.id === item.id;
    const isActionTarget = actionFor?.id === item.id;
    
    // Calculate opacity: if editing/action mode is active and this is NOT the target message, blur it
    const shouldBlur = (editing && !isEditing) || (actionFor && !isActionTarget);
    const blurOpacity = blurAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, shouldBlur ? 0.3 : 1],
    });

    // Group reactions by type
    const reactionGroups: Record<ReactionType, number> = {
      funny: 0,
      rage: 0,
      shock: 0,
      relatable: 0,
      love: 0,
      thinking: 0,
    };
    item.reactions?.forEach(r => {
      if (r.type in reactionGroups) {
        reactionGroups[r.type]++;
      }
    });
    const hasReactions = item.reactions && item.reactions.length > 0;
    const myReaction = item.reactions?.find(r => r.user === user?._id);

    const handleLongPress = (event: any) => {
      const { pageX, pageY } = event.nativeEvent;
      const position = {
        x: pageX,
        y: pageY
      };
      
      if (isMe) {
        setActionFor({ id: item.id, text: item.text, position });
      } else {
        setReactionPopup({
          visible: true,
          messageId: item.id,
          position,
        });
      }
    };

    return (
      <Animated.View style={[styles.bubbleRow, { opacity: blurOpacity }]}>
        <Pressable
          onLongPress={handleLongPress}
          style={{ maxWidth: '80%', alignSelf: isMe ? 'flex-end' : 'flex-start' }}
        >
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
            {item.text ? <Text style={isMe ? styles.bubbleTextMe : styles.bubbleTextOther}>{item.text}</Text> : null}
            {item.media && item.media.length > 0 && (
              <View style={{ marginTop: item.text ? 4 : 0 }}>
                {item.media.map((mediaItem, idx) => {
                  const audioKey = `${item.id}-${idx}`;
                  const status = audioStatus[audioKey];
                  const isPlaying = status?.isPlaying || false;
                  const duration = status?.duration || 0;
                  const position = status?.position || 0;
                  
                  return (
                    <View key={idx} style={mediaItem.type === 'audio' ? {} : styles.mediaContainer}>
                      {mediaItem.type === 'image' ? (
                        <TouchableOpacity onPress={() => setFullscreenMedia({ url: getFullMediaUrl(mediaItem.url), type: 'image' })}>
                          <Image 
                            source={{ uri: getFullMediaUrl(mediaItem.url) }} 
                            style={styles.messageImage} 
                            resizeMode="cover"
                            onError={(error) => handleMediaError(error, 'image', mediaItem.url)}
                          />
                        </TouchableOpacity>
                      ) : mediaItem.type === 'video' ? (
                        <TouchableOpacity onPress={() => setFullscreenMedia({ url: getFullMediaUrl(mediaItem.url), type: 'video' })}>
                          <Video
                            source={{ uri: getFullMediaUrl(mediaItem.url) }}
                            style={styles.messageVideo}
                            useNativeControls={false}
                            isLooping={false}
                            onError={(error) => handleMediaError(error, 'video', mediaItem.url)}
                          />
                          <View style={styles.videoOverlay}>
                            <View style={styles.videoPlayButton}>
                              <Text style={{ fontSize: 24 }}>▶️</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <View style={[styles.audioContainer, isMe ? styles.audioContainerMe : styles.audioContainerOther]}>
                          <TouchableOpacity 
                            style={styles.playButton}
                            onPress={() => playAudio(mediaItem.url, audioKey)}
                          >
                            <Text style={{ fontSize: 16 }}>{isPlaying ? '⏸' : '▶️'}</Text>
                          </TouchableOpacity>
                          <View style={styles.audioWaveform}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                              {[...Array(20)].map((_, i) => (
                                <View 
                                  key={i} 
                                  style={{ 
                                    width: 2, 
                                    height: Math.random() * 20 + 10, 
                                    backgroundColor: isMe ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)',
                                    borderRadius: 1 
                                  }} 
                                />
                              ))}
                            </View>
                            <View style={{ marginTop: 4, alignItems: 'center' }}>
                              <Text style={{ fontSize: 8, color: isMe ? theme.colors.textInverse : theme.colors.text, opacity: 0.7 }}>
                                🎤 Voice Message
                              </Text>
                            </View>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.audioDuration, { color: isMe ? theme.colors.textInverse : theme.colors.text, fontFamily: 'monospace', fontWeight: '700' }]}>
                              {duration > 0 ? formatDuration(duration) : '0:00'}
                            </Text>
                            {isPlaying && position > 0 && (
                              <Text style={[styles.audioProgress, { color: isMe ? theme.colors.textInverse : theme.colors.text, fontFamily: 'monospace' }]}>
                                {formatDuration(position)} / {formatDuration(duration)}
                              </Text>
                            )}
                            {!isPlaying && duration > 0 && (
                              <Text style={[styles.audioProgress, { color: isMe ? theme.colors.textInverse : theme.colors.text, opacity: 0.6 }]}>
                                Tap to play
                              </Text>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.time, isMe ? { color: theme.colors.textInverse } : { color: theme.colors.textSecondary }]}>
                {new Date(item.createdAt).toLocaleTimeString()}
              </Text>
              {item.editedAt && (
                <Text style={[styles.time, isMe ? { color: theme.colors.textInverse } : { color: theme.colors.textSecondary }, { fontStyle: 'italic' }]}>
                  • edited
                </Text>
              )}
            </View>
          </View>
          {hasReactions && (
            <View style={[styles.reactionsContainer, { alignSelf: isMe ? 'flex-end' : 'flex-start' }]}>
              {Object.entries(reactionGroups).map(([type, count]) => {
                if (count === 0) return null;
                const isMyReaction = myReaction?.type === type;
                return (
                  <View key={type} style={[styles.reactionBadge, isMyReaction && { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }]}>
                    <Text style={styles.reactionEmoji}>{REACTION_ICONS[type as ReactionType]}</Text>
                    {count > 1 && <Text style={[styles.reactionCount, { color: theme.colors.text }]}>{count}</Text>}
                  </View>
                );
              })}
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => { 
          chatAPI.markRead(peerId).then(() => refreshUnreadCount()).finally(() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Messages' as never);
            }
          }); 
        }} style={{ marginRight: 12 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Back</Text>
        </TouchableOpacity>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.headerAvatar} />
        ) : (
          <View style={[styles.headerAvatar, { backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}> 
            <Text style={{ color: theme.colors.textInverse, fontWeight: '700' }}>{username.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.headerName}>@{username}</Text>
      </View>
      <FlatList<MessageItem>
        ref={listRef}
        style={styles.list}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        inverted={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      />
      {(editing || actionFor) && (
        <Animated.View 
          style={{ 
            ...StyleSheet.absoluteFillObject, 
            backgroundColor: theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)', 
            zIndex: 10,
            ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(4px)' } as any) : {}),
            pointerEvents: 'none',
          }} 
        />
      )}
      {editing && (
        <Animated.View 
          style={{ 
            position: 'absolute', 
            bottom: 100, 
            left: 16, 
            right: 16, 
            zIndex: 11,
            transform: [{ 
              translateY: editingMessageY.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }],
            pointerEvents: 'none',
          }}
        >
          <View style={{ alignItems: 'flex-end' }}>
            <View style={[styles.bubble, styles.bubbleMe, { maxWidth: '80%' }]}>
              <Text style={styles.bubbleTextMe}>{messages.find(m => m.id === editing.id)?.text}</Text>
              <Text style={[styles.time, { color: theme.colors.textInverse }]}>
                Editing...
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
      <View style={[styles.composerWrap, { zIndex: 20 }]}>
        {selectedMedia.length > 0 && !editing && (
          <ScrollView horizontal style={{ maxHeight: 90 }} showsHorizontalScrollIndicator={false}>
            <View style={styles.mediaPreviewContainer}>
              {selectedMedia.map((media, idx) => {
                const previewKey = `preview_${idx}`;
                const previewStatus = audioStatus[previewKey];
                const isPreviewPlaying = previewStatus?.isPlaying || false;
                const previewDuration = previewStatus?.duration || 0;
                const previewPosition = previewStatus?.position || 0;
                
                return (
                  <View key={idx} style={styles.mediaPreviewItem}>
                    {media.type === 'image' ? (
                      <Image 
                        source={{ uri: getFullMediaUrl(media.url) }} 
                        style={styles.mediaPreviewImage}
                        onError={(error) => handleMediaError(error, 'image', media.url)}
                      />
                    ) : media.type === 'video' ? (
                      <Video
                        source={{ uri: getFullMediaUrl(media.url) }}
                        style={styles.mediaPreviewImage}
                        shouldPlay={false}
                        onError={(error) => handleMediaError(error, 'video', media.url)}
                      />
                    ) : (
                      <TouchableOpacity 
                        style={{ width: '100%', height: '100%', backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', padding: 4 }}
                        onPress={() => previewAudio(media.url, idx)}
                      >
                        <Text style={{ fontSize: 20, marginBottom: 2 }}>{isPreviewPlaying ? '⏸️' : '▶️'}</Text>
                        <Text style={{ color: theme.colors.textInverse, fontSize: 9, fontWeight: '600', textAlign: 'center' }}>
                          🎤 Voice
                        </Text>
                        <Text style={{ color: theme.colors.textInverse, fontSize: 10, fontWeight: '700', marginTop: 2, fontFamily: 'monospace' }}>
                          {previewDuration > 0 ? formatDuration(previewDuration) : '0:00'}
                        </Text>
                        {isPreviewPlaying && (
                          <Text style={{ color: theme.colors.textInverse, fontSize: 8, opacity: 0.9, fontFamily: 'monospace' }}>
                            {formatDuration(previewPosition)}
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.removeMediaBtn}
                      onPress={() => setSelectedMedia(prev => prev.filter((_, i) => i !== idx))}
                    >
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>×</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
        {isRecording && (
          <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.colors.error + '20', borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.error || '#ff4444', fontSize: 14, fontWeight: '600', marginRight: 8 }}>● Recording</Text>
              <Text style={{ color: theme.colors.error || '#ff4444', fontSize: 16, fontWeight: '700', fontFamily: 'monospace' }}>
                {formatDuration(recordingDuration)}
              </Text>
            </View>
            <TouchableOpacity onPress={stopRecording} style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: theme.colors.error || '#ff4444', borderRadius: 6 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.composerRow}>
          {!editing && (
            <>
              <TouchableOpacity onPress={selectMedia} style={styles.plusButton} disabled={uploading}>
                <Text style={{ fontSize: 28, color: theme.colors.primary, fontWeight: 'bold' }}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={toggleRecording} 
                style={[styles.recordButton, isRecording && { backgroundColor: theme.colors.error + '20' }]} 
                disabled={uploading}
              >
                <Text style={{ 
                  fontSize: 24, 
                  color: isRecording ? (theme.colors.error || '#ff4444') : theme.colors.primary 
                }}>
                  🎤
                </Text>
              </TouchableOpacity>
            </>
          )}
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSecondary}
            value={editing ? editing.text : input}
            onChangeText={(t) => {
              if (editing) setEditing({ ...editing, text: t }); else setInput(t);
            }}
            onSubmitEditing={() => { if (!editing) sendMessage(); }}
            returnKeyType="send"
            multiline
          />
          {editing ? (
            <>
              <TouchableOpacity onPress={() => setEditing(null)} style={[styles.sendBtn, { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, marginRight: 8 }]}>
                <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                const text = editing.text.trim();
                if (!text) return;
                const msg = messages.find(m => m.id === editing.id);
                if (!msg) { setEditing(null); return; }
                try {
                  const res = await chatAPI.editMessage(peerId, msg.id, text);
                  const updatedText = res?.data?.message?.text || text;
                  const editedAt = res?.data?.message?.editedAt || new Date().toISOString();
                  setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, text: updatedText, editedAt } : m));
                  setEditing(null);
                } catch (e: any) {
                  Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to edit message' });
                }
              }} style={styles.sendBtn}>
                <Text style={styles.sendText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={sendMessage} style={styles.sendBtn} disabled={uploading}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {actionFor && (
        <>
          <Pressable 
            style={[StyleSheet.absoluteFill, { zIndex: 11 }]} 
            onPress={() => setActionFor(null)}
          />
          <View style={{ 
            position: 'absolute', 
            top: Math.max(20, actionFor.position.y - 200), 
            left: 16, 
            right: 16, 
            alignItems: 'center', 
            zIndex: 15 
          }}>
            {/* Reactions Row */}
            <View style={{ 
              backgroundColor: theme.dark ? 'rgba(42, 42, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              borderWidth: 2, 
              borderColor: theme.dark ? '#444' : '#ddd',
              borderRadius: 30, 
              ...theme.shadows.large,
              paddingHorizontal: 8,
              paddingVertical: 8,
              flexDirection: 'row',
              gap: 4,
              marginBottom: 12,
              elevation: 20,
            }}>
              {Object.entries(REACTION_ICONS).map(([type, emoji]) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    handleReaction(actionFor.id, type as ReactionType);
                    setActionFor(null);
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: theme.dark ? 'rgba(58, 58, 58, 0.95)' : 'rgba(245, 245, 245, 0.95)',
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Action Buttons */}
            <View style={{ 
              backgroundColor: theme.dark ? 'rgba(42, 42, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              borderWidth: 2, 
              borderColor: theme.dark ? '#444' : '#ddd',
              borderRadius: 12, 
              ...theme.shadows.large,
              minWidth: 200, 
              overflow: 'hidden',
              elevation: 20,
            }}>
              <TouchableOpacity 
                onPress={() => { 
                  setEditing({ id: actionFor.id, text: actionFor.text }); 
                  setActionFor(null); 
                }} 
                style={{ paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.dark ? '#444' : '#e0e0e0', flexDirection: 'row', alignItems: 'center', gap: 12 }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 18 }}>✏️</Text>
                <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={async () => {
                  const id = actionFor.id; 
                  setActionFor(null);
                  try {
                    await chatAPI.deleteMessage(peerId, id);
                    setMessages(prev => prev.filter(m => m.id !== id));
                    Toast.show({ type: 'success', text1: 'Message deleted' });
                  } catch (e: any) {
                    Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to unsend' });
                  }
                }} 
                style={{ paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 18 }}>🗑️</Text>
                <Text style={{ color: theme.colors.error || '#ff4444', fontSize: 15, fontWeight: '600' }}>Unsend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
      <ReactionPopup
        visible={reactionPopup.visible}
        onSelect={(reaction) => {
          handleReaction(reactionPopup.messageId, reaction);
          setReactionPopup({ visible: false, messageId: '', position: { x: 0, y: 0 } });
        }}
        onClose={() => setReactionPopup({ visible: false, messageId: '', position: { x: 0, y: 0 } })}
        position={reactionPopup.position}
      />
      
      {/* Attach Menu Modal */}
      <Modal
        visible={showAttachMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachMenu(false)}
      >
        <Pressable style={styles.attachMenuModal} onPress={() => setShowAttachMenu(false)}>
          <Pressable style={styles.attachMenuContainer} onPress={(e) => e.stopPropagation()}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700', paddingHorizontal: 20 }}>Attach</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.attachMenuItem}
              onPress={() => {
                setShowAttachMenu(false);
                openCamera();
              }}
            >
              <Text style={styles.attachMenuIcon}>📷</Text>
              <Text style={styles.attachMenuText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.attachMenuItem}
              onPress={() => {
                setShowAttachMenu(false);
                openGallery();
              }}
            >
              <Text style={styles.attachMenuIcon}>📎</Text>
              <Text style={styles.attachMenuText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.attachMenuItem}
              onPress={() => {
                setShowAttachMenu(false);
                setShowEmojiPicker(true);
              }}
            >
              <Text style={styles.attachMenuIcon}>😊</Text>
              <Text style={styles.attachMenuText}>Emoji</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.attachMenuItem}
              onPress={() => {
                setShowAttachMenu(false);
                toggleRecording();
              }}
            >
              <Text style={styles.attachMenuIcon}>{isRecording ? '⏹️' : '🎤'}</Text>
              <Text style={styles.attachMenuText}>{isRecording ? 'Stop Recording' : 'Voice Note'}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <Pressable style={styles.emojiPickerModal} onPress={() => setShowEmojiPicker(false)}>
          <Pressable style={styles.emojiPickerContainer} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 }}>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Pick an Emoji</Text>
              <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                <Text style={{ color: theme.colors.text, fontSize: 24 }}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.emojiGrid}>
                {COMMON_EMOJIS.map((emoji, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setInput(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    <Text style={styles.emojiItem}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Fullscreen Media Viewer */}
      <Modal
        visible={fullscreenMedia !== null}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setFullscreenMedia(null)}
        statusBarTranslucent
      >
        <Pressable style={styles.fullscreenModal} onPress={() => fullscreenMedia?.type === 'image' && setFullscreenMedia(null)}>
          <TouchableOpacity 
            style={styles.fullscreenCloseButton}
            onPress={() => setFullscreenMedia(null)}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>×</Text>
          </TouchableOpacity>
          
          {fullscreenMedia?.type === 'image' ? (
            <Image 
              source={{ uri: fullscreenMedia.url }} 
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          ) : fullscreenMedia?.type === 'video' ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Video
                source={{ uri: fullscreenMedia.url }}
                style={styles.fullscreenVideo}
                useNativeControls
                shouldPlay
                isLooping={false}
              />
            </View>
          ) : null}
        </Pressable>
      </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;


