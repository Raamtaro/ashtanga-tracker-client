import { Text, TextInput, View } from 'react-native';

export default function Field({
  label,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  textContentType,
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: any;
  textContentType?: any;
  autoComplete?: any;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontWeight: '600' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        textContentType={textContentType}
        autoComplete={autoComplete}
        placeholder={label}
        placeholderTextColor="#9aa0aa"
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />
    </View>
  );
}
