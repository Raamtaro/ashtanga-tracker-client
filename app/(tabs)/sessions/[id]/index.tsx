// app/(tabs)/sessions/[id]/index.tsx
import ScoreCardListItem from '@/components/ScoreCardListItem';
import { api } from '@/lib/api';
import type { ScoreCardListItemDTO } from '@/types/scoreCardList';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SessionDetailDTO = {
    id: string;
    status: 'DRAFT' | 'PUBLISHED';
    date: string;
    overallScore: number | null;

    summary: {
        total: number;
        complete: number;
        incomplete: number;
        firstIncompleteScoreCardId: string | null;
    };

    scoreCards: ScoreCardListItemDTO[];
};

function ActionBtn({
    label,
    onPress,
    disabled,
    tone = 'default',
}: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    tone?: 'default' | 'primary' | 'danger';
}) {
    const bg =
        tone === 'primary' ? '#2d5bff' : tone === 'danger' ? '#ff4d4d' : '#1c1f25';

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 999,
                backgroundColor: bg,
                opacity: disabled ? 0.45 : 1,
            }}
        >
            <Text style={{ color: 'white', fontWeight: '800' }}>{label}</Text>
        </Pressable>
    );
}

function Toast({
    visible,
    message,
    actionLabel,
    onAction,
    onClose,
}: {
    visible: boolean;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    onClose: () => void;
}) {
    if (!visible) return null;
    return (
        <View
            style={{
                position: 'absolute',
                left: 12,
                right: 12,
                bottom: 12,
                backgroundColor: '#1c1f25',
                borderRadius: 14,
                padding: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 12,
                borderWidth: 1,
                borderColor: '#2a2d33',

                zIndex: 999,     // ✅ iOS layering
                elevation: 10,   // ✅ Android layering
            }}
        >
            <Text style={{ color: 'white', flex: 1 }}>{message}</Text>

            {actionLabel && onAction ? (
                <Pressable onPress={onAction} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
                    <Text style={{ color: '#5b87ff', fontWeight: '800' }}>{actionLabel}</Text>
                </Pressable>
            ) : null}

            <Pressable
                onPress={onClose}
                hitSlop={12}
                style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
                <Text style={{ color: '#9aa0aa', fontWeight: '800' }}>OK</Text>
            </Pressable>
        </View>
    );
}

