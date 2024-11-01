import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { getLocationAsync } from './services/locationService';
import {
  registerForPushNotificationsAsync,
  sendTokenToBackend
} from './services/notificationService';

export default function PhoneNotificationPage() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notifications, setNotifications] = useState([
    { id: '1', time: '現在', message: '您好, 歡迎使用 cherished-link', type: 'info' },
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
          type: notification.request.content.data.type,
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
          <View
            style={[
              styles.notification,
              item.type === 'alert' ? styles.alertBackground : styles.infoBackground,
            ]}
          >
            <Text>{item.time}</Text>
            <Text>{item.message}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />
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
    borderRadius: 10,
    width: '100%',
    alignSelf: 'center',
  },
  alertBackground: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)', // semi-transparent red for alert
  },
  infoBackground: {
    backgroundColor: 'rgba(0, 0, 255, 0.2)', // semi-transparent blue for info
  },
});
