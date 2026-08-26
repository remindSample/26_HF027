import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  password: string;
  onChangePassword: (text: string) => void;
  passwordConfirm: string;
  onChangePasswordConfirm: (text: string) => void;
  isPasswordVisible: boolean;
  onToggleIsPasswordVisible: () => void;
  isPasswordConfirmVisible: boolean;
  onToggleIsPasswordConfirmVisible: () => void;
  onCompleteSignup: () => void;
  isSubmitting?: boolean;
};

export default function PasswordStep({
  password,
  onChangePassword,
  passwordConfirm,
  onChangePasswordConfirm,
  isPasswordVisible,
  onToggleIsPasswordVisible,
  isPasswordConfirmVisible,
  onToggleIsPasswordConfirmVisible,
  onCompleteSignup,
  isSubmitting,
}: Props) {
  return (
    <View className="flex-1 bg-white px-[30px]">
      <Text className="mt-[60px] text-center text-[30px] text-black">
        사용할 비밀번호 입력
      </Text>

      <View className="mt-[80px] h-[48px] flex-row items-center rounded-[12px] border-[1px] border-[#D0D0D0] px-[20px]">
        <TextInput
          value={password}
          onChangeText={onChangePassword}
          placeholder="비밀번호"
          placeholderTextColor="#3A3A3A"
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
          className="flex-1 text-[20px] text-black"
        />

        <Pressable onPress={onToggleIsPasswordVisible} hitSlop={10}>
          <Ionicons
            name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
            size={25}
            color="#222222"
          />
        </Pressable>
      </View>


      <View className="mt-[30px] h-[48px] flex-row items-center rounded-[12px] border-[1px] border-[#D0D0D0] px-[20px]">
        <TextInput
          value={passwordConfirm}
          onChangeText={onChangePasswordConfirm}
          placeholder="비밀번호 확인"
          placeholderTextColor="#3A3A3A"
          secureTextEntry={!isPasswordConfirmVisible}
          autoCapitalize="none"
          className="flex-1 text-[20px] text-black"
        />

        <Pressable onPress={onToggleIsPasswordConfirmVisible} hitSlop={10}>
          <Ionicons
            name={isPasswordConfirmVisible ? "eye-outline" : "eye-off-outline"}
            size={25}
            color="#222222"
          />
        </Pressable>
      </View>

      <Pressable
        onPress={onCompleteSignup}
        disabled={isSubmitting}
        className="mt-[132px] h-[60px] items-center justify-center rounded-[18px] border-[3px] border-[#777777] disabled:opacity-50"
      >
        <Text className="text-[24px] font-semibold text-[#333333]">
          {isSubmitting ? "처리 중..." : "회원가입 완료"}
        </Text>
      </Pressable>
    </View>
  );
}
