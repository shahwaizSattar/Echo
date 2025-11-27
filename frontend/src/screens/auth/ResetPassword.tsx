import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Linking } from 'react-native';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../services/firebase';

type RouteParams = {
  params?: {
    oobCode?: string;
  };
};

function getQueryParam(url: string | null, key: string) {
  if (!url) return null;
  try {
    const parts = url.split('?');
    if (parts.length < 2) return null;
    const search = parts[1];
    const pairs = search.split('&');
    for (const p of pairs) {
      const [k, v] = p.split('=');
      if (k === key) return decodeURIComponent(v || '');
    }
    return null;
  } catch (e) {
    return null;
  }
}

export default function ResetPassword() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, object | undefined>, string>>() as unknown as RouteParams;

  const [oobCode, setOobCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1) Check route params first (if your deep linking passes the code)
    const maybeCode = (route && route.params && (route.params as any).oobCode) || null;
    if (maybeCode) {
      setOobCode(maybeCode);
      return;
    }

    // 2) Otherwise try initial URL (when user opens link into the app)
    (async () => {
      try {
        const initial = await Linking.getInitialURL();
        if (initial) {
          const code = getQueryParam(initial, 'oobCode') || getQueryParam(initial, 'oobcode') || null;
          if (code) setOobCode(code);
        }
      } catch (e) {
        console.warn('Failed to get initial URL', e);
      }
    })();
  }, [route]);

  useEffect(() => {
    if (!oobCode) return;

    setLoading(true);
    setError(null);
    verifyPasswordResetCode(auth, oobCode)
      .then((emailFromCode) => {
        setEmail(emailFromCode);
      })
      .catch((err) => {
        console.error('verifyPasswordResetCode error', err);
        setError('Invalid or expired password reset link.');
      })
      .finally(() => setLoading(false));
  }, [oobCode]);

  const onSubmit = async () => {
    setError(null);
    if (!oobCode) {
      setError('No password reset code found.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setInfo('Your password has been updated. You can now sign in with your new password.');
      Alert.alert('Success', 'Password updated');
    } catch (err: any) {
      console.error('confirmPasswordReset error', err);
      const code = err?.code || '';
      if (code.includes('auth/expired-action-code')) {
        setError('This reset link has expired. Please request a new one.');
      } else if (code.includes('auth/invalid-action-code')) {
        setError('Invalid reset code.');
      } else {
        setError('Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToLoginOrHome = () => {
    // Try to navigate to a Login or Home screen - adjust names to your app's navigator
    try {
      // Prefer 'Login' if you have a login screen
      // Fallback to 'Home' if you sign-in users directly
      // Replace with the correct route names in your app
      (navigation as any).navigate('Login');
    } catch (e) {
      try {
        (navigation as any).navigate('Home');
      } catch (e2) {
        console.warn('No navigation target found for post-reset redirect');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      {loading ? <ActivityIndicator size="large" /> : null}

      {email ? <Text style={styles.info}>Resetting password for: {email}</Text> : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {info ? <Text style={styles.successText}>{info}</Text> : null}

      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New password"
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm password"
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading || !!info}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Set New Password</Text>}
      </TouchableOpacity>

      {info ? (
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={goToLoginOrHome}>
          <Text style={styles.buttonText}>Go To Login / Home</Text>
        </TouchableOpacity>
      ) : null}
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
    marginBottom: 12,
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
  buttonSecondary: {
    backgroundColor: '#4caf50'
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
  },
  successText: {
    color: '#2b8a3e',
    marginBottom: 8,
    textAlign: 'center'
  },
  info: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#333'
  }
});

/**
 * Notes:
 * - For users to open the link inside the app you must configure deep linking / dynamic links
 *   for your platform (Expo/React Native). When the app opens from the link, the `oobCode`
 *   query parameter will be available and this screen reads it from the initial URL.
 * - Alternatively, your web redirect page can extract the `oobCode` and deep-link into the app
 *   by navigating to a custom URL scheme like myapp://reset-password?oobCode=...
 */
