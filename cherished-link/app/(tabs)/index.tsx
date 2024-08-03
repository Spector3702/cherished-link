import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Function to send the token to the backend
async function sendTokenToBackend(token: string) {
  try {
    const response = await fetch('http://192.168.4.103:5000/expo-token', {
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
