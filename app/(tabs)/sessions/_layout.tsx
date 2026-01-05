import { Stack, useRouter } from 'expo-router';

export default function SessionsLayout() {
  const router = useRouter();
  return (
    <Stack screenOptions={{ 
      headerShown: true,
              headerStyle: { backgroundColor: '#0b0b0c' },
        headerTintColor: 'white',
        headerShadowVisible: false,
        // headerBackTitleVisible: false,
      }}>
      <Stack.Screen name="index" options={{ title: "All Sessions"}}/>
      <Stack.Screen name="[id]" options={{ title: 'Session', headerShown: false }} />
    </Stack>
  );
}