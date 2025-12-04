// app/_layout.tsx
import { Stack } from 'expo-router';
import { AppStateProvider } from './(tabs)/AppStateContext';
import { RewardsProvider } from './RewardsContext';
import { ShoppingCartProvider } from './ShoppingCartContext';

export default function RootLayout() {
  return (
     <RewardsProvider>
    <AppStateProvider>
      <ShoppingCartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="cart" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              title: 'Shopping Cart',
              headerStyle: { backgroundColor: '#0c1e33' },
              headerTintColor: '#ffffff',
              headerTitleStyle: { fontWeight: 'bold' }
            }} 
          />
          <Stack.Screen 
            name="notifications" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              title: 'Notifications',
              headerStyle: { backgroundColor: '#0c1e33' },
              headerTintColor: '#ffffff',
              headerTitleStyle: { fontWeight: 'bold' }
            }} 
          />
        </Stack>
      </ShoppingCartProvider>
    </AppStateProvider>
     </RewardsProvider>
  );
}