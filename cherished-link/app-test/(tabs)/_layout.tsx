import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// icon: https://icons.expo.fyi/Index, filter: Ionicons

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="match_device"
        options={{
          title: 'Devices',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'watch' : 'watch-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="match_status"
        options={{
          title: 'Connection',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'bluetooth' : 'bluetooth-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'notifications' : 'notifications-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
