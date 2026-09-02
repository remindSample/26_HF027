import { Pressable, Text, TextInput, View } from "react-native";
import type { SignupStep } from "@/types/signup";

type Props = {
  step: Extract<SignupStep, "EMAIL" | "PHONE">;
  name: string;
  onChangeName: (text: string) => void;
  inputValue: string;
  onChangeInputValue: (text: string) => void;
  onSendCode: () => void;
};

export default function ContactStep({
  step,
  name,
  onChangeName,
  inputValue,
  onChangeInputValue,
  onSendCode,
}: Props) {
  const methodTitle =
    step === "EMAIL" ? "이메일로 회원가입" : "전화번호로 회원가입";

  const inputPlaceholder = step === "EMAIL" ? "이메일 입력" : "전화번호 입력";

  return (
    <View className="flex-1 bg-white px-[30px]">
      <Text className="mt-[60px] text-center text-[30px] text-black">
        {methodTitle}
      </Text>

      <View className="mt-[80px] h-[48px] flex-row items-center rounded-[12px] border-[1px] border-[#D0D0D0] px-[20px]">
        <TextInput
          value={name}
          onChangeText={onChangeName}
          placeholder="이름"
          placeholderTextColor="#3A3A3A"
          style={{ textAlignVertical: "center", includeFontPadding: false }}
          className="h-full flex-1 py-0 text-[20px] text-black"
        />

      </View>

      <View className="mt-[24px] h-[48px] flex-row items-center rounded-[12px] border-[1px] border-[#D0D0D0] px-[20px]">
        <TextInput
          value={inputValue}
          onChangeText={onChangeInputValue}
          placeholder={inputPlaceholder}
          placeholderTextColor="#3A3A3A"
          keyboardType={step === "EMAIL" ? "email-address" : "phone-pad"}
          autoCapitalize="none"
          style={{ textAlignVertical: "center", includeFontPadding: false }}
          className="h-full flex-1 py-0 text-[20px] text-black"
        />

      </View>

      <Pressable
        onPress={onSendCode}
        className="mt-[100px] h-[60px] items-center justify-center rounded-[18px] border-[3px] border-[#777777]"
      >
        <Text className="text-[24px] font-semibold text-[#333333]">
          다음으로 넘어가기
        </Text>
      </Pressable>
    </View>
  );
}
