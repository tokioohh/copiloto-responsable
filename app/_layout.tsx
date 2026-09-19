import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useAuthStore } from '../src/stores/authStore';

// Ignore benign Metro CLI socket reconnection warnings on mobile
LogBox.ignoreLogs([
  'Could not connect to the development server',
  'Cannot connect to Expo CLI',
]);

export default function RootLayout() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="trip/[id]" />
      </Stack>
    </PaperProvider>
  );
}
