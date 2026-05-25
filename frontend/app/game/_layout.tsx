import { Stack } from "expo-router";

export default function GameLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "손동작 게임" }} />

      <Stack.Screen name="connect" options={{ title: "장갑 연결" }} />

      <Stack.Screen name="level" options={{ title: "레벨 선택" }} />

      <Stack.Screen name="play" options={{ title: "게임 플레이" }} />

      <Stack.Screen name="result" options={{ title: "게임 결과" }} />
    </Stack>
  );
}
