import { useRef, useState } from "react";
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

type SignupStep =
  | "SELECT_ROLE"
  | "SELECT_METHOD"
  | "EMAIL"
  | "PHONE"
  | "VERIFY"
  | "PASSWORD"
  | "COMPLETE";

type Role = "USER" | "GUARDIAN";

type SignupMethod = "EMAIL" | "PHONE" | "KAKAO" | null;

export default function SignupScreen() {
  const [step, setStep] = useState<SignupStep>("SELECT_ROLE");

  const [role, setRole] = useState<Role | null>(null);
  const [method, setMethod] = useState<SignupMethod>(null);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [code, setCode] = useState(["", "", "", "", ""]);
  const codeRefs = useRef<Array<TextInput | null>>([]);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false);

  const handleSelectRole = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep("SELECT_METHOD");
  };

  const handleSelectEmail = () => {
    setMethod("EMAIL");
    setStep("EMAIL");
  };

  const handleSelectPhone = () => {
    setMethod("PHONE");
    setStep("PHONE");
  };

  const handleKakaoSignup = () => {
    setMethod("KAKAO");

    Alert.alert("알림", "카카오 회원가입은 추후 연결 예정입니다.");
  };

  const handleSendCode = () => {
    if (step === "EMAIL") {
      if (!email.trim()) {
        Alert.alert("알림", "이메일을 입력해주세요.");
        return;
      }

      // TODO: 이메일 형식 검증 / 인증번호 발송 API 연결
      console.log("이메일 인증번호 발송:", email);
    }

    if (step === "PHONE") {
      if (!phone.trim()) {
        Alert.alert("알림", "전화번호를 입력해주세요.");
        return;
      }

      // TODO: 전화번호 형식 검증 / 인증번호 발송 API 연결
      console.log("전화번호 인증번호 발송:", phone);
    }

    setStep("VERIFY");
  };

  const handleChangeCode = (text: string, index: number) => {
    const onlyNumber = text.replace(/[^0-9]/g, "");

    const nextCode = [...code];
    nextCode[index] = onlyNumber.slice(-1);
    setCode(nextCode);

    if (onlyNumber && index < 4) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = () => {
    const verificationCode = code.join("");

    if (verificationCode.length !== 5) {
      Alert.alert("알림", "인증번호를 모두 입력해주세요.");
      return;
    }

    // TODO: 인증번호 검증 API 연결
    console.log("인증번호 확인:", {
      role,
      method,
      email,
      phone,
      verificationCode,
    });

    setStep("PASSWORD");
  };

  const handleCompleteSignup = () => {
    if (password.length < 8) {
      Alert.alert("알림", "비밀번호는 최소 8자리 이상 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
      return;
    }

    // TODO: 백엔드 회원가입 API 연결
    console.log("회원가입 완료:", {
      role,
      method,
      email,
      phone,
      password,
    });

    setStep("COMPLETE");
  };

  const handleGoLogin = () => {
    router.replace("/login");
  };

  const methodTitle =
    step === "EMAIL" ? "이메일로 회원가입" : "전화번호로 회원가입";

  const inputPlaceholder = step === "EMAIL" ? "이메일 입력" : "전화번호 입력";

  const inputValue = step === "EMAIL" ? email : phone;

  const setInputValue = step === "EMAIL" ? setEmail : setPhone;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {step === "SELECT_ROLE" ? (
        <View className="flex-1 bg-white px-[30px] pt-[220px]">
          <Text className="text-[48px] font-normal text-black">
            RE:Mind에 어서오세요!
          </Text>

          <View className="mt-[42px] h-[4px] bg-[#8A8A8A]" />

          <Text className="mt-[58px] text-[40px] leading-[58px] text-black">
            당신의 일상을 기록하고,{"\n"}가족과 공유하세요.
          </Text>

          <View className="mt-[240px] gap-[100px]">
            <Pressable
              onPress={() => handleSelectRole("USER")}
              className="h-[240px] items-center justify-center rounded-[32px] bg-[#D9D9D9]"
            >
              <Text className="text-[48px] font-semibold text-[#333333]">
                사용자로 가입하기
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleSelectRole("GUARDIAN")}
              className="h-[240px] items-center justify-center rounded-[32px] bg-[#D9D9D9]"
            >
              <Text className="text-[48px] font-semibold text-[#333333]">
                보호자로 가입하기
              </Text>
            </Pressable>
          </View>
        </View>
      ) : step === "SELECT_METHOD" ? (
        <View className="flex-1 bg-white px-[30px] pt-[220px]">
          <Text className="text-[48px] font-normal text-black">
            RE:Mind에 어서오세요!
          </Text>

          <View className="mt-[42px] h-[4px] bg-[#8A8A8A]" />

          <Text className="mt-[58px] text-[40px] leading-[58px] text-black">
            당신의 일상을 기록하고,{"\n"}가족과 공유하세요.
          </Text>

          <View className="mt-[300px]">
            <Pressable
              onPress={handleSelectEmail}
              className="h-[120px] items-center justify-center rounded-[18px] border-[3px] border-[#777777]"
            >
              <Text className="text-[40px] font-semibold text-[#333333]">
                이메일로 가입하기
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSelectPhone}
              className="mt-[52px] h-[120px] items-center justify-center rounded-[18px] border-[3px] border-[#777777]"
            >
              <Text className="text-[40px] font-semibold text-[#333333]">
                전화번호로 가입하기
              </Text>
            </Pressable>

            <View className="mt-[100px] h-[4px] bg-[#A0A0A0]" />

            <Pressable
              onPress={handleKakaoSignup}
              className="mt-[100px] h-[120px] items-center justify-center rounded-[18px] bg-[#D9D9D9]"
            >
              <Text className="text-[40px] font-semibold text-[#333333]">
                카카오톡으로 가입하기
              </Text>
            </Pressable>
          </View>
        </View>
      ) : step === "EMAIL" || step === "PHONE" ? (
        <View className="flex-1 bg-white px-[30px] pt-[80px]">
          <Text className="text-[52px] font-light tracking-[-2px] text-black">
            RE:Mind
          </Text>

          <View className="mt-[90px] ml-[60px] h-[250px] w-[250px] border-[3px] border-[#999999]">
            <View className="absolute left-0 top-0 h-[3px] w-[350px] origin-left rotate-45 bg-[#999999]" />
            <View className="absolute bottom-0 left-0 h-[3px] w-[350px] origin-left -rotate-45 bg-[#999999]" />
          </View>

          <Text className="mt-[80px] text-[52px] font-normal text-black">
            {methodTitle}
          </Text>

          <View className="mt-[130px] h-[98px] flex-row items-center rounded-[12px] border-[3px] border-[#D0D0D0] px-[38px]">
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={inputPlaceholder}
              placeholderTextColor="#3A3A3A"
              keyboardType={step === "EMAIL" ? "email-address" : "phone-pad"}
              autoCapitalize="none"
              className="flex-1 text-[34px] text-black"
            />

            <Ionicons name="checkmark" size={48} color="#222222" />
          </View>

          <Text className="mt-[26px] ml-[40px] text-[34px] text-[#333333]">
            올바른 형식입니다.
          </Text>

          <Pressable
            onPress={handleSendCode}
            className="mt-[360px] h-[120px] items-center justify-center rounded-[18px] border-[3px] border-[#777777]"
          >
            <Text className="text-[40px] font-semibold text-[#333333]">
              다음으로 넘어가기
            </Text>
          </Pressable>
        </View>
      ) : step === "VERIFY" ? (
        <View className="flex-1 bg-white px-[30px] pt-[80px]">
          <Text className="text-[52px] font-light tracking-[-2px] text-black">
            RE:Mind
          </Text>

          <View className="mt-[90px] ml-[85px] h-[250px] w-[250px] border-[3px] border-[#999999]">
            <View className="absolute left-0 top-0 h-[3px] w-[350px] origin-left rotate-45 bg-[#999999]" />
            <View className="absolute bottom-0 left-0 h-[3px] w-[350px] origin-left -rotate-45 bg-[#999999]" />
          </View>

          <Text className="mt-[80px] ml-[30px] text-[52px] font-normal text-black">
            인증번호 입력
          </Text>

          <View className="mt-[170px] flex-row justify-between">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  codeRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(text) => handleChangeCode(text, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                className="h-[120px] w-[104px] rounded-[18px] border-[3px] border-[#777777] text-[48px] text-black"
              />
            ))}
          </View>

          <Pressable
            onPress={handleVerify}
            className="mt-[360px] h-[120px] items-center justify-center rounded-[18px] border-[3px] border-[#777777]"
          >
            <Text className="text-[40px] font-semibold text-[#333333]">
              인증 완료
            </Text>
          </Pressable>
        </View>
      ) : step === "PASSWORD" ? (
        <View className="flex-1 bg-white px-[30px] pt-[80px]">
          <Text className="text-[52px] font-light tracking-[-2px] text-black">
            RE:Mind
          </Text>

          <View className="mt-[90px] ml-[85px] h-[250px] w-[250px] border-[3px] border-[#999999]">
            <View className="absolute left-0 top-0 h-[3px] w-[350px] origin-left rotate-45 bg-[#999999]" />
            <View className="absolute bottom-0 left-0 h-[3px] w-[350px] origin-left -rotate-45 bg-[#999999]" />
          </View>

          <Text className="mt-[80px] text-[52px] font-normal text-black">
            사용할 비밀번호 입력
          </Text>

          <View className="mt-[70px] h-[98px] flex-row items-center rounded-[12px] border-[3px] border-[#C23A45] px-[30px]">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              placeholderTextColor="#3A3A3A"
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              className="flex-1 text-[34px] text-black"
            />

            <Pressable
              onPress={() => setIsPasswordVisible((prev) => !prev)}
              hitSlop={10}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                size={46}
                color="#222222"
              />
            </Pressable>
          </View>

          <Text className="mt-[18px] text-[30px] text-[#C9252D]">
            최소 8자리 이상 입력해주세요.
          </Text>

          <View className="mt-[60px] h-[98px] flex-row items-center rounded-[12px] border-[3px] border-[#D0D0D0] px-[30px]">
            <TextInput
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              placeholder="비밀번호 확인"
              placeholderTextColor="#3A3A3A"
              secureTextEntry={!isPasswordConfirmVisible}
              autoCapitalize="none"
              className="flex-1 text-[34px] text-black"
            />

            <Pressable
              onPress={() => setIsPasswordConfirmVisible((prev) => !prev)}
              hitSlop={10}
            >
              <Ionicons
                name={
                  isPasswordConfirmVisible ? "eye-outline" : "eye-off-outline"
                }
                size={46}
                color="#222222"
              />
            </Pressable>
          </View>

          <Pressable
            onPress={handleCompleteSignup}
            className="mt-[300px] h-[120px] items-center justify-center rounded-[18px] border-[3px] border-[#777777]"
          >
            <Text className="text-[40px] font-semibold text-[#333333]">
              회원가입 완료
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-1 bg-white px-[30px] pt-[80px]">
          <Text className="text-[52px] font-light tracking-[-2px] text-black">
            RE:Mind
          </Text>

          <Text className="mt-[100px] text-[46px] font-normal text-black">
            환영합니다!
          </Text>

          <View className="mt-[48px] h-[4px] bg-[#999999]" />

          <Text className="mt-[70px] text-[46px] leading-[64px] text-black">
            회원가입이 완료 되었습니다.
          </Text>

          <Pressable
            onPress={handleGoLogin}
            className="mt-[480px] h-[210px] items-center justify-center rounded-[18px] border-[3px] border-[#777777]"
          >
            <Text className="text-[38px] font-semibold text-[#333333]">
              회원가입 완료하기
            </Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}