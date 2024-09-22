import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { getLocationAsync } from './services/locationService';
import {
  registerForPushNotificationsAsync,
  sendTokenToBackend
} from './services/notificationService';

export default function Notification() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notifications, setNotifications] = useState([
    { id: '1', time: 'Current', message: 'Hi there, Welcome to cherished-link' },
  ]);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Register for notifications and send token to the backend
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        sendTokenToBackend(token);
      }
    });

    // Get location
    getLocationAsync()
      .then(setLocation)
      .catch(setErrorMsg);

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

  return (
    <View style={styles.container}>
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
      <Button title="Register and Send Token" onPress={async () => {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setExpoPushToken(token);
          await sendTokenToBackend(token);
        }
      }} />
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
