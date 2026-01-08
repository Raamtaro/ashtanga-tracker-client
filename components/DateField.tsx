import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

type Props = {
    label?: string;
    value: Date;
    onChange: (next: Date) => void;
};

function formatDate(d: Date) {
    // nice + stable in RN
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function DateField({ label = 'Date', value, onChange }: Props) {
    const [open, setOpen] = useState(false);

    const displayValue = useMemo(() => formatDate(value), [value]);

    const handleChange = (_e: DateTimePickerEvent, selected?: Date) => {
        // Android sends "dismissed" sometimes
        if (Platform.OS === 'android') setOpen(false);
        if (!selected) return;

        // Normalize: keep current time-of-day, but change the calendar date
        // (Feels good for MVP; avoids everything being "00:00")
        const now = new Date();
        const next = new Date(selected);
        next.setHours(now.getHours(), now.getMinutes(), 0, 0);

        onChange(next);

        if (Platform.OS === 'ios') setOpen(false);
    };

    return (
        <View style={{ gap: 8 }}>
            <Text style={{ opacity: 0.85 }}>{label}</Text>

            <Pressable
                onPress={() => setOpen(true)}
                style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Text style={{ fontWeight: '600' }}>{displayValue}</Text>
                <Text style={{ opacity: 0.6 }}>Change</Text>
            </Pressable>

            {open ? (
                <DateTimePicker
                    value={value}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={handleChange}
                />
            ) : null}

            {Platform.OS === 'ios' && open ? (
                <Pressable
                    onPress={() => setOpen(false)}
                    style={{
                        alignSelf: 'flex-end',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                    }}
                >
                    <Text style={{ fontWeight: '700' }}>Done</Text>
                </Pressable>
            ) : null}
        </View>
    );
}
