import { Stack } from "expo-router"; // Stack 네비게이션(화면이 위로 쌓이는 구조)
import { StatusBar } from "expo-status-bar"; // 휴대폰 상단 상태바 제어
import "react-native-reanimated"; // 애니메이션 라이브러리 초기화용
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Text, TextInput } from "react-native";
import pretendardSemiBold from "../assets/fonts/Pretendard-SemiBold.woff";
import "../global.css";

const DEFAULT_FONT_FAMILY = "Pretendard-SemiBold";
const DEFAULT_BACKGROUND_COLOR = "#FDF2EC";

(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = [
  { fontFamily: DEFAULT_FONT_FAMILY },
  (Text as any).defaultProps.style,
];

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.style = [
  { fontFamily: DEFAULT_FONT_FAMILY },
  (TextInput as any).defaultProps.style,
];

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [DEFAULT_FONT_FAMILY]: pretendardSemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: DEFAULT_BACKGROUND_COLOR }}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />

        <Stack.Screen name="signup" options={{ headerShown: false }} />

        {/* 보호자 - 하단 바가 들어가는 화면 묶음 */}
        <Stack.Screen name="(guardian)" options={{ headerShown: false }} />

        {/* 사용자 - 하단 바가 들어가는 화면 묶음 */}
        <Stack.Screen name="(user)" options={{ headerShown: false }} />
      </Stack>

      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
