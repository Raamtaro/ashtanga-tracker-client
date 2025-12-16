import { Stack, useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

export default function CreateSessionLayout() {
    const router = useRouter()
    return (
        <Stack screenOptions={{
            presentation: 'card',
            headerRight: () => ( //Optional
                <Pressable onPress={() => router.dismiss()} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                    <Text style={{ fontSize: 16 }}>Close</Text>
                </Pressable>
            ),
        }}>
            <Stack.Screen name="index" options={{ title: 'Create Session' }} />
            <Stack.Screen name="preset" options={{ title: 'Preset' }} />
            <Stack.Screen name="custom" options={{ title: 'Custom' }} />
        </Stack>
    );
}