import Field from '@/components/Field';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { registerUser } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';

export default function Register() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    const pwMismatch = password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;
    const canSubmit = !busy && name.trim() && email.trim() && password.length >= 8 && !pwMismatch;

    const onSubmit = async () => {
        try {
            setBusy(true); setErr(null);
            await registerUser(name, email, password);
            // Optional: auto-login
            await signIn(email, password);
            router.replace('/(tabs)/sessions');
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
            <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" autoComplete="email" />
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry textContentType="newPassword" autoComplete="password-new" />
            <Field label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry textContentType="newPassword" autoComplete="password-new" />

            {pwMismatch ? <Text style={{ color: 'red' }}>Passwords don’t match.</Text> : null}
            <Pressable disabled={!canSubmit} onPress={onSubmit} style={{ backgroundColor: '#111', padding: 14, borderRadius: 10, opacity: canSubmit ? 1 : 0.5 }}>
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>{busy ? 'Working…' : 'Register'}</Text>
            </Pressable>
            <Link href="/(auth)/login">Have an account? Sign in</Link>
        </View>
    );
}
