import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface WhisperPostOptionsProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const WhisperPostOptions: React.FC<WhisperPostOptionsProps> = ({
  visible,
  onClose,
  postId,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingBottom: 40,
      maxHeight: '80%',
    },
    handleBar: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '30',
    },
    optionIcon: {
      fontSize: 24,
      marginRight: 16,
      width: 32,
    },
    optionTextContainer: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    dangerOption: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '30',
      marginTop: 8,
    },
    dangerText: {
      color: theme.colors.error,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={styles.modalContent}
        >
          <View style={styles.handleBar} />
          
          <Text style={styles.title}>Your Whisper</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Edit Whisper */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                onEdit?.();
                onClose();
              }}
            >
              <Text style={styles.optionIcon}>✏️</Text>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Edit Whisper</Text>
                <Text style={styles.optionDescription}>
                  Modify your whisper content or settings
                </Text>
              </View>
            </TouchableOpacity>

            {/* Delete Whisper */}
            <TouchableOpacity
              style={[styles.optionButton, styles.dangerOption]}
              onPress={() => {
                onDelete?.();
                onClose();
              }}
            >
              <Text style={styles.optionIcon}>🗑️</Text>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, styles.dangerText]}>
                  Delete Whisper
                </Text>
                <Text style={styles.optionDescription}>
                  Permanently remove this whisper
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default WhisperPostOptions;
