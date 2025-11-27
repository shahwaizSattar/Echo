import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { sendResetLink } from '../../services/sendResetLink';

const emailRegex = /^\S+@\S+\.\S+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    setError(null);

    if (!email || email.trim() === '') {
      setError('Please enter your email address');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendResetLink(email.trim());
      Alert.alert('Success', 'Password reset email sent. Check your inbox.');
      setEmail('');
    } catch (err: any) {
      // Map common Firebase Auth errors to friendly messages
      const code = err?.code || err?.message || '';
      console.error('sendResetLink error:', err);
      if (code.includes('auth/user-not-found')) {
        setError('No user found with that email address');
      } else if (code.includes('auth/invalid-email')) {
        setError('Invalid email address');
      } else if (code.includes('auth/too-many-requests')) {
        setError('Too many requests. Please try again later.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email address"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        placeholderTextColor="#999"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={onSend} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16
  },
  button: {
    height: 48,
    backgroundColor: '#667eea',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  errorText: {
    color: '#cc3333',
    marginBottom: 8,
    textAlign: 'center'
  }
});

/**
 * Example navigation usage (React Navigation):
 *
 * // In your navigator registration
 * <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
 *
 * // To navigate to the screen:
 * navigation.navigate('ForgotPassword');
 */
