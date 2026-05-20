import { Stack } from "expo-router"; // Stack 네비게이션(화면이 쌓이는 구조)
import { StatusBar } from "expo-status-bar"; // 휴대폰 상단 상태바 제어
import "react-native-reanimated"; // 애니메이션 라이브러리 초기화용
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: "홈" }} />

        {/* 게임 내부에서 헤더를 관리하므로 숨김 */}
        <Stack.Screen name="game" options={{ headerShown: false }} />

        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>

      <StatusBar style="auto" />
    </>
  );
}