export default function SessionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const navigation = useNavigation();
    const qc = useQueryClient();
    const router = useRouter();

    const [toast, setToast] = useState<{ msg: string; action?: () => void; actionLabel?: string } | null>(null);

    console.log(id)

    const goBack = () => {
        // go back if possible, otherwise fallback
        // @ts-ignore
        if (navigation.canGoBack?.()) navigation.goBack();
        else router.replace('/(tabs)/sessions');
    };

    const publishMut = useMutation({
        mutationFn: async () => {
            return api.put<{ session: { id: string; status: string; overallScore: number | null } }>(`session/${id}/publish`, {});
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['session', id] });
            qc.invalidateQueries({ queryKey: ['sessions'] }); // if you have a sessions list tab
        },
        onError: (err: any) => {
            const status = err?.status;
            const data = err?.data;

            console.log('publish error', err.status, err.message, err.data);

            if (status === 409 && data?.scoreCardId) {
                const label =
                    `${data.pose?.sanskritName ?? 'Pose'}` +
                    (data.side && data.side !== 'NA' ? ` • ${data.side}` : '');

                const missing = Array.isArray(data.missing) ? data.missing.join(', ') : '';

                setToast({
                    msg: `${data.message} ${label}${missing ? ` (missing: ${missing})` : ''}`,
                    actionLabel: 'Fix',
                    action: () => goEditCard(data.scoreCardId),
                });
                return;
            }

            setToast({ msg: `${status ?? ''} ${err?.message ?? 'Error'}`.trim() });
        }
    });

    const sessionQ = useQuery({
        queryKey: ['session', id],
        enabled: !!id,
        queryFn: async (): Promise<SessionDetailDTO> => {
            const result = await api.get<{ session: SessionDetailDTO }>(`session/${id}`);
            // console.log(result);
            return result.session;
        },
    });

    const session = sessionQ.data;
    const items = session?.scoreCards ?? [];

    const isPublished = session?.status === 'PUBLISHED';

    const firstIncomplete = useMemo(() => {
        const id = session?.summary.firstIncompleteScoreCardId;
        if (!id) return null;
        return items.find((c) => c.id === id) ?? null;
    }, [session?.summary.firstIncompleteScoreCardId, items]);

    const goEditCard = (cardId: string) => {
        router.push({
            pathname: '/(tabs)/sessions/[id]/edit/[cardId]',
            params: { id, cardId },
        } as any);
    };

    const onPressCard = (cardId: string) => {
        if (isPublished) {
            setToast({ msg: 'This session is published. Unpublish to edit.' });
            return;
        }
        goEditCard(cardId);
    };

    const onPressEdit = () => {
        if (!session) return;

        if (isPublished) {
            setToast({ msg: 'This session is published. Unpublish to edit.' });
            return;
        }

        const target = firstIncomplete?.id ?? items[0]?.id;
        if (!target) return;

        if (firstIncomplete) {
            Alert.alert(
                'Resume editing',
                `Continue where you left off? (${firstIncomplete.pose.sanskritName}${firstIncomplete.side && firstIncomplete.side !== 'NA' ? ` • ${firstIncomplete.side}` : ''})`,
                [
                    { text: 'Start at top', onPress: () => items[0]?.id && goEditCard(items[0].id) },
                    { text: 'Resume', onPress: () => goEditCard(target) },
                    { text: 'Cancel', style: 'cancel' },
                ]
            );
        } else {
            goEditCard(target);
        }
    };

    const onTogglePublish = () => publishMut.mutate();


    if (sessionQ.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0b0c' }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (sessionQ.error) {
        return (
            <View style={{ flex: 1, padding: 16, backgroundColor: '#0b0b0c' }}>
                <Text style={{ color: 'tomato' }}>Error loading score cards</Text>
                <Text style={{ color: '#c7cad1', marginTop: 8 }}>{String((sessionQ.error as Error).message)}</Text>
            </View>
        );
    }

    if (!session) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0b0c' }}>
                <Text style={{ color: 'white' }}>No session data found.</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0b0c' }} edges={['top']}>
            {/* Top row */}
            <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
                <Pressable
                    onPress={goBack}
                    style={{
                        alignSelf: 'flex-start',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 999,
                        backgroundColor: '#1c1f25',
                    }}
                >
                    <Text style={{ color: 'white', fontWeight: '800' }}>{'← All Sessions'}</Text>
                </Pressable>
            </View>
            <View style={{ padding: 16, paddingBottom: 8 }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>Session</Text>
                <Text style={{ color: '#9aa0aa', marginTop: 4 }}>
                    {new Date(session.date).toLocaleString()} • {session.status}
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <ActionBtn label="Edit" onPress={onPressEdit} disabled={isPublished} />
                    <ActionBtn
                        label={isPublished ? 'Unpublish' : 'Publish'}
                        onPress={onTogglePublish}
                        disabled={publishMut.isPending}
                        tone={isPublished ? 'default' : 'primary'}
                    />
                </View>
            </View>
            <FlatList
                contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ScoreCardListItem
                        onPress={() => onPressCard(item.id)}
                        poseName={item.pose.sanskritName}
                        side={item.side}
                        overallScore={item.overallScore}
                    />
                )}
                ListHeaderComponent={
                    <View style={{ marginBottom: 8 }}>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>ScoreCards</Text>
                    </View>
                }
            />
            <Toast
                visible={!!toast}
                message={toast?.msg ?? ''}
                actionLabel={toast?.actionLabel}
                onAction={toast?.action}
                onClose={() => setToast(null)}
            />
            {/* {publishMut.error ? (
                    <Text style={{ color: 'tomato', padding: 16 }}>
                        {String((publishMut.error as Error).message)}
                    </Text>
                ) : null} */}
        </SafeAreaView>
    );
}
