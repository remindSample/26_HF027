import { router } from "expo-router";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GameHeader from "./components/GameHeader";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const buttonTextStyle = { fontSize: width < 360 ? 28 : 34, letterSpacing: width < 360 ? 0 : 2 };
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#55595A]">
      <ScrollView contentContainerClassName="grow bg-[#55595A]">
        <View className="flex-1 min-h-full pt-[24px] pb-[48px] bg-[#55595A]">
          <View className="px-[16px]">
            <GameHeader onBackPress={() => router.replace("/(user)")} />
          </View>

          <View className="px-[40px]">
            <View className="mt-[60px] items-center">
              <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: Math.min(52, (width - 80) / 6) }} className="self-stretch text-center text-[#D7D7D7] font-black tracking-[8px]">Re:Mind</Text>
              <Text className="mt-[24px] text-[#D7D7D7] text-[24px] tracking-[8px]">인지 훈련게임</Text>
            </View>

            <View className="mt-[50px] gap-[28px]">
              <Pressable
                className="min-h-[85px] px-2 py-3 items-center justify-center border-[6px] border-[#D7D7D7] rounded-[20px] bg-[#D7D7D7]"
                onPress={() => router.push("/game/connect")}
              >
                <Text style={buttonTextStyle} className="text-center text-[#4A4A4A] font-semibold">스마트 장갑 연동</Text>
              </Pressable>

              <Pressable
                className="min-h-[85px] px-2 py-3 items-center justify-center border-[6px] border-[#D7D7D7] rounded-[20px] bg-[#D7D7D7]"
                onPress={() => router.push("/game/level")}
              >
                <Text style={buttonTextStyle} className="text-center text-[#4A4A4A] font-semibold">게임 시작하기</Text>
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
