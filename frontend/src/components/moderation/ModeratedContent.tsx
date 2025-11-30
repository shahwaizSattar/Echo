import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BlurredContent from './BlurredContent';

interface ModerationData {
  severity: 'SAFE' | 'BLUR' | 'WARNING' | 'BLOCK';
  reason?: string;
  scores?: {
    hateSpeech: number;
    harassment: number;
    threats: number;
    sexual: number;
    selfHarm: number;
    extremism: number;
    profanity: number;
  };
}

interface ModeratedContentProps {
  children: React.ReactNode;
  moderation?: ModerationData;
  onReveal?: () => void;
}

const ModeratedContent: React.FC<ModeratedContentProps> = ({
  children,
  moderation,
  onReveal,
}) => {
  // If no moderation data or content is safe, show normally
  if (!moderation || moderation.severity === 'SAFE') {
    return <>{children}</>;
  }

  // If content is blocked, show error message
  if (moderation.severity === 'BLOCK') {
    return (
      <View style={styles.blockedContainer}>
        <Text style={styles.blockedIcon}>🚫</Text>
        <Text style={styles.blockedTitle}>Content Blocked</Text>
        <Text style={styles.blockedText}>
          This content has been blocked due to a violation of community guidelines.
        </Text>
        {moderation.reason && (
          <Text style={styles.blockedReason}>Reason: {moderation.reason}</Text>
        )}
      </View>
    );
  }

  // For BLUR and WARNING, wrap with blur effect
  return (
    <BlurredContent
      severity={moderation.severity}
      reason={moderation.reason}
      onReveal={onReveal}
    >
      {children}
    </BlurredContent>
  );
};

const styles = StyleSheet.create({
  blockedContainer: {
    backgroundColor: '#FFE5E5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    marginVertical: 8,
  },
  blockedIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  blockedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 8,
  },
  blockedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  blockedReason: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ModeratedContent;
