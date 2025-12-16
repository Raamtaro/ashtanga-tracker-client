// app/(tabs)/sessions/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import SessionListItem from '@/components/SessionListItem';
import { api } from '@/lib/api'; // <- use your api.get()
import { useAuth } from '@/providers/AuthProvider';
import type { PracticeSessionDTO } from '@/types/sessions';

const PAGE_SIZE = 20;

export default function SessionsListScreen() {
    const router = useRouter();
    const auth = useAuth();                         // used only to enable the query

    const fetchPage = useCallback(
        ({ pageParam }: { pageParam?: string | null }) =>
            api.get<{ items: PracticeSessionDTO[]; nextCursor: string | null }>(
                'session',
                { limit: 20, cursor: pageParam ?? '' }
            ),
        []
    );
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching,
        status,
        error,
    } = useInfiniteQuery({
        queryKey: ['sessions', 'list'],
        queryFn: fetchPage,
        initialPageParam: null as string | null,
        getNextPageParam: (last) => last.nextCursor ?? null,
        enabled: !!auth,                            // wait until auth is ready
    });

    const items = (data?.pages ?? []).flatMap((p) => p.items);

    console.log(data); //returning undefined

    if (status === 'pending') {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (status === 'error') {
        return (
            <View style={{ flex: 1, gap: 12, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Couldn’t load sessions</Text>
                <Text style={{ color: '#c7cad1', textAlign: 'center' }}>
                    {String((error as Error)?.message ?? 'Error')}
                </Text>
                <Text onPress={() => refetch()} style={{ color: '#8ab4f8', marginTop: 12 }}>
                    Tap to retry
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                style={{ flex: 1, padding: 16, backgroundColor: '#0b0b0c' }}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SessionListItem
                        onPress={() =>
                            router.push(
                                { pathname: '/(tabs)/sessions/[id]', params: { id: item.id } } as any
                            )
                        }
                        label={item.label}
                        dateISO={item.date}
                        status={item.status}
                        overallScore={item.overallScore ?? undefined}
                        energyLevel={item.energyLevel ?? undefined}
                        mood={item.mood ?? undefined}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#fff" />
                }
                onEndReachedThreshold={0.4}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={{ paddingVertical: 16 }}>
                            <ActivityIndicator />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={{ paddingTop: 64, alignItems: 'center' }}>
                        <Text style={{ color: '#c7cad1' }}>No sessions yet.</Text>
                    </View>
                }
            />

            <Pressable
                onPress={() => router.push('/create-session' as any)}
                style={{
                    position: 'absolute',
                    right: 16,
                    // bottom: 16 + insets.bottom,
                    bottom: 90, // quick hack to sit above tab bar; replace w/ insets.bottom
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    elevation: 6,
                }}
            >
                <Ionicons name="add" size={24} color="#000" />
            </Pressable>
        </View>


    );
}
