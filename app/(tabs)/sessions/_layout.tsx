import { Stack } from 'expo-router';

export default function SessionsStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Sessions', headerShown: false }} />
      <Stack.Screen name="[id]" options={{ }} />
    </Stack>
  );
}