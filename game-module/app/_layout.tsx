import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="connection" />
        <Stack.Screen name="play" />
        <Stack.Screen name="result" />
      </Stack>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
