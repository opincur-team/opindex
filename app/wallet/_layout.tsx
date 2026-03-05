import { Stack } from 'expo-router';

export default function WalletLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="send" />
      <Stack.Screen name="receive" />
      <Stack.Screen name="create" />
      <Stack.Screen name="import" />
      <Stack.Screen name="manage" />
      <Stack.Screen name="backup-verify" />
      <Stack.Screen name="seed-export" />
      <Stack.Screen name="details/[id]" />
    </Stack>
  );
}
