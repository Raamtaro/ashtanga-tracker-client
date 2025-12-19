import { Stack, useRouter } from 'expo-router';

export default function SessionsLayout() {
  const router = useRouter();
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="index"
      />
      <Stack.Screen name="[id]" options={{ title: 'Session' }} />
    </Stack>
  );
}