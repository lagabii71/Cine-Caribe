import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import * as React from 'react';
import { Image } from 'react-native';
import { AppStateProvider } from './AppStateContext';
// image assets loaded with require at usage site to avoid missing module/type errors
export default function TabLayout() {
  const colorScheme = useColorScheme();
    
  return (
    <AppStateProvider>
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
            tabBarIcon: ({ color }) => <MaterialIcons size={28} name="email" color={color} />,
          }}
        />

        <Tabs.Screen
          name="movies"
          options={{
            title: 'Movies',
            tabBarIcon: ({ color }) => (
              <Image
                source={require('../../assets/images/movies.png')}
                style={{ width: 25, height: 25, tintColor: color }}
                resizeMode="contain"
              />  )  }}
        />
        <Tabs.Screen
          name="concession"
          options={{
            title: 'Concession',
           tabBarIcon: ({ color }) => (
              <Image
                source={require('../../assets/images/drinks.png')}
                style={{ width: 30, height: 30, tintColor: color }}
                resizeMode="contain"
              />  ) }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: '',
            tabBarIcon: ({ color }) => (
              <Image
                source={require('../../assets/images/rewards.png')}
                style={{ width: 70, height: 70, tintColor: color }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="theaters"
          options={{
            title: 'Theaters',
            tabBarIcon: ({ color }) => (
              <Image
                source={require('../../assets/images/location.png')}
                style={{ width: 30, height: 30, tintColor: color }}
                resizeMode="contain"
              />  )
            }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <Image
                source={require('../../assets/images/user.png')}
                style={{ width: 30, height: 30, tintColor: color }}
                resizeMode="contain"
              />  ) }}
        />
      </Tabs>
    </AppStateProvider>
  );
}