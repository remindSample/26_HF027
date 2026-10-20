import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SmartGloveStatusIcon from "../src/SmartGloveStatusIcon";
import VolumeSettingsButton from "../src/VolumeSettingsButton";

export default function HomeScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#55595A]">
      <ScrollView contentContainerClassName="grow bg-[#55595A]">
        <View className="flex-1 min-h-full pt-[24px] pb-[48px] bg-[#55595A]">
          <View className="px-[16px]">
            <GameHeader />
          </View>

          <View className="px-[40px]">
            <View className="mt-[60px] items-center">
              <Text className="self-start ml-[30px] text-[#D7D7D7] text-[52px] font-black tracking-[8px]">Re:Mind</Text>
              <Text className="mt-[24px] text-[#D7D7D7] text-[24px] tracking-[8px]">인지 훈련게임</Text>
            </View>

            <View className="mt-[50px] gap-[28px]">
              <Pressable
                className="h-[85px] items-center justify-center border-[6px] border-[#D7D7D7] rounded-[20px] bg-[#D7D7D7]"
                onPress={() => router.push("/connection")}
              >
                <Text className="text-[#4A4A4A] text-[34px] font-semibold tracking-[2px]">스마트 장갑 연동</Text>
              </Pressable>

              <Pressable
                className="h-[85px] items-center justify-center border-[6px] border-[#D7D7D7] rounded-[20px] bg-[#D7D7D7]"
                onPress={() => router.push("/level" as never)}
              >
                <Text className="text-[#4A4A4A] text-[34px] font-semibold tracking-[2px]">게임 시작하기</Text>
              </Pressable>
            </View>

            <View className="mt-[86px]">
              <Text className="mb-[30px] text-[#E5E5E5] text-[32px] font-black">게임 방법</Text>

              <Text className="mb-[28px] text-[#E5E5E5] text-[18px] leading-[38px] font-medium">
                장갑을 착용하고 연동을 진행해주세요!
              </Text>

              <Text className="mb-[28px] text-[#E5E5E5] text-[18px] leading-[38px] font-medium">
                주먹, 보자기, 가위가 내려오면 똑같이{"\n"}
                따라하세요!
              </Text>

              <Text className="mb-[28px] text-[#E5E5E5] text-[18px] leading-[38px] font-medium">
                판정 라인에 닿을 때 정확히 따라하세요!
              </Text>

              <Text className="mb-[28px] text-[#E5E5E5] text-[18px] leading-[38px] font-medium">
                연속 성공시 보너스 점수가 있어요
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GameHeader() {
  return (
    <View className="w-full pt-[20px] flex-row items-center justify-between">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="나가기"
        className="min-h-[48px] flex-row items-center pr-[16px]"
        onPress={() => router.back()}
      >
        <Ionicons name="exit-outline" size={34} color="#FFFFFF" />
        <Text className="ml-[12px] text-[#FFFFFF] text-[20px] font-medium">나가기</Text>
        <View className="ml-[12px]">
          <SmartGloveStatusIcon size={28} />
        </View>
      </Pressable>

      <VolumeSettingsButton />
    </View>
  );
}
