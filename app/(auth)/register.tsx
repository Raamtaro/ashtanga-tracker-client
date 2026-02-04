import Field from '@/components/Field';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { registerUser } from '../../lib/api';

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const showMismatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const passwordsMatch =
    password.length > 0 && password === confirmPassword;

  const canSubmit =
    !busy &&
    !!name.trim() &&
    !!email.trim() &&
    password.length >= 8 &&
    confirmPassword.length >= 8 &&
    passwordsMatch;

  const onSubmit = async () => {
    try {
      setBusy(true);
      setErr(null);

      // Extra guard (in case someone bypasses disabled somehow)
      if (!canSubmit) {
        setErr('Please fill all fields and make sure passwords match.');
        return;
      }

      await registerUser(name.trim(), email.trim(), password);

      Alert.alert(
        'Account created',
        'Please sign in.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ],
        { cancelable: false }
      );
    } catch (e: any) {
      setErr(e.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12, justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: '700' }}>Create account</Text>

      {err ? <Text style={{ color: 'red' }}>{err}</Text> : null}

      <Field label="Name" value={name} onChangeText={setName} />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="newPassword"
        autoComplete="password-new"
      />
      <Field
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        textContentType="newPassword"
        autoComplete="password-new"
      />

      {showMismatch ? <Text style={{ color: 'red' }}>Passwords don’t match.</Text> : null}

      <Pressable
        disabled={!canSubmit}
        onPress={onSubmit}
        style={{
          backgroundColor: '#111',
          padding: 14,
          borderRadius: 10,
          opacity: canSubmit ? 1 : 0.5,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
          {busy ? 'Working…' : 'Register'}
        </Text>
      </Pressable>

      <Link href="/(auth)/login">Have an account? Sign in</Link>
    </View>
  );
}
