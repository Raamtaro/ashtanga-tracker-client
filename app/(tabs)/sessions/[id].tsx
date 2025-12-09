// app/(tabs)/sessions/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function SessionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: '#0b0b0c' }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Session {id}</Text>
            <Text style={{ color: '#c7cad1', marginTop: 8 }}>Detail screen placeholder.</Text>
        </View>
    );
}