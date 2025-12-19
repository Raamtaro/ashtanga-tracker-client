import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../providers/AuthProvider';

export default function Account() {
    const { signOut } = useAuth();
    const router = useRouter();
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 20, gap: 12 }}>
                <Text style={{ fontSize: 22, fontWeight: '700' }}>Account</Text>
                <Pressable
                    onPress={async () => { await signOut(); router.replace('/(auth)/login'); }}
                    style={{ backgroundColor: '#111', padding: 14, borderRadius: 10 }}
                >
                    <Text style={{ color: '#fff', textAlign: 'center' }}>Sign out</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
