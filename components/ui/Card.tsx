import { PropsWithChildren } from 'react';
import { Pressable, View, ViewStyle } from 'react-native';

type Props = PropsWithChildren<{
    onPress?: () => void;
    style?: ViewStyle | ViewStyle[];
}>;

export default function Card({ children, onPress, style }: Props) {
    const base: ViewStyle = {
        backgroundColor: '#111214',
        borderColor: '#23262d',
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
    };

    if (onPress) {
        return (
            <Pressable onPress={onPress} style={[base, style]}>
                {children}
            </Pressable>
        );
    }
    return <View style={[base, style]}>{children}</View>;
}