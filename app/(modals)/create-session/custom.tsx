import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createCustomSession, getPickerPoses, type CustomGroup } from '@/lib/api';
import type { PoseDTO } from '@/types/sessions';

type Snippet = { group: CustomGroup; upToSlug: string };

const GROUPS: { label: string; value: CustomGroup }[] = [
    { label: 'Primary', value: 'PRIMARY' },
    { label: 'Intermediate', value: 'INTERMEDIATE' },
    { label: 'Advanced A', value: 'ADVANCED_A' },
    { label: 'Advanced B', value: 'ADVANCED_B' },
];

export default function CreateCustom() {
    const [label, setLabel] = useState('');
    const [duration, setDuration] = useState('');
    const [snippets, setSnippets] = useState<Snippet[]>([{ group: 'PRIMARY', upToSlug: '' }]);

    // picker modal state
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerIndex, setPickerIndex] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['poses', 'picker'],
        queryFn: () => getPickerPoses(['PRIMARY', 'INTERMEDIATE', 'ADVANCED_A', 'ADVANCED_B']),
    });

    const posesByGroup = useMemo(() => {
        const all = data?.poses ?? [];
        const map: Record<CustomGroup, PoseDTO[]> = {
            PRIMARY: [],
            INTERMEDIATE: [],
            ADVANCED_A: [],
            ADVANCED_B: [],
        };
        for (const p of all) {
            // sequenceGroup matches these group names in your DB
            if (p.sequenceGroup in map) map[p.sequenceGroup as CustomGroup].push(p);
        }
        return map;
    }, [data]);

    const openPicker = (index: number) => {
        setPickerIndex(index);
        setSearch('');
        setPickerOpen(true);
    };

    const selectedGroup = pickerIndex === null ? null : snippets[pickerIndex]?.group;
    const pickerList = useMemo(() => {
        if (!selectedGroup) return [];
        const list = posesByGroup[selectedGroup] ?? [];
        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((p) => p.slug.includes(q) || p.sanskritName.toLowerCase().includes(q) || (p.englishName ?? '').toLowerCase().includes(q));
    }, [posesByGroup, selectedGroup, search]);

    const mut = useMutation({
        mutationFn: () =>
            createCustomSession({
                practiceType: 'CUSTOM',
                label: label.trim() || undefined,
                duration: duration ? Number(duration) : undefined,
                sequenceSnippets: snippets.filter((s) => s.upToSlug.trim().length > 0),
            }),
        onSuccess: async (resp) => {
            router.dismiss();

            // then push the detail screen so you get a back button
            router.push({
                pathname: '/(tabs)/sessions/[id]',
                params: { id: resp.session.id },
            } as any);
        },
    });

    const canCreate = snippets.every((s) => s.upToSlug.trim().length > 0);

    return (
        <View style={{ flex: 1, padding: 16, gap: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Sequence snippets</Text>

            {snippets.map((s, idx) => (
                <View key={idx} style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 }}>
                    <Text style={{ fontWeight: '600' }}>Snippet {idx + 1}</Text>

                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                        {GROUPS.map((g) => (
                            <Pressable
                                key={g.value}
                                onPress={() => {
                                    const copy = [...snippets];
                                    copy[idx] = { ...copy[idx], group: g.value, upToSlug: '' };
                                    setSnippets(copy);
                                }}
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 10,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    opacity: s.group === g.value ? 1 : 0.5,
                                }}
                            >
                                <Text>{g.label}</Text>
                            </Pressable>
                        ))}
                    </View>

                    <Pressable
                        onPress={() => openPicker(idx)}
                        style={{ padding: 12, borderRadius: 10, borderWidth: 1 }}
                    >
                        <Text style={{ opacity: s.upToSlug ? 1 : 0.6 }}>
                            {s.upToSlug ? `Up to: ${s.upToSlug}` : 'Pick “up to” pose'}
                        </Text>
                    </Pressable>

                    {snippets.length > 1 && (
                        <Pressable
                            onPress={() => setSnippets(snippets.filter((_, i) => i !== idx))}
                            style={{ padding: 10 }}
                        >
                            <Text style={{ color: 'tomato' }}>Remove snippet</Text>
                        </Pressable>
                    )}
                </View>
            ))}

            <Pressable
                onPress={() => setSnippets([...snippets, { group: 'PRIMARY', upToSlug: '' }])}
                style={{ padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' }}
            >
                <Text>Add snippet</Text>
            </Pressable>

            <Text style={{ marginTop: 8 }}>Label (optional)</Text>
            <TextInput value={label} onChangeText={setLabel} style={{ borderWidth: 1, borderRadius: 10, padding: 12 }} />

            <Text>Duration minutes (optional)</Text>
            <TextInput
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
            />

            <Pressable
                disabled={!canCreate || mut.isPending}
                onPress={() => mut.mutate()}
                style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 1,
                    alignItems: 'center',
                    opacity: !canCreate ? 0.5 : 1,
                }}
            >
                {mut.isPending ? <ActivityIndicator /> : <Text style={{ fontWeight: '600' }}>Create</Text>}
            </Pressable>

            {!!mut.error && <Text style={{ color: 'tomato' }}>{String((mut.error as Error).message)}</Text>}

            {/* Pose Picker Modal */}
            <Modal visible={pickerOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPickerOpen(false)}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={{ flex: 1, padding: 16, gap: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 18, fontWeight: '600' }}>
                                Pick up-to pose {selectedGroup ? `(${selectedGroup})` : ''}
                            </Text>
                            <Pressable onPress={() => setPickerOpen(false)} style={{ padding: 8 }}>
                                <Text style={{ fontSize: 16 }}>Done</Text>
                            </Pressable>
                        </View>
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search slug / sanskrit / english"
                            style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
                        />
                        {isLoading ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator />
                            </View>
                        ) : (
                            <FlatList
                                data={pickerList}
                                keyExtractor={(p) => p.slug}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => {
                                            if (pickerIndex === null) return;
                                            const copy = [...snippets];
                                            copy[pickerIndex] = { ...copy[pickerIndex], upToSlug: item.slug };
                                            setSnippets(copy);
                                            setPickerOpen(false);
                                        }}
                                        style={{ paddingVertical: 12, borderBottomWidth: 1 }}
                                    >
                                        <Text style={{ fontWeight: '600' }}>{item.slug}</Text>
                                        <Text style={{ opacity: 0.7 }}>
                                            {item.sanskritName}{item.englishName ? ` — ${item.englishName}` : ''}
                                        </Text>
                                    </Pressable>
                                )}
                            />
                        )}
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
}
