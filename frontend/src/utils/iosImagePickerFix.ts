/**
 * iOS-specific Image Picker fixes
 * Handles common iOS issues with image picker not launching or timing out
 */

import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';
import Toast from 'react-native-toast-message';

// Reduced timeout duration for iOS image picker (10 seconds)
const PICKER_TIMEOUT = 10000;

/**
 * Request photo library permissions with proper iOS error handling
 */
export const requestPhotoLibraryPermissionsAsync = async (): Promise<boolean> => {
  try {
    console.log('🔐 [iOS] Requesting photo library permissions...');
    
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    console.log('📸 [iOS] Photo library permission response:', { status, canAskAgain });
    
    if (status === 'granted') {
      console.log('✅ [iOS] Photo library permission granted');
      return true;
    }
    
    if (!canAskAgain) {
      Alert.alert(
        'Photo Library Access Disabled',
        'Please enable photo library access in Settings > WhisperEcho > Photos',
        [{ text: 'Go to Settings', onPress: () => {
          // This will open settings on iOS
          Platform.OS === 'ios' && Alert.alert('Open Settings Manually', 'Settings > WhisperEcho > Photos');
        }}, { text: 'Cancel' }]
      );
      return false;
    }
    
    Toast.show({
      type: 'error',
      text1: 'Permission Required',
      text2: 'Photo library access is needed to select images.'
    });
    return false;
  } catch (error) {
    console.error('❌ [iOS] Error requesting photo library permissions:', error);
    Toast.show({
      type: 'error',
      text1: 'Permission Error',
      text2: 'Failed to request photo library access.'
    });
    return false;
  }
};

/**
 * Request camera permissions with proper iOS error handling
 */
export const requestCameraPermissionsAsync = async (): Promise<boolean> => {
  try {
    console.log('🔐 [iOS] Requesting camera permissions...');
    
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    
    console.log('📷 [iOS] Camera permission response:', { status, canAskAgain });
    
    if (status === 'granted') {
      console.log('✅ [iOS] Camera permission granted');
      return true;
    }
    
    if (!canAskAgain) {
      Alert.alert(
        'Camera Access Disabled',
        'Please enable camera access in Settings > WhisperEcho > Camera',
        [{ text: 'Go to Settings', onPress: () => {
          Platform.OS === 'ios' && Alert.alert('Open Settings Manually', 'Settings > WhisperEcho > Camera');
        }}, { text: 'Cancel' }]
      );
      return false;
    }
    
    Toast.show({
      type: 'error',
      text1: 'Permission Required',
      text2: 'Camera access is needed to take photos.'
    });
    return false;
  } catch (error) {
    console.error('❌ [iOS] Error requesting camera permissions:', error);
    Toast.show({
      type: 'error',
      text1: 'Permission Error',
      text2: 'Failed to request camera access.'
    });
    return false;
  }
};

/**
 * Launch camera with iOS-specific error handling and timeout
 */
export const launchCameraAsync = async (options: any = {}): Promise<ImagePicker.ImagePickerResult | null> => {
  try {
    console.log('📷 [iOS] Launching camera with direct ImagePicker...');
    
    // Use direct ImagePicker call without custom timeout wrapper
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.8,
      videoMaxDuration: 60,
      exif: false,
      ...options,
    });
    
    console.log('📷 [iOS] Camera result:', {
      canceled: result.canceled,
      assetsCount: result.assets?.length || 0,
      firstAsset: result.assets?.[0]?.uri.substring(0, 50)
    });
    
    return result;
  } catch (error) {
    console.error('❌ [iOS] Camera launch error:', error);
    
    // Handle specific iOS errors
    const errorStr = String(error);
    if (errorStr.includes('Camera not available')) {
      Alert.alert('Camera Not Available', 'This device does not have a camera.');
    } else if (errorStr.includes('denied') || errorStr.includes('permission')) {
      Toast.show({
        type: 'error',
        text1: 'Camera Access Denied',
        text2: 'Please enable camera access in Settings > WhisperEcho > Camera.'
      });
    } else if (errorStr.includes('cancelled') || errorStr.includes('canceled')) {
      console.log('📷 [iOS] Camera canceled by user');
      return { canceled: true, assets: [] };
    } else {
      Toast.show({
        type: 'error',
        text1: 'Camera Error',
        text2: 'Failed to open camera. Please try again.'
      });
    }
    return null;
  }
};

/**
 * Launch image library with iOS-specific error handling and timeout
 */
export const launchImageLibraryAsync = async (options: any = {}): Promise<ImagePicker.ImagePickerResult | null> => {
  try {
    console.log('📱 [iOS] Launching image library with direct ImagePicker...');
    
    // Use direct ImagePicker call without custom timeout wrapper
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      exif: false,
      ...options,
    });
    
    console.log('📱 [iOS] Image library result:', {
      canceled: result.canceled,
      assetsCount: result.assets?.length || 0,
      firstAsset: result.assets?.[0]?.uri.substring(0, 50)
    });
    
    return result;
  } catch (error) {
    console.error('❌ [iOS] Image library launch error:', error);
    
    // Handle specific iOS errors
    const errorStr = String(error);
    if (errorStr.includes('denied') || errorStr.includes('permission')) {
      Toast.show({
        type: 'error',
        text1: 'Photo Library Access Denied',
        text2: 'Please enable photo library access in Settings > WhisperEcho > Photos.'
      });
    } else if (errorStr.includes('unavailable')) {
      Toast.show({
        type: 'error',
        text1: 'Photo Library Unavailable',
        text2: 'Photo library is not available on this device.'
      });
    } else if (errorStr.includes('cancelled') || errorStr.includes('canceled')) {
      console.log('📱 [iOS] Gallery canceled by user');
      return { canceled: true, assets: [] };
    } else {
      Toast.show({
        type: 'error',
        text1: 'Photo Library Error',
        text2: 'Failed to open photo library. Please try again.'
      });
    }
    return null;
  }
};

/**
 * Safe picker wrapper that handles both iOS and Android
 */
export const safePickImage = async (source: 'camera' | 'library'): Promise<ImagePicker.ImagePickerResult | null> => {
  if (Platform.OS === 'ios') {
    if (source === 'camera') {
      const hasPermission = await requestCameraPermissionsAsync();
      if (!hasPermission) return null;
      return await launchCameraAsync();
    } else {
      const hasPermission = await requestPhotoLibraryPermissionsAsync();
      if (!hasPermission) return null;
      return await launchImageLibraryAsync();
    }
  } else {
    // Android handling remains the same
    if (source === 'camera') {
      return await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        videoMaxDuration: 60,
        exif: false,
      });
    } else {
      return await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        exif: false,
      });
    }
  }
};

export default {
  requestPhotoLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  launchCameraAsync,
  launchImageLibraryAsync,
  safePickImage,
};
