import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { loginUser } from "../lib/api";
import IcChevronDown from "../assets/Icon/Ic_Chevron down.svg";

export default function LoginScreen() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (isSubmitting) {
      return;
    }

    if (!id.trim()) {
      Alert.alert("알림", "아이디를 입력해주세요.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("알림", "비밀번호를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await loginUser({ identifier: id, password });

      if (data.user.role === "USER") {
        router.replace("/(tabs)");
      } else if (data.user.role === "GUARDIAN") {
        router.replace("/(guardian)");
      }
    } catch (error) {
      Alert.alert(
        "알림",
        error instanceof Error ? error.message : "로그인에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKakaoLogin = () => {
    Alert.alert("알림", "카카오 로그인은 추후 연결 예정입니다.");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View className="flex-1 px-9 pt-20">
        <View className="flex-row items-center justify-between">
          {/* 로고 */}
          <Text className="text-[36px] font-bold tracking-[-2px] text-black">
            RE:Mind
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="키보드 닫기"
            hitSlop={10}
            onPress={Keyboard.dismiss}
            className="h-[36px] w-[36px] items-center justify-center"
          >
            <Image
              source={IcChevronDown}
              contentFit="contain"
              style={{ width: 36, height: 36 }}
            />
          </Pressable>
        </View>

        {/* 제목 */}
        <Text className="mt-[60px] text-center text-[30px] text-black">
          로그인 또는 회원가입
        </Text>

        {/* 아이디 입력 */}
        <TextInput
          value={id}
          onChangeText={setId}
          placeholder="아이디"
          placeholderTextColor="#111111"
          autoCapitalize="none"
          returnKeyType="next"
          editable={!isSubmitting}
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          className="mt-16 h-[64px] rounded-[14px] border-2 border-black px-5 text-[20px] text-black"
        />

        {/* 비밀번호 입력 */}
        <View className="mt-9 h-[64px] flex-row items-center overflow-hidden rounded-[14px] border-2 border-black bg-white px-5">
          <TextInput
            ref={passwordInputRef}
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            placeholderTextColor="#111111"
            secureTextEntry={!isPasswordVisible}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
            returnKeyType="done"
            editable={!isSubmitting}
            onSubmitEditing={handleLogin}
            className="h-full flex-1 text-[20px] text-black"
          />

          <Pressable
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            hitSlop={10}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
              size={30}
              color="#222222"
            />
          </Pressable>
        </View>

        {/* or */}
        <Text className="mt-10 text-center text-[20px] text-black">or</Text>

        {/* 구분선 */}
        <View className="mt-10 h-[1.5px] bg-black" />

        {/* 회원가입 버튼 */}
        <Pressable
          onPress={() => router.push("/signup")}
          className="mt-14 h-[64px] items-center justify-center rounded-[14px] border-[2px] border-[#555555] bg-black"
        >
          <Text className="text-[20px] font-semibold text-white">
            회원가입
          </Text>
        </Pressable>

        {/* 카카오 로그인 */}
        <Pressable
          onPress={handleKakaoLogin}
          className="mt-[26px] h-[64px] flex-row items-center justify-center rounded-[14px] border-2 border-black"
        >
          <View className="mr-5 h-10 w-10 items-center justify-center rounded-full bg-[#333333]">
            <Text className="text-[11px] font-bold text-white">TALK</Text>
          </View>

          <Text className="text-[20px] text-[#BDBDBD]">
            카카오톡으로 로그인하기
          </Text>
        </Pressable>

        {/* 구분선 */}
        <View className="mt-20 h-[1.5px] bg-black" />
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
