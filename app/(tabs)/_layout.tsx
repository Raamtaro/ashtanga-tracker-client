import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#2d5bff',
                tabBarInactiveTintColor: '#9aa0aa',
                tabBarStyle: { backgroundColor: '#0b0b0c', borderTopColor: '#0b0b0c' },
            }}
        >
            <Tabs.Screen
                name="sessions"
                options={{
                    title: 'Sessions',
                    tabBarLabel: 'Sessions',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'calendar' : 'calendar-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="dataV2"
                options={{
                    title: 'Data',
                    tabBarLabel: 'Data',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'stats-chart' : 'stats-chart-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="account"
                options={{
                    title: 'Account',
                    tabBarLabel: 'Account',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'person-circle' : 'person-circle-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
