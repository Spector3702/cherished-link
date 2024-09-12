import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

// Function to send the token to the backend
async function sendTokenToBackend(token: string) {
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

// Function to register for push notifications and get the token
async function registerForPushNotificationsAsync() {
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

export default function Notification() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notifications, setNotifications] = useState([
    { id: '1', time: '07/10 09:00', message: 'Notification message example 1' },
    { id: '2', time: '07/10 10:30', message: 'Notification message example 2' },
  ]);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Refs to hold notification listeners
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Register for notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        sendTokenToBackend(token);
      }
    });

    (async () => {
      try {
        // Attempt to enable high accuracy mode using Google Play services
        await Location.enableNetworkProviderAsync();

        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          console.error('Location permission not granted');
          return;
        }

        // Retrieve the current location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);

        console.log('Location retrieved successfully:', currentLocation);
      } catch (error) {
        console.error('Error fetching location:', error);
        setErrorMsg('An error occurred while fetching location');
      }
    })();

    // Listener for receiving notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
      setNotifications(currentNotifications => [
        ...currentNotifications,
        {
          id: `${Date.now()}`,
          time: new Date().toLocaleString(),
          message: notification.request.content.body ?? 'No message',
        },
      ]);
    });

    // Listener for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Response:', response);
    });

    // Cleanup on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const handleSendToken = async () => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setExpoPushToken(token);
      await sendTokenToBackend(token);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Your Expo push token: {expoPushToken}</Text>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <View style={styles.notification}>
            <Text>{item.time}</Text>
            <Text>{item.message}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />
      <Button title="Register and Send Token" onPress={handleSendToken} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notification: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
});
