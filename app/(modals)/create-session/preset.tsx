import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { createPresetSession } from '@/lib/api';
import type { PracticeType } from '@/types/sessions';

const PRESETS: { label: string; value: Exclude<PracticeType, 'CUSTOM'> }[] = [
    { label: 'Half Primary', value: 'HALF_PRIMARY' },
    { label: 'Full Primary', value: 'FULL_PRIMARY' },
    { label: 'Intermediate', value: 'INTERMEDIATE' },
    { label: 'Advanced A', value: 'ADVANCED_A' },
    { label: 'Advanced B', value: 'ADVANCED_B' },
];

export default function CreatePreset() {
    const [practiceType, setPracticeType] = useState(PRESETS[0].value);
    const [label, setLabel] = useState('');
    const [duration, setDuration] = useState(''); // minutes

    const mut = useMutation({
        mutationFn: () =>
            createPresetSession({
                practiceType,
                label: label.trim() || undefined,
                duration: duration ? Number(duration) : undefined,
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

    return (
        <ScrollView style={{ flex: 1}} contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Practice Type</Text>

            <View style={{ gap: 8 }}>
                {PRESETS.map((p) => (
                    <Pressable
                        key={p.value}
                        onPress={() => setPracticeType(p.value)}
                        style={{
                            padding: 12,
                            borderRadius: 10,
                            borderWidth: 1,
                            opacity: practiceType === p.value ? 1 : 0.6,
                        }}
                    >
                        <Text style={{ fontSize: 16 }}>{p.label}</Text>
                    </Pressable>
                ))}
            </View>

            <Text style={{ marginTop: 12 }}>Label (optional)</Text>
            <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder="e.g. Morning practice"
                style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
            />

            <Text>Duration minutes (optional)</Text>
            <TextInput
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholder="e.g. 90"
                style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
            />

            <Pressable
                disabled={mut.isPending}
                onPress={() => mut.mutate()}
                style={{ marginTop: 18, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' }}
            >
                {mut.isPending ? <ActivityIndicator /> : <Text style={{ fontSize: 16, fontWeight: '600' }}>Create</Text>}
            </Pressable>

            {!!mut.error && (
                <Text style={{ marginTop: 10, color: 'tomato' }}>{String((mut.error as Error).message)}</Text>
            )}
        </ScrollView>
    );
}
