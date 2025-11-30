import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { whisperWallAPI } from '../services/api';
import Toast from 'react-native-toast-message';

interface EditWhisperModalProps {
  visible: boolean;
  whisper: any;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { name: 'Random', emoji: '🎲' },
  { name: 'Vent', emoji: '😤' },
  { name: 'Confession', emoji: '🤫' },
  { name: 'Advice', emoji: '💡' },
  { name: 'Gaming', emoji: '🎮' },
  { name: 'Love', emoji: '❤️' },
];

const EditWhisperModal: React.FC<EditWhisperModalProps> = ({
  visible,
  whisper,
  onClose,
  onSuccess,
}) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (whisper) {
      setText(whisper.content?.text || '');
      setCategory(whisper.category || '');
    }
  }, [whisper]);

  const handleSave = async () => {
    if (!text.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Whisper text cannot be empty',
      });
      return;
    }

    if (!category) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a category',
      });
      return;
    }

    try {
      setLoading(true);
      await whisperWallAPI.editWhisper(whisper._id, {
        content: { text },
        category,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Whisper updated successfully',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to update whisper:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to update whisper',
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      width: '100%',
      maxWidth: 500,
      maxHeight: '80%',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 12,
      color: theme.colors.text,
      fontSize: 16,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    categoryContainer: {
      marginBottom: 20,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    categoryChipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    categoryChipText: {
      fontSize: 13,
      color: theme.colors.text,
      fontWeight: '500',
    },
    categoryChipTextSelected: {
      color: theme.colors.textInverse,
      fontWeight: '600',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.colors.text,
    },
    saveButtonText: {
      color: theme.colors.textInverse,
    },
  });

  if (!whisper) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit Whisper</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Whisper Text</Text>
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={setText}
              placeholder="What's on your mind?"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              maxLength={500}
            />

            <View style={styles.categoryContainer}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      styles.categoryChip,
                      category === cat.name && styles.categoryChipSelected,
                    ]}
                    onPress={() => setCategory(cat.name)}
                  >
                    <Text style={styles.categoryChipText}>
                      {cat.emoji}
                    </Text>
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat.name && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.textInverse} />
              ) : (
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditWhisperModal;
