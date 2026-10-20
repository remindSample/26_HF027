import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AudioSettingsProvider } from "../src/audioSettings";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AudioSettingsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="connection" />
          <Stack.Screen name="level" />
          <Stack.Screen name="play" />
          <Stack.Screen name="result" />
        </Stack>
        <StatusBar style="light" />
      </AudioSettingsProvider>
    </SafeAreaProvider>
  );
}
