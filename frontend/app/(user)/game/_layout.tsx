import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AudioSettingsProvider } from "@/features/game/audioSettings";

export default function GameLayout() {
  return (
    <AudioSettingsProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#535353" } }}>
        <Stack.Screen name="index" />

        <Stack.Screen name="connect" />

        <Stack.Screen name="level" />

        <Stack.Screen name="play" />

        <Stack.Screen name="result" />
      </Stack>
      <StatusBar style="light" />
    </AudioSettingsProvider>
  );
}
