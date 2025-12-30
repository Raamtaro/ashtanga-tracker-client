import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="sessions"
                options={{ title: 'Sessions', tabBarLabel: 'Sessions', }}
            />
            {/* <Tabs.Screen
                name="data"
                options={{ title: 'Data', tabBarLabel: 'Data' }}
            /> */}
            <Tabs.Screen
                name="dataV2"
                options={{ title: 'Data V2', tabBarLabel: 'Data' }}
            />
            <Tabs.Screen
                name="account"
                options={{ title: 'Account', tabBarLabel: 'Account' }}
            />
        </Tabs>
    );
}