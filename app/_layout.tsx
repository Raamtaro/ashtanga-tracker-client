import { QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { queryClient } from '../lib/query';
import { AuthProvider, useAuth } from '../providers/AuthProvider';

function RootNavigationGate() {
  const { isLoading, isAuthed } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthed && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthed && inAuthGroup) {
      router.replace('/(tabs)/sessions');
    }
  }, [isLoading, isAuthed, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Slot />;
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
