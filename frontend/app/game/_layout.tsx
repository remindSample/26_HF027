import { Stack } from "expo-router";

export default function GameLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Screen name="connect" />

      <Stack.Screen name="level" />

      <Stack.Screen name="play" />

      <Stack.Screen name="result" />
    </Stack>
  );
}
