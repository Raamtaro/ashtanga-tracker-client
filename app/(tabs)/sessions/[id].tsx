// app/(tabs)/sessions/[id].tsx
import ScoreCardListItem from '@/components/ScoreCardListItem';
import { api } from '@/lib/api';
import type { ScoreCardListItemDTO } from '@/types/scoreCardList';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

export default function SessionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const getScoreCardList = async (): Promise<ScoreCardListItemDTO[]> => {
        const result = await api.get<{ session: { scoreCards: ScoreCardListItemDTO[] } }>(
            `session/${id}`
        )



        return result.session.scoreCards;
    }
    const { data, isLoading, error } = useQuery(
        {
            queryKey: ['scoreCards', 'list', id],
            enabled: !!id,
            queryFn: getScoreCardList,
        }
    )

    // console.log(data);

    const items = data ?? [];

    console.log(items);

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (error) {
        return <Text>Error loading score cards</Text>;
    }

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: '#0b0b0c' }}>
            <Pressable onPress={() => router.replace('/(tabs)/sessions')}>
                <Text style={{ color: 'white', }}>Back to Sessions</Text>
            </Pressable>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Session {id}</Text>
            <Text style={{ color: '#c7cad1', marginTop: 8 }}>Detail screen placeholder.</Text>
            {/* <FlatList
                data={[{ key: 'Pose 1', score: 85 }, { key: 'Pose 2', score: 90 }]}
                renderItem={({ item }) => (
                    <ScoreCardListItem

                    />
                )}
            /> */}
            <FlatList
                style={{ flex: 1, padding: 16, backgroundColor: '#0b0b0c' }}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                data={items}
                renderItem={({ item }) => (
                    <ScoreCardListItem

                        key={item.id}
                        poseName={item.pose.sanskritName}
                        side={item.side}
                        overallScore={item.overallScore}
                    />
                )}
            />
        </View>
    );
}