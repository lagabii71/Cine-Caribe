import { Stack } from 'expo-router';
import { AppStateProvider } from './(tabs)/AppStateContext';
import { ShoppingCartProvider } from './ShoppingCartContext';

export default function RootLayout() {
  return (
    <AppStateProvider>
      <ShoppingCartProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ presentation: 'modal', title: 'Shopping Cart' }} />
          <Stack.Screen name="notifications" options={{ presentation: 'modal', title: 'Notifications' }} />
        </Stack>
      </ShoppingCartProvider>
    </AppStateProvider>
  );
}