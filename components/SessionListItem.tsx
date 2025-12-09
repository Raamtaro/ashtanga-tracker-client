import { Text, View } from 'react-native';
import Card from './ui/Card';

type Props = {
    onPress?: () => void;
    label?: string | null;
    dateISO: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    overallScore?: number | null;
    energyLevel?: number | null;
    mood?: number | null;
};

export default function SessionListItem({
    onPress,
    label,
    dateISO,
    status,
    overallScore,
    energyLevel,
    mood,
}: Props) {
    const d = new Date(dateISO);
    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <Card onPress={onPress} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    {label || 'Practice Session'}
                </Text>
                <Text style={{ color: '#9aa0a6', fontSize: 12 }}>{status}</Text>
            </View>

            <Text style={{ color: '#c7cad1' }}>{dateStr}</Text>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                {overallScore != null && (
                    <Text style={{ color: '#c7cad1' }}>Score: <Text style={{ color: 'white' }}>{overallScore.toFixed(1)}</Text></Text>
                )}
                {energyLevel != null && (
                    <Text style={{ color: '#c7cad1' }}>Energy: <Text style={{ color: 'white' }}>{energyLevel}</Text></Text>
                )}
                {mood != null && (
                    <Text style={{ color: '#c7cad1' }}>Mood: <Text style={{ color: 'white' }}>{mood}</Text></Text>
                )}
            </View>
        </Card>
    );
}