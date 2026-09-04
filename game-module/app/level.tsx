import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Level = {
  id: string;
  title: string;
  label?: string;
  starCount: number;
};

const LEVELS: Level[] = [
  { id: "1", title: "레벨 1", label: "매우 쉬움", starCount: 1 },
  { id: "2", title: "레벨 2", label: "쉬움", starCount: 2 },
  { id: "3", title: "레벨 3", label: "보통", starCount: 3 },
  { id: "4", title: "레벨 4", label: "어려움", starCount: 4 },
  { id: "5", title: "레벨 5", label: "매우 어려움", starCount: 5 }
];

function startGame(level: string) {
  router.push({
    pathname: "/play",
    params: {
      level,
      noteSpeedMs: "3400",
      spawnMs: "2400"
    }
  });
}

export default function LevelScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#55595A]">
      <ScrollView className="flex-1 bg-[#55595A]" showsVerticalScrollIndicator={false}>
        <View className="min-h-full flex-1 bg-[#55595A] pb-12 pt-6">
          <View className="px-4">
            <GameHeader />
          </View>

          <View className="px-[35px]">
            <View className="mt-[120px] items-center">
              <Text className="text-[52px] font-black tracking-[8px] text-[#D7D7D7]">
                Re:Mind
              </Text>
              <Text className="mt-[18px] self-end text-2xl font-medium tracking-[6px] text-[#D7D7D7]">
                인지 훈련게임
              </Text>
            </View>

            <View className="mt-[92px] gap-9">
              {LEVELS.map((level, index) => (
                <Pressable
                  key={level.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${level.title} 선택`}
                  className={`min-h-[72px] flex-row items-center justify-between rounded-[15px] px-6 py-[14px] ${
                    index % 2 === 1 ? "bg-[#BDBDBD]" : "bg-[#D7D7D7]"
                  }`}
                  onPress={() => startGame(level.id)}
                >
                  <View className="min-w-0 flex-1">
                    <Text className="text-[23px] font-extrabold leading-7 text-[#333333]">
                      {level.title}
                    </Text>
                    {level.label ? (
                      <Text className="mt-1 text-[17px] font-medium leading-[22px] text-[#707070]">
                        {level.label}
                      </Text>
                    ) : null}
                  </View>

                  <View className="flex-shrink-0 flex-row items-center justify-end gap-0.5">
                    {Array.from({ length: level.starCount }).map((_, starIndex) => (
                      <Ionicons
                        key={`${level.id}-${starIndex}`}
                        name="star"
                        size={34}
                        color="#555555"
                      />
                    ))}
                  </View>
                </Pressable>
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="게임 시작하기"
              className="mt-24 min-h-[70px] self-center items-center justify-center rounded-[19px] border-4 border-[#D7D7D7] px-[26px]"
              onPress={() => startGame("1")}
            >
              <Text className="text-[30px] font-medium leading-9 text-[#D7D7D7]">
                게임 시작하기
              </Text>
            </Pressable>
          </View>
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
        onPress={() => router.back()}
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
