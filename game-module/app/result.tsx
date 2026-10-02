import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LEVEL_LABELS: Record<string, string> = {
  "1": "매우 쉬움",
  "2": "쉬움",
  "3": "보통",
  "4": "어려움",
  "5": "매우 어려움",
  normal: "매우 쉬움"
};

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    level?: string;
    score?: string;
    hits?: string;
    misses?: string;
    accuracy?: string;
    maxCombo?: string;
    exerciseCount?: string;
  }>();
  const score = Number(params.score ?? "0");
  const accuracy = Number(params.accuracy ?? "0");
  const filledStars = Math.max(0, Math.min(5, Math.floor(accuracy / 20)));
  const difficulty = LEVEL_LABELS[params.level ?? "normal"] ?? "매우 쉬움";

  return (
    <SafeAreaView className="flex-1 bg-[#535353]">
      <View className="bg-[#535353] px-4">
        <GameHeader />
      </View>

      <ScrollView
        className="flex-1 bg-[#535353]"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-[30px] pb-10 pt-11">
          <View className="items-center pb-9">
            <Text className="text-2xl font-extrabold text-white">게임 완료</Text>
            <View className="mt-[18px] flex-row items-center gap-[3px]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Ionicons
                  key={index}
                  name={index < filledStars ? "star" : "star-outline"}
                  size={43}
                  color="#F4F4F4"
                />
              ))}
            </View>
            <Text className="mt-[11px] text-[30px] font-black leading-[46px] text-white">
              훌륭해요!
            </Text>
            <Text className="mt-2 text-[15px] font-medium text-white">수고하셨습니다</Text>
          </View>

          <View className="min-h-[174px] items-center justify-center rounded-[18px] bg-[#D9D9D9] px-[22px] py-[30px]">
            <Text className="text-[22px] font-black text-[#333333]">최종 점수</Text>
            <Text className="mt-[18px] text-[68px] font-extrabold leading-[60px] text-[#333333]">
              {score.toLocaleString()}
            </Text>
            <Text className="mt-[18px] text-[16px] font-medium text-[#404040]">
              난이도: {difficulty}
            </Text>
          </View>

          <View className="mt-8 min-h-[202px] rounded-[18px] bg-[#D9D9D9] px-6 pb-[34px] pt-8">
            <Text className="text-[24px] font-bold text-[#333333]">게임 통계</Text>
            <View className="mb-7 mt-6 h-[2px] bg-[#666666]" />
            <Stat label="정확도" value={`${params.accuracy ?? "0"} %`} />
            <Stat label="최고 콤보" value={`${params.maxCombo ?? "0"} 회`} />
            <Stat label="손가락 운동량" value={`${params.exerciseCount ?? "0"} 회`} />
          </View>
        </View>

        <View className="bg-white px-[30px] pb-[20px] pt-[20px]">
          <View className="flex-row gap-[10px]">
            <Pressable
              className="min-h-[66px] flex-1 items-center justify-center rounded-[19px] bg-[#555555]"
              onPress={() =>
                router.replace({
                  pathname: "/play",
                  params: { level: params.level ?? "normal" }
                })
              }
            >
              <Text className="text-[24px] font-bold leading-9 text-white">
                다시 하기
              </Text>
            </Pressable>

            <Pressable
              className="min-h-[66px] flex-1 items-center justify-center rounded-[19px] border-[3px] border-[#555555] bg-white"
              onPress={() => router.replace("/level" as never)}
            >
              <Text className="text-[24px] font-bold leading-[34px] text-[#333333]">
                난이도 변경
              </Text>
            </Pressable>
          </View>

          <Pressable
            className="mt-4 min-h-[66px] items-center justify-center rounded-[18px] bg-[#C6C6C6]"
            onPress={() => router.replace("/")}
          >
            <Text className="text-[24px] font-bold leading-9 text-[#333333]">홈으로</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GameHeader() {
  return (
    <View className="w-full flex-row items-center justify-between pt-5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="나가기"
        className="min-h-12 flex-row items-center pr-4"
        onPress={() => router.replace("/")}
      >
        <Ionicons name="exit-outline" size={34} color="#FFFFFF" />
        <Text className="ml-3 text-xl font-medium text-white">나가기</Text>
        <View className="ml-3">
          <Ionicons name="hand-left" size={28} color="#9FE27B" />
        </View>
      </Pressable>

      <Ionicons name="volume-high-outline" size={34} color="#FFFFFF" />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-h-10 flex-row items-center justify-between">
      <Text className="text-[24px] font-bold text-[#333333]">{label}</Text>
      <Text className="text-[24px] font-bold text-[#333333]">{value}</Text>
    </View>
  );
}
