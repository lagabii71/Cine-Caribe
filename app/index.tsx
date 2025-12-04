// app/index.tsx
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  useEffect(() => {
    // Optional: Add a small delay for better UX
    const timer = setTimeout(() => {
      router.replace('/(tabs)/movies');
    }, 500); // 0.5 second delay
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0c1e33' }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}