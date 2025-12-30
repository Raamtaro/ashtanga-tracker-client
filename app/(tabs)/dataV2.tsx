import Card from '@/components/ui/Card';
import { getPickerPoses, getPoseTrend, type AllowedMetric, type PoseTrendResponseDTO } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CustomGroup = 'PRIMARY' | 'INTERMEDIATE' | 'ADVANCED_A' | 'ADVANCED_B';
type TrendSide = 'BOTH' | 'LEFT' | 'RIGHT';
type PosePickerItem = {
    id: string;
    slug: string;
    sanskritName: string;
    englishName: string | null;
    sequenceGroup: string;
    isTwoSided: boolean;
}

const GROUPS_FOR_PICKER: CustomGroup[] = ['PRIMARY', 'INTERMEDIATE', 'ADVANCED_A', 'ADVANCED_B'];


const METRICS: AllowedMetric[] = [
    'overallScore',
    'ease',
    'comfort',
    'stability',
    'pain',
    'breath',
    'focus',
]

const SIDE_PILLS: Array<{ label: string; value: TrendSide }> = [
    { label: 'Both', value: 'BOTH' },
    { label: 'L', value: 'LEFT' },
    { label: 'R', value: 'RIGHT' },
]

const WINDOWS: Array<{ label: string; value: number | 'all' }> = [
    { label: '7d', value: 7 },
    { label: '30d', value: 30 },
    { label: '90d', value: 90 },
    { label: '180d', value: 180 },
    { label: '365d', value: 365 },
    { label: 'All', value: 'all' },
];


const dayKey = (iso: string) => iso.slice(0, 10); // YYYY-MM-DD
const toDayDate = (d: string) => new Date(`${d}T00:00:00`);

function avg(nums: number[]) {
    if (!nums.length) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function avgInLastNDays(series: Array<{ day: string; value: number }>, n: number, endDay?: string) {
    if (!series.length) return null;
    const lastDay = endDay ?? series[series.length - 1].day;
    const end = toDayDate(lastDay);
    const start = new Date(end);
    start.setDate(end.getDate() - (n - 1));

    const vals = series
        .filter((p) => {
            const d = toDayDate(p.day);
            return d >= start && d <= end;
        })
        .map((p) => p.value);

    return avg(vals);
}

function rollupDaily(resp: PoseTrendResponseDTO | undefined, metric: AllowedMetric) {
    const points = resp?.points ?? [];
    const map = new Map<string, number[]>();

    for (const p of points) {
        const v = p.values?.[metric];
        if (typeof v !== 'number') continue;
        const k = dayKey(p.sessionDate);
        const arr = map.get(k) ?? [];
        arr.push(v);
        map.set(k, arr);
    }

    const series = Array.from(map.entries())
        .map(([day, vals]) => ({ day, value: avg(vals)! }))
        .sort((a, b) => toDayDate(a.day).getTime() - toDayDate(b.day).getTime());

    return series;
}


function rollupDailyBySide(resp: PoseTrendResponseDTO | undefined, metric: AllowedMetric) {
    const points = resp?.points ?? [];
    const map = new Map<string, { L: number[]; R: number[] }>();

    for (const p of points) {
        const v = p.values?.[metric];
        if (typeof v !== 'number') continue;

        const day = dayKey(p.sessionDate);
        const bucket = map.get(day) ?? { L: [], R: [] };

        if (p.side === 'LEFT') bucket.L.push(v);
        else if (p.side === 'RIGHT') bucket.R.push(v);
        // ignore NA here; for single-sided poses we won’t use this rollup

        map.set(day, bucket);
    }

    return Array.from(map.entries())
        .map(([day, b]) => ({
            day,
            left: avg(b.L),
            right: avg(b.R),
        }))
        .sort((a, b) => toDayDate(a.day).getTime() - toDayDate(b.day).getTime());
}



// UI
function Pill({
    label,
    active,
    onPress,
}: {
    label: string;
    active?: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                opacity: active ? 1 : 0.55,
            }}
        >
            <Text style={{ color: 'white', fontWeight: '600' }}>{label}</Text>
        </Pressable>
    );
}

