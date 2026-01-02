import { api } from '@/lib/api';
import Slider from '@react-native-community/slider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';

type ScoreCardDTO = {
    id: string;
    sessionId: string;
    segment: string | null;
    side: string | null;
    skipped: boolean;
    notes: string | null;
    ease: number | null;
    comfort: number | null;
    stability: number | null;
    pain: number | null;
    breath: number | null;
    focus: number | null;
    overallScore: number | null;
    pose: {
        sanskritName: string;
    }
};

type SessionDetailDTO = {
    id: string;
    scoreCards: Array<{ id: string; side: string | null; pose: { slug: string; sequenceGroup: string } }>;
};

type UpdateScoreCardInput = Partial<Pick<
    ScoreCardDTO,
    'skipped' | 'notes' | 'side' | 'ease' | 'comfort' | 'stability' | 'pain' | 'breath' | 'focus'
>>;

const METRICS: Array<{ key: keyof UpdateScoreCardInput; label: string }> = [
    { key: 'ease', label: 'Ease' },
    { key: 'comfort', label: 'Comfort' },
    { key: 'stability', label: 'Stability' },
    { key: 'pain', label: 'Pain' },
    { key: 'breath', label: 'Breath' },
    { key: 'focus', label: 'Focus' },
];

export default function ScoreCardEditScreen() {
    const qc = useQueryClient();
    const { id, cardId } = useLocalSearchParams<{ id: string; cardId: string }>();

    const sessionQ = useQuery({
        queryKey: ['session', id],
        enabled: !!id,
        queryFn: async (): Promise<SessionDetailDTO> => {
            const result = await api.get<{ session: SessionDetailDTO }>(`session/${id}`);
            return result.session;
        },
    });

    const cardQ = useQuery({
        queryKey: ['scoreCard', cardId],
        enabled: !!cardId,
        queryFn: () => api.get<{ scoreCard: ScoreCardDTO }>(`score-card/${cardId}`),
    });

    const session = sessionQ.data;
    const scoreCard = cardQ.data?.scoreCard;

    const meta = useMemo(() => session?.scoreCards.find((c) => c.id === cardId) ?? null, [session, cardId]);


    const order = useMemo(() => (session?.scoreCards ?? []).map((c) => c.id), [session]);
    const idx = useMemo(() => order.indexOf(String(cardId)), [order, cardId]);
    const prevId = idx > 0 ? order[idx - 1] : null;
    const nextId = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;

    // local form state
    const [skipped, setSkipped] = useState(false);
    const [notes, setNotes] = useState('');
    const [metrics, setMetrics] = useState<Record<string, number | null>>({});
    const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!scoreCard) return;
        setSkipped(scoreCard.skipped);
        setNotes(scoreCard.notes ?? '');
        setMetrics({
            ease: scoreCard.ease,
            comfort: scoreCard.comfort,
            stability: scoreCard.stability,
            pain: scoreCard.pain,
            breath: scoreCard.breath,
            focus: scoreCard.focus,
        });
    }, [cardId, cardQ.dataUpdatedAt]); // reset when card changes

    const mut = useMutation({
        mutationFn: (payload: UpdateScoreCardInput) =>
            api.patch<{ scoreCard: ScoreCardDTO }>(`score-card/${cardId}`, payload),
        onSuccess: (data) => {
            qc.setQueryData(['scoreCard', cardId], (old: any) => {
                const oldCard = old?.scoreCard;
                const newCard = data.scoreCard;

                return {
                    scoreCard: {
                        ...oldCard,
                        ...newCard,
                        // preserve nested relations if PATCH doesn't return them
                        pose: oldCard?.pose ?? newCard.pose,
                    },
                };
            });
        },
    });

    const save = (payload: UpdateScoreCardInput) => mut.mutate(payload);

    const setMetric = (k: string, v: number | null) => setMetrics((m) => ({ ...m, [k]: v }));

    const disabled = skipped;

    useEffect(() => {
        console.log('ScoreCard and Session loaded', { scoreCard, session });
    }, [cardQ, sessionQ])

    useEffect(() => {
        console.log('Error in sessionQ or cardQ', { sessionError: sessionQ.error, cardError: cardQ.error });
    }, [sessionQ.error, cardQ.error])

    if (sessionQ.isLoading || cardQ.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!session || !scoreCard) {
        return (
            <View style={{ flex: 1, padding: 16 }}>
                <Text style={{ color: 'tomato' }}>Failed to load editor.</Text>
            </View>
        );
    }

    //

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} keyboardShouldPersistTaps="handled">
                <Text style={{ fontSize: 18, fontWeight: '700' }}>
                    {scoreCard.pose.sanskritName ?? 'Pose'} {meta?.side && meta.side !== 'NA' ? `(${meta.side})` : ''}
                </Text>
                <Text style={{ opacity: 0.7, marginBottom: 14 }}>
                    {idx >= 0 ? `${idx + 1} / ${order.length}` : ''} {meta?.pose.sequenceGroup ? `• ${meta.pose.sequenceGroup}` : ''}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600' }}>Skipped</Text>
                    <Switch
                        value={skipped}
                        onValueChange={(v) => {
                            setSkipped(v);
                            save({ skipped: v }); // backend will null metrics if skipping
                        }}
                    />
                </View>

                <View style={{ opacity: disabled ? 0.4 : 1 }}>
                    {METRICS.map(({ key, label }) => {
                        const val = (metrics[key as string] ?? 5) as number;
                        return (
                            <View key={String(key)} style={{ marginBottom: 18 }}>
                                <Text style={{ fontWeight: '600', marginBottom: 8 }}>
                                    {label}: {disabled ? '—' : (metrics[key as string] ?? '—')}
                                </Text>
                                <Slider
                                    disabled={disabled}
                                    minimumValue={1}
                                    maximumValue={10}
                                    step={1}
                                    value={typeof val === 'number' ? val : 5}
                                    onSlidingComplete={(v) => {
                                        setMetric(String(key), v);
                                        save({ [key]: v } as any);
                                    }}
                                />
                            </View>
                        );
                    })}

                    <Text style={{ fontWeight: '600', marginBottom: 8 }}>Notes</Text>
                    <TextInput
                        editable={!disabled}
                        value={notes}
                        onChangeText={(t) => {
                            setNotes(t);
                            if (notesTimer.current) clearTimeout(notesTimer.current);
                            notesTimer.current = setTimeout(() => {
                                save({ notes: t.trim().length ? t : null });
                            }, 600);
                        }}
                        placeholder="Anything notable?"
                        multiline
                        style={{ borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 90 }}
                    />
                </View>

                {!!mut.error && <Text style={{ color: 'tomato', marginTop: 12 }}>{String((mut.error as Error).message)}</Text>}
                {mut.isPending && <Text style={{ opacity: 0.7, marginTop: 8 }}>Saving…</Text>}
            </ScrollView>

            {/* Bottom nav */}
            <View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: 12,
                    borderTopWidth: 1,
                    flexDirection: 'row',
                    gap: 10,
                    backgroundColor: 'white',
                }}
            >
                <Pressable
                    disabled={!prevId}
                    onPress={() =>
                        router.replace({
                            pathname: '/(tabs)/sessions/[id]/edit/[cardId]',
                            params: { id, cardId: prevId! },
                        } as any)
                    }
                    style={{ flex: 1, padding: 14, borderWidth: 1, borderRadius: 12, opacity: prevId ? 1 : 0.4, alignItems: 'center' }}
                >
                    <Text style={{ fontWeight: '600' }}>Prev</Text>
                </Pressable>

                <Pressable
                    onPress={() => {
                        if (nextId) {
                            router.replace({
                                pathname: '/(tabs)/sessions/[id]/edit/[cardId]',
                                params: { id, cardId: nextId },
                            } as any);
                        } else {
                            router.replace({ pathname: '/(tabs)/sessions/[id]', params: { id } } as any);
                        }
                    }}
                    style={{ flex: 1, padding: 14, borderWidth: 1, borderRadius: 12, alignItems: 'center' }}
                >
                    <Text style={{ fontWeight: '600' }}>{nextId ? 'Next' : 'Done'}</Text>
                </Pressable>
            </View>
        </View>
    );
}
