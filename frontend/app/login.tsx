import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = () => {
    if (!id.trim()) {
      Alert.alert("알림", "아이디를 입력해주세요.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("알림", "비밀번호를 입력해주세요.");
      return;
    }

    // TODO: 백엔드 로그인 API 연결 예정
    const data = {
      access_token: "test_token",
      user: {
        id: 1,
        name: "테스트 사용자",
        role: "USER",
      },
    };

    if (data.user.role === "USER") {
      router.replace("/(tabs)");
    } else if (data.user.role === "GUARDIAN") {
      router.replace("/(guardian)");
    }
  };

  const handleKakaoLogin = () => {
    Alert.alert("알림", "카카오 로그인은 추후 연결 예정입니다.");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 px-11 pt-20">
        {/* 로고 */}
        <Text className="text-[52px] font-light tracking-[-2px] text-black">
          RE:Mind
        </Text>

        {/* 제목 */}
        <Text className="mt-32 text-center text-[30px] text-black">
          로그인 또는 회원가입
        </Text>

        {/* 아이디 입력 */}
        <TextInput
          value={id}
          onChangeText={setId}
          placeholder="아이디"
          placeholderTextColor="#111111"
          autoCapitalize="none"
          className="mt-16 h-[76px] rounded-[14px] border-2 border-black px-10 text-[30px] text-black"
        />

        {/* 비밀번호 입력 */}
        <View className="mt-9 h-[76px] flex-row items-center rounded-[14px] border-2 border-black px-10">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            placeholderTextColor="#111111"
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            className="flex-1 text-[30px] text-black"
          />

          <Pressable
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            hitSlop={10}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
              size={42}
              color="#222222"
            />
          </Pressable> 
        </View>

        {/* or */}
        <Text className="mt-16 text-center text-[30px] text-black">or</Text>

        {/* 구분선 */}
        <View className="mt-12 h-[1.5px] bg-black" />

        {/* 회원가입 버튼 */}
        <Pressable
          onPress={() => router.push("/signup")}
          className="mt-14 h-[82px] items-center justify-center rounded-[14px] border-[4px] border-[#555555] bg-black"
        >
          <Text className="text-[30px] font-semibold text-white">
            회원가입
          </Text>
        </Pressable>

        {/* 카카오 로그인 */}
        <Pressable
          onPress={handleKakaoLogin}
          className="mt-12 h-[76px] flex-row items-center justify-center rounded-[14px] border-2 border-black"
        >
          <View className="mr-5 h-10 w-10 items-center justify-center rounded-full bg-[#333333]">
            <Text className="text-[11px] font-bold text-white">TALK</Text>
          </View>

          <Text className="text-[30px] text-[#BDBDBD]">
            카카오톡으로 로그인하기
          </Text>
        </Pressable>

        {/* 구분선 */}
        <View className="mt-20 h-[1.5px] bg-black" />

        {/* 로그인 버튼 */}
        <Pressable
          onPress={handleLogin}
          className="mt-24 h-[82px] items-center justify-center rounded-[14px] bg-black"
        >
          <Text className="text-[32px] text-white">로그인</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}