function MiniBarChart({
    series,
    height = 80,
}: {
    series: Array<{ day: string; value: number }>;
    height?: number;
}) {
    if (!series.length) return null;

    const values = series.map((s) => s.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const denom = max - min || 1;

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingVertical: 8 }}>
                {series.map((p) => {
                    const h = Math.max(2, Math.round(((p.value - min) / denom) * height));
                    return (
                        <View key={p.day} style={{ alignItems: 'center', width: 18 }}>
                            <View style={{ width: 14, height: h, borderRadius: 6, backgroundColor: '#5b87ff' }} />
                            <Text style={{ color: '#9aa0aa', fontSize: 10, marginTop: 4 }}>
                                {p.day.slice(5)}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

function MiniDualBarChart({
    series,
    height = 80,
}: {
    series: Array<{ day: string; left: number | null; right: number | null }>;
    height?: number;
}) {
    const vals = series.flatMap((s) => [s.left, s.right]).filter((v): v is number => typeof v === 'number');
    if (!vals.length) return null;

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const denom = max - min || 1;

    const hOf = (v: number) => Math.max(2, Math.round(((v - min) / denom) * height));

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingVertical: 8 }}>
                {series.map((p) => {
                    const hl = typeof p.left === 'number' ? hOf(p.left) : 2;
                    const hr = typeof p.right === 'number' ? hOf(p.right) : 2;

                    return (
                        <View key={p.day} style={{ alignItems: 'center', width: 26 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3 }}>
                                <View style={{ width: 9, height: hl, borderRadius: 6, backgroundColor: '#5b87ff' }} />
                                <View style={{ width: 9, height: hr, borderRadius: 6, backgroundColor: '#b35bff' }} />
                            </View>
                            <Text style={{ color: '#9aa0aa', fontSize: 10, marginTop: 4 }}>{p.day.slice(5)}</Text>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

//Main Screen

export default function DataV2Screen() {
    const [posePickerOpen, setPosePickerOpen] = useState(false);
    const [poseSearch, setPoseSearch] = useState('');
    const [selectedPose, setSelectedPose] = useState<PosePickerItem | null>(null);

    const [metric, setMetric] = useState<AllowedMetric>('overallScore');
    const [side, setSide] = useState<TrendSide>('BOTH');
    const [days, setDays] = useState<number | 'all'>(30);

    const [includeSkipped, setIncludeSkipped] = useState(false);


    const posesQ = useQuery({
        queryKey: ['poses', 'trendPicker'],
        queryFn: async () => {
            const res = await getPickerPoses(GROUPS_FOR_PICKER);
            return res;
        },
    });

    const poses: PosePickerItem[] = useMemo(() => {
        const raw = (posesQ.data?.poses ?? []) as any[];
        // ensure id exists; trend route uses pose.id
        return raw
            .filter((p) => p?.id)
            .map((p) => ({
                id: String(p.id),
                slug: String(p.slug),
                sanskritName: String(p.sanskritName),
                englishName: p.englishName ?? null,
                sequenceGroup: String(p.sequenceGroup),
                isTwoSided: Boolean(p.isTwoSided),
            }));
    }, [posesQ.data]);

    const filteredPoses = useMemo(() => {
        const q = poseSearch.trim().toLowerCase();
        if (!q) return poses;
        return poses.filter((p) => {
            return (
                p.slug.toLowerCase().includes(q) ||
                p.sanskritName.toLowerCase().includes(q) ||
                (p.englishName ?? '').toLowerCase().includes(q) ||
                p.sequenceGroup.toLowerCase().includes(q)
            );
        });
    }, [poses, poseSearch]);

    const trendQ = useQuery({
        queryKey: ['poseTrend', selectedPose?.id, metric, days, includeSkipped],
        enabled: !!selectedPose?.id,
        queryFn: () =>
            getPoseTrend(selectedPose!.id, {
                fields: metric,
                days,
                includeSkipped,
            }),
    });

    useEffect(() => {
        console.log('Trend Q data:', trendQ.data);
        console.log('Trend Q error:', trendQ.error);
    }, [trendQ.data, trendQ.error])
    useEffect(() => {
        if (!selectedPose) return;
        if (!selectedPose.isTwoSided) setSide('BOTH'); // harmless default; we just won't send it
    }, [selectedPose?.id]);

    const trend = trendQ.data;

    const dailyLR = useMemo(() => {
        if (!selectedPose?.isTwoSided) return [];
        return rollupDailyBySide(trend, metric);
    }, [trend, metric, selectedPose?.isTwoSided]);

    const daily = useMemo(() => {
        // single-sided pose -> simple rollup
        if (!selectedPose?.isTwoSided) return rollupDaily(trend, metric);

        // two-sided pose -> derive based on view mode
        if (side === 'LEFT') {
            return dailyLR
                .filter((d) => typeof d.left === 'number')
                .map((d) => ({ day: d.day, value: d.left! }));
        }

        if (side === 'RIGHT') {
            return dailyLR
                .filter((d) => typeof d.right === 'number')
                .map((d) => ({ day: d.day, value: d.right! }));
        }

        // BOTH: for stats + “Recent days” you probably want a combined number
        return dailyLR
            .map((d) => {
                const vals = [d.left, d.right].filter((v): v is number => typeof v === 'number');
                if (!vals.length) return null;
                return { day: d.day, value: avg(vals)! };
            })
            .filter(Boolean) as Array<{ day: string; value: number }>;
    }, [trend, metric, selectedPose?.isTwoSided, dailyLR, side]);


    const overallAvg = useMemo(() => avg(daily.map((d) => d.value)), [daily]);
    const last7 = useMemo(() => avgInLastNDays(daily, 7), [daily]);
    const prev7 = useMemo(() => {
        if (!daily.length) return null;
        // endDay is 7 days before the last day
        const lastDay = daily[daily.length - 1].day;
        const end = toDayDate(lastDay);
        end.setDate(end.getDate() - 7);
        const endDay = end.toISOString().slice(0, 10);
        return avgInLastNDays(daily, 7, endDay);
    }, [daily]);

    const delta7 = useMemo(() => {
        if (last7 === null || prev7 === null) return null;
        return last7 - prev7;
    }, [last7, prev7]);

    const showSide = !!selectedPose?.isTwoSided;
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0b0c' }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>Trends</Text>
                <Text style={{ color: '#9aa0aa', marginTop: 6 }}>
                    Pick a pose + metric, then we’ll chart your last {days === 'all' ? 'all-time' : `${days} days`}.
                </Text>
                {/* Pose selector */}
                <Card style={{ marginTop: 14, gap: 8 }} onPress={() => setPosePickerOpen(true)}>
                    <Text style={{ color: '#9aa0aa', fontSize: 12, fontWeight: '700' }}>Pose</Text>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                        {selectedPose ? selectedPose.sanskritName : 'Select a pose'}
                    </Text>
                    {selectedPose && (
                        <Text style={{ color: '#9aa0aa' }}>
                            {selectedPose.sequenceGroup} • {selectedPose.slug}
                        </Text>
                    )}
                </Card>

                {/* Metric */}
                <Text style={{ color: 'white', marginTop: 18, fontWeight: '800' }}>Metric</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {METRICS.map((m) => (
                            <Pill
                                key={m}
                                label={m}
                                active={metric === m}
                                onPress={() => setMetric(m)}
                            />
                        ))}
                    </View>
                </ScrollView>

                {/* Side */}
                <View style={{ marginTop: 18, gap: 14 }}>
                    {showSide && (
                        <View>
                            <Text style={{ color: 'white', fontWeight: '800' }}>Side</Text>
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                                {SIDE_PILLS.map((s) => (
                                    <Pill
                                        key={s.value}
                                        label={s.label}
                                        active={side === s.value}
                                        onPress={() => setSide(s.value)}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                    {/* Window */}
                    <View>
                        <Text style={{ color: 'white', fontWeight: '800' }}>Window</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                            {WINDOWS.map((w) => (
                                <Pill
                                    key={String(w.value)}
                                    label={w.label}
                                    active={days === w.value}
                                    onPress={() => setDays(w.value)}
                                />
                            ))}
                        </View>

                        <Pressable
                            onPress={() => setIncludeSkipped((v) => !v)}
                            style={{ marginTop: 10, paddingVertical: 8 }}
                        >
                            <Text style={{ color: '#9aa0aa' }}>
                                Include skipped: <Text style={{ color: 'white', fontWeight: '700' }}>{includeSkipped ? 'Yes' : 'No'}</Text>
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Trend Output */}
                <View style={{ marginTop: 18 }}>
                    {!selectedPose ? (
                        <Text style={{ color: '#9aa0aa' }}>Pick a pose to see trends.</Text>
                    ) : trendQ.isLoading ? (
                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                            <ActivityIndicator />
                            <Text style={{ color: '#9aa0aa', marginTop: 8 }}>Loading trend…</Text>
                        </View>
                    ) : trendQ.error ? (
                        <Text style={{ color: 'tomato' }}>Trend failed to load.</Text>
                    ) : (
                        <>
                            <Card style={{ gap: 10 }}>
                                <Text style={{ color: '#9aa0aa', fontSize: 12, fontWeight: '800' }}>Tiny stats</Text>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: 'white', fontWeight: '700' }}>Avg</Text>
                                    <Text style={{ color: 'white', fontWeight: '800' }}>
                                        {overallAvg === null ? '—' : overallAvg.toFixed(2)}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: 'white', fontWeight: '700' }}>Last 7d</Text>
                                    <Text style={{ color: 'white', fontWeight: '800' }}>
                                        {last7 === null ? '—' : last7.toFixed(2)}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: 'white', fontWeight: '700' }}>Δ vs prev 7d</Text>
                                    <Text style={{ color: 'white', fontWeight: '800' }}>
                                        {delta7 === null ? '—' : `${delta7 >= 0 ? '+' : ''}${delta7.toFixed(2)}`}
                                    </Text>
                                </View>
                            </Card>

                            <View style={{ marginTop: 14 }}>
                                <Text style={{ color: 'white', fontWeight: '800' }}>Chart</Text>
                                <Card style={{ marginTop: 10 }}>
                                    {selectedPose?.isTwoSided && side === 'BOTH' ? (
                                        dailyLR.length ? (
                                            <MiniDualBarChart series={dailyLR} />
                                        ) : (
                                            <Text style={{ color: '#9aa0aa' }}>No data points in this window.</Text>
                                        )
                                    ) : (
                                        daily.length ? (
                                            <MiniBarChart series={daily} />
                                        ) : (
                                            <Text style={{ color: '#9aa0aa' }}>No data points in this window.</Text>
                                        )
                                    )}
                                </Card>
                            </View>

                            <View style={{ marginTop: 14 }}>
                                <Text style={{ color: 'white', fontWeight: '800' }}>Recent days</Text>
                                <Card style={{ marginTop: 10 }}>
                                    {daily.length ? (
                                        daily
                                            .slice(-14)
                                            .reverse()
                                            .map((d) => (
                                                <View
                                                    key={d.day}
                                                    style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}
                                                >
                                                    <Text style={{ color: '#9aa0aa' }}>{d.day}</Text>
                                                    <Text style={{ color: 'white', fontWeight: '800' }}>{d.value.toFixed(2)}</Text>
                                                </View>
                                            ))
                                    ) : (
                                        <Text style={{ color: '#9aa0aa' }}>—</Text>
                                    )}
                                </Card>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={posePickerOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setPosePickerOpen(false)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0b0c' }}>
                    <View style={{ padding: 16, gap: 12, flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>Pick a pose</Text>
                            <Pressable onPress={() => setPosePickerOpen(false)} style={{ padding: 8 }}>
                                <Text style={{ color: 'white', fontWeight: '800' }}>Done</Text>
                            </Pressable>
                        </View>

                        <TextInput
                            value={poseSearch}
                            onChangeText={setPoseSearch}
                            placeholder="Search sanskrit / slug / group"
                            placeholderTextColor="#6f7682"
                            style={{
                                borderWidth: 1,
                                borderColor: '#2a2d33',
                                borderRadius: 12,
                                padding: 12,
                                color: 'white',
                            }}
                        />

                        {posesQ.isLoading ? (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <ActivityIndicator />
                            </View>
                        ) : posesQ.error ? (
                            <Text style={{ color: 'tomato' }}>Failed to load poses.</Text>
                        ) : (
                            <FlatList
                                data={filteredPoses}
                                keyExtractor={(p) => p.id}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => {
                                            setSelectedPose(item);
                                            setPosePickerOpen(false);
                                        }}
                                        style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1c1f25' }}
                                    >
                                        <Text style={{ color: 'white', fontSize: 16, fontWeight: '800' }}>
                                            {item.sanskritName}
                                        </Text>
                                        <Text style={{ color: '#9aa0aa' }}>
                                            {item.sequenceGroup} • {item.slug}
                                        </Text>
                                    </Pressable>
                                )}
                            />
                        )}
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    )
}