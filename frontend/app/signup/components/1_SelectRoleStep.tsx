import { Pressable, Text, View } from "react-native";
import type { Role } from "../types";

type Props = {
  onSelectRole: (role: Role) => void;
};

export default function SelectRoleStep({ onSelectRole }: Props) {
  return (
    <View className="flex-1 bg-white px-[30px] pt-[80px]">
      <Text className="text-[28px] font-normal text-black">
        RE:Mind에 어서오세요!
      </Text>

      <View className="mt-[21px] h-[1px] bg-[#8A8A8A]" />

      <Text className="mt-[28px] text-[24px] leading-[29px] text-black">
        당신의 일상을 기록하고,{"\n"}가족과 공유하세요.
      </Text>

      <View className="mt-[60px] gap-[40px]">
        <Pressable
          onPress={() => onSelectRole("USER")}
          className="h-[120px] items-center justify-center rounded-[32px] bg-[#D9D9D9]"
        >
          <Text className="text-[32px] font-semibold text-[#333333]">
            사용자로 가입하기
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onSelectRole("GUARDIAN")}
          className="h-[120px] items-center justify-center rounded-[32px] bg-[#D9D9D9]"
        >
          <Text className="text-[32px] font-semibold text-[#333333]">
            보호자로 가입하기
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
