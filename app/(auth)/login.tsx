import Field from '@/components/Field';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';

export default function Login() {
    const { signIn } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const onSubmit = async () => {
        try {
            setBusy(true); setErr(null);
            await signIn(email, password);
            router.replace('/(tabs)/sessions');
        } catch (e: any) {
            setErr(e.message || 'Login failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20, gap: 12, justifyContent: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '700' }}>Welcome back</Text>
            {err ? <Text style={{ color: 'red' }}>{err}</Text> : null}
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
                textContentType="password"
                autoComplete="password"
            />
            <Pressable disabled={busy} onPress={onSubmit}
                style={{ backgroundColor: '#111', padding: 14, borderRadius: 10 }}>
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>{busy ? 'Signing in…' : 'Sign in'}</Text>
            </Pressable>
            <Link href="/(auth)/register">No account? Register</Link>
        </View>
    );
}
