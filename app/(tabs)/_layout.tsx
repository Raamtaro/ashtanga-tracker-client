import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: true,  }}>
            <Tabs.Screen
                name="sessions"
                options={{ title: 'Sessions', tabBarLabel: 'Sessions' }}
            />
            <Tabs.Screen
                name="create"
                options={{ title: 'Create', tabBarLabel: 'Create' }}
            />
            <Tabs.Screen
                name="data"
                options={{ title: 'Data', tabBarLabel: 'Data' }}
            />
            <Tabs.Screen
                name="account"
                options={{ title: 'Account', tabBarLabel: 'Account' }}
            />
        </Tabs>
    );
}