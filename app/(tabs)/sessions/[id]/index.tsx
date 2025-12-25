// app/(tabs)/sessions/[id]/index.tsx
import ScoreCardListItem from '@/components/ScoreCardListItem';
import { api } from '@/lib/api';
import type { ScoreCardListItemDTO } from '@/types/scoreCardList';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useLayoutEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

export default function SessionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const navigation = useNavigation();

    const { data, isLoading, error } = useQuery({
        queryKey: ['scoreCards', 'list', id],
        enabled: !!id,
        queryFn: async (): Promise<ScoreCardListItemDTO[]> => {
            // IMPORTANT: depending on how your api.buildUrl joins strings,
            // you may need either "/session/..." or "session/..."
            // If you ever see Cannot GET //session/... then remove the leading slash.
            const result = await api.get<{ session: { scoreCards: ScoreCardListItemDTO[] } }>(
                `session/${id}`
            );
            return result.session.scoreCards;
        },
    });

    const items = data ?? [];
    const firstCardId = useMemo(() => items[0]?.id ?? null, [items]);

    useLayoutEffect(() => {
        if (!firstCardId || !id) return;

        navigation.setOptions({
            headerRight: () => (
                <Text
                    onPress={() =>
                        router.push({
                            pathname: '/(tabs)/sessions/[id]/edit/[cardId]',
                            params: { id, cardId: firstCardId },
                        } as any)
                    }
                    style={{ fontWeight: '600', fontSize: 16 }}
                >
                    Edit
                </Text>
            ),
        });
    }, [navigation, firstCardId, id]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0b0c' }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, padding: 16, backgroundColor: '#0b0b0c' }}>
                <Text style={{ color: 'tomato' }}>Error loading score cards</Text>
                <Text style={{ color: '#c7cad1', marginTop: 8 }}>{String((error as Error).message)}</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#0b0b0c' }}>
            <FlatList
                contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ScoreCardListItem
                        onPress={() =>
                            router.push({
                                pathname: '/(tabs)/sessions/[id]/edit/[cardId]',
                                params: { id, cardId: item.id },
                            } as any)
                        }
                        poseName={item.pose.sanskritName}
                        side={item.side}
                        overallScore={item.overallScore}
                    />
                )}
                ListHeaderComponent={
                    <View style={{ marginBottom: 8 }}>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Session</Text>
                        <Text style={{ color: '#c7cad1', marginTop: 4 }}>{id}</Text>
                    </View>
                }
            />
        </View>
    );
}
