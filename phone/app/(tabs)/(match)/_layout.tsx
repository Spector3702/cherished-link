import { Stack } from 'expo-router';

export default function MatchLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#f4511e',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}>
            <Stack.Screen name="index" options={{ title: '配對' }} />
            <Stack.Screen name="match_status" options={{ title: '配對狀態' }} />
        </Stack>
    );
}
