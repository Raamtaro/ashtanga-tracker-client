// app/(tabs)/sessions/[id].tsx
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function SessionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: '#0b0b0c' }}>
            <Pressable onPress={() => router.replace('/(tabs)/sessions')}>
                <Text style={{color: 'white', }}>Back to Sessions</Text>
            </Pressable>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Session {id}</Text>
            <Text style={{ color: '#c7cad1', marginTop: 8 }}>Detail screen placeholder.</Text>

        </View>
    );
}