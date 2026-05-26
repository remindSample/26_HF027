import { Stack } from "expo-router"; // Stack 네비게이션(화면이 쌓이는 구조)
import { StatusBar } from "expo-status-bar"; // 휴대폰 상단 상태바 제어
import "react-native-reanimated"; // 애니메이션 라이브러리 초기화용
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        {/* 하단 바가 들어가는 화면 묶음 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 게임 내부에서 헤더를 관리하므로 숨김 */}
        <Stack.Screen name="game" options={{ headerShown: false }} />

        <Stack.Screen name="answer" options={{ headerShown: false }} />

        <Stack.Screen name="question" options={{ headerShown: false }} />

        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />

        <Stack.Screen name="test" options={{ title: "테스트" }} />
      </Stack>

      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
