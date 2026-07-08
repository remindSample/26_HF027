import { Pressable, Text, View } from "react-native";

type Props = {
  onSelectEmail: () => void;
  onSelectPhone: () => void;
  onKakaoSignup: () => void;
};

export default function SelectMethodStep({
  onSelectEmail,
  onSelectPhone,
  onKakaoSignup,
}: Props) {
  return (
    <View className="flex-1 bg-white px-[30px] pt-[80px]">
      <Text className="text-[28px] font-normal text-black">
        RE:Mind에 어서오세요!
      </Text>

      <View className="mt-[21px] h-[1px] bg-[#8A8A8A]" />

      <Text className="mt-[28px] text-[24px] leading-[29px] text-black">
        당신의 일상을 기록하고,{"\n"}가족과 공유하세요.
      </Text>

      <View className="mt-[60px]">
        <Pressable
          onPress={onSelectEmail}
          className="h-[60px] items-center justify-center rounded-[18px] border-[3px] border-[#777777]"
        >
          <Text className="text-[24px] font-semibold text-[#333333]">
            이메일로 가입하기
          </Text>
        </Pressable>

        <Pressable
          onPress={onSelectPhone}
          className="mt-[28px] h-[60px] items-center justify-center rounded-[18px] border-[3px] border-[#777777]"
        >
          <Text className="text-[24px] font-semibold text-[#333333]">
            전화번호로 가입하기
          </Text>
        </Pressable>

        <View className="mt-[60px] h-[1px] bg-[#A0A0A0]" />

        <Pressable
          onPress={onKakaoSignup}
          className="mt-[60px] h-[60px] items-center justify-center rounded-[18px] bg-[#D9D9D9]"
        >
          <Text className="text-[24px] font-semibold text-[#333333]">
            카카오톡으로 가입하기
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
