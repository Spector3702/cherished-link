import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Function to register for push notifications and get the token
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token;
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        alert('Permission not granted to get push token for push notification!');
        return;
    }

    const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
        alert('Project ID not found');
        return;
    }

    try {
        token = (
            await Notifications.getExpoPushTokenAsync({
                projectId,
            })
        ).data;
        console.log('Expo Push Token:', token);
    } catch (e) {
        console.error('Error getting push token:', e);
        alert(`Error getting push token: ${e}`);
    }

    return token;
}

// Function to send the token to the backend
export async function sendTokenToBackend(token: string) {
    try {
        const response = await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + '/expo-token', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: 'user_id_or_name', // Include any additional user information if needed
                expoPushToken: token,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send token to backend');
        }

        console.log('Token sent to backend successfully');
        alert('Token sent to backend successfully');
    } catch (error) {
        console.error('Error sending token to backend:', error);
        alert(`Error sending token to backend: ${error}`);
    }
}