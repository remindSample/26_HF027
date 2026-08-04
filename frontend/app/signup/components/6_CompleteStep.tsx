import { Pressable, Text, View } from "react-native";

type Props = {
  onGoHome: () => void;
};

export default function CompleteStep({ onGoHome }: Props) {
  return (
    <View className="flex-1 bg-white px-[30px]">
      <Text className="mt-[28px] text-[28px] font-normal text-black">
        환영합니다!
      </Text>

      <View className="mt-[21px] h-[1px] bg-[#8A8A8A]" />

      <Text className="mt-[30px] text-[28px] leading-[64px] text-black">
        회원가입이 완료 되었습니다.
      </Text>

      <Pressable
        onPress={onGoHome}
        className="mt-[100px] h-[100px] items-center justify-center rounded-[18px] border-[3px] border-[#777777]"
      >
        <Text className="text-[28px] font-semibold text-[#333333]">
          회원가입 완료하기
        </Text>
      </Pressable>
    </View>
  );
}
