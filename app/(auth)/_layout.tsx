import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          headerShown: false,
          title: 'Welcome'
        }} 
      />
      <Stack.Screen 
        name="wallet-setup" 
        options={{ 
          headerShown: false,
          title: 'Setup Wallet'
        }} 
      />
      <Stack.Screen 
        name="biometric-setup" 
        options={{ 
          headerShown: false,
          title: 'Setup Security'
        }} 
      />
    </Stack>
  );
}