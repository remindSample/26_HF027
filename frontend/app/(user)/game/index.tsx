import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GameHeader from "./components/GameHeader";

export default function GameHomeScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#55595A]">
    <ScrollView contentContainerClassName="grow bg-[#55595A]">
      <View className="flex-1 min-h-full bg-[#55595A] pt-6 pb-12">
        <View className="px-4">
          <GameHeader />
        </View>

        <View className="px-10">
          {/* 로고 영역 */}
          <View className="mt-[60px] items-center">
            <Text className="self-start ml-[30px] text-[52px] font-extrabold tracking-[8px] text-[#D7D7D7]">
              Re:Mind
            </Text>
            <Text className="mt-[24px] text-[24px] tracking-[8px] text-[#D7D7D7]">
              인지 훈련게임
            </Text>
          </View>

          {/* 버튼 영역 */}
          <View className="mt-[50px] gap-7">
            <Pressable
              className="h-[85px] justify-center items-center border-[6px] border-[#D7D7D7] rounded-[20px] bg-[#D7D7D7]"
              onPress={() => router.push("/none")}
            >
              <Text className="text-[34px] font-semibold tracking-[2px] text-[#4A4A4A]">
                스마트 장갑 연동
              </Text>
            </Pressable>

            <Pressable
              className="h-[85px] justify-center items-center border-[6px] border-[#D7D7D7] rounded-[20px] bg-[#D7D7D7]"
              onPress={() => router.push("/game/level")}
            >
              <Text className="text-[34px] font-semibold tracking-[2px] text-[#4A4A4A]">
                게임 시작하기
              </Text>
            </Pressable>
          </View>

          {/* 게임 방법 */}
          <View className="mt-[86px]">
            <Text className="mb-[30px] text-[32px] font-extrabold text-[#E5E5E5]">
              게임 방법
            </Text>

            <Text className="mb-7 text-[18px] leading-[38px] font-medium text-[#E5E5E5]">
              장갑을 착용하고 연동을 진행해주세요!
            </Text>

            <Text className="mb-7 text-[18px] leading-[38px] font-medium text-[#E5E5E5]">
              주먹과 보자기가 내려오면 똑같이{"\n"}
              따라하세요!
            </Text>

            <Text className="mb-7 text-[18px] leading-[38px] font-medium text-[#E5E5E5]">
              판정 라인에 닿을 때 정확히 따라하세요!
            </Text>

            <Text className="mb-7 text-[18px] leading-[38px] font-medium text-[#E5E5E5]">
              연속 성공시 보너스 점수가 있어요
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
