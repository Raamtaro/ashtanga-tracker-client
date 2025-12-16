import { Stack, useRouter } from 'expo-router';

export default function SessionsLayout() {
  const router = useRouter();
  return (
    <Stack  screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
      />
      <Stack.Screen name="[id]" options={{ title: 'Session' }} />
    </Stack>
  );
}