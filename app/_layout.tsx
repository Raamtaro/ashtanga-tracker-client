import { QueryClientProvider } from '@tanstack/react-query';
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { queryClient } from '../lib/query';
import { AuthProvider, useAuth } from '../providers/AuthProvider';

function RootNavigationGate() {
  const { isLoading, isAuthed } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navState = useRootNavigationState();

  useEffect(() => {
    // Wait until navigation is mounted, otherwise replace() can be ignored
    if (!navState?.key) return;
    if (isLoading) return;

    const group = segments[0]; // '(auth)' | '(tabs)' | '(modals)' | undefined
    const inAuthGroup = group === '(auth)';

    // Everything except (auth) requires auth (tabs + modals)
    if (!isAuthed && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    // If authed and sitting in auth screens, kick to app
    if (isAuthed && inAuthGroup) {
      router.replace('/(tabs)/sessions');
    }
  }, [navState?.key, isLoading, isAuthed, segments, router]);

  if (isLoading || !navState?.key) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="(modals)"
        options={{ presentation: 'modal' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigationGate />
      </AuthProvider>
    </QueryClientProvider>
  );
}
