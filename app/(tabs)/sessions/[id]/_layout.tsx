import { Stack, useRouter } from 'expo-router';

export default function SessionLayout() {
    const router = useRouter();
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="index"
            />
            <Stack.Screen name="edit/[cardId]" options={{
                headerShown: true,
                title: 'Edit',
                headerStyle: { backgroundColor: '#0b0b0c' },
                headerTintColor: 'white',
                headerShadowVisible: false,
                // headerBackTitleVisible: false, // ✅ hides iOS “All Sessions” style labels
            }} />
        </Stack>
    );
}