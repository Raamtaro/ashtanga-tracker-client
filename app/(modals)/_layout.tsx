// app/(modals)/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

export default function ModalsLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: true,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
            <Text style={{ fontSize: 16 }}>Close</Text>
          </Pressable>
        ),
      }}
    />
  );
}
