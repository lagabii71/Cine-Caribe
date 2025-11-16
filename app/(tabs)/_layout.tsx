import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Tabs } from 'expo-router';
import * as React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const MyTabs = createMaterialTopTabNavigator();
    
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
      }}>

        <Tabs.Screen
        name="notifications"
        
        options={{
          title: 'Notifications',
          tabBarPosition: ('top'),
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="email" color={color} />,
        }}
        />

       <Tabs.Screen
        name="movies"
        
        options={{
          title: 'Movies',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="theaters" color={color} />,
        }}
      />
      <Tabs.Screen
        name="concession"
        options={{
          title: 'Consession',
          tabBarIcon: ({ color }) => <Ionicons name="fast-food-outline" size={28} color={color} />,
        }}
       
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Caribbean Rewards',
          tabBarIcon: ({ color }) => <Ionicons name="star-outline" size={32} color={color}  />,
        }}
      />
      <Tabs.Screen
        name="theaters"
        options={{
          title: 'Theaters',
          tabBarIcon: ({ color }) => <Ionicons name="location-outline" size={28} color={color} />,
        }}
       
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={28} color={color} />,
        }}
       
      />
    </Tabs>
  );
}