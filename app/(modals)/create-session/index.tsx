// app/(modals)/create-session/index.tsx
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function CreateSession() {
  return (
    <View style={{ flex: 1, padding: 24, gap: 12 }}>
      <Pressable
        onPress={() => router.push('/(modals)/create-session/preset')}
        style={{ padding: 16, borderRadius: 12, borderWidth: 1 }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Standard</Text>
        <Text style={{ marginTop: 6, opacity: 0.7 }}>Half Primary, Full Primary, Intermediate, Advanced A/B</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push('/(modals)/create-session/custom')}
        style={{ padding: 16, borderRadius: 12, borderWidth: 1 }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Custom</Text>
        <Text style={{ marginTop: 6, opacity: 0.7 }}>Build a plan by series + "up to pose"</Text>
      </Pressable>
    </View>
  );
}