// app/(modals)/_layout.tsx
import { Stack, useRouter } from 'expo-router';

export default function ModalsLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
      }}
    >
      <Stack.Screen name="create-session" options={{ headerShown: false }} />
    </Stack>
  );
}
