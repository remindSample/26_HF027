import { Pressable, Text, View } from "react-native";

type Props = {
  onGoLogin: () => void;
};

export default function CompleteStep({ onGoLogin }: Props) {
  return (
    <View className="flex-1 bg-white px-[30px]">
      <Text className="mt-[100px] text-[46px] font-normal text-black">
        환영합니다!
      </Text>

      <View className="mt-[48px] h-[4px] bg-[#999999]" />

      <Text className="mt-[70px] text-[46px] leading-[64px] text-black">
        회원가입이 완료 되었습니다.
      </Text>

      <Pressable
        onPress={onGoLogin}
        className="mt-[480px] h-[210px] items-center justify-center rounded-[18px] border-[3px] border-[#777777]"
      >
        <Text className="text-[38px] font-semibold text-[#333333]">
          회원가입 완료하기
        </Text>
      </Pressable>
    </View>
  );
}
