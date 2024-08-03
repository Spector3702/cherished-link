// notifications.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    { id: '1', time: '07/10 09:00', message: 'Notification message example 1' },
    { id: '2', time: '07/10 10:30', message: 'Notification message example 2' },
  ]);

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
