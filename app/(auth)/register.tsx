import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
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
            <TextInput placeholder="Name" onChangeText={setName} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
            <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address"
                onChangeText={setEmail} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
            <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword}
                style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
            <Pressable disabled={busy} onPress={onSubmit}
                style={{ backgroundColor: '#111', padding: 14, borderRadius: 10 }}>
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>{busy ? 'Working…' : 'Register'}</Text>
            </Pressable>
            <Link href="/(auth)/login">Have an account? Sign in</Link>
        </View>
    );
}
