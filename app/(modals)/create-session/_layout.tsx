import { Stack } from 'expo-router';

export default function CreateSessionLayout() {
    return (
        <Stack screenOptions={{headerShown: false,}}>
            <Stack.Screen name="index" options={{ title: 'Create Session' }} />
            <Stack.Screen name="preset" options={{ title: 'Preset' }} />
            <Stack.Screen name="custom" options={{ title: 'Custom' }} />
        </Stack>
    );
}