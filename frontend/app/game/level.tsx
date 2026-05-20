import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import clsx from "clsx";

type LevelId = "1" | "2" | "3" | "4" | "5";

type Level = {
  id: LevelId;
  title: string;
  label: string;
  starCount: number;
};

const LEVELS: Level[] = [
  { id: "1", title: "레벨 1", label: "매우 쉬움", starCount: 1 },
  { id: "2", title: "레벨 2", label: "쉬움", starCount: 2 },
  { id: "3", title: "레벨 3", label: "보통", starCount: 3 },
  { id: "4", title: "레벨 4", label: "어려움", starCount: 4 },
  { id: "5", title: "레벨 5", label: "매우 어려움", starCount: 5 },
];

export default function GameLevelScreen() {
  const [selectedLevel, setSelectedLevel] = useState<LevelId | null>(null);

  const handleStartGame = () => {
    if (!selectedLevel) return;

    router.push({
      pathname: "/game/play",
      params: {
        level: selectedLevel,
      },
    });
  };

  return (
    <View className="flex-1 bg-[#4A4D4F] px-[32px] pt-[48px] pb-[40px]">
      {/* 상단 바 */}
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-[12px]"
        >
          <Text className="text-[36px] text-white">←</Text>
          <Text className="text-[18px] text-white">나가기</Text>
        </Pressable>

        <Text className="text-[30px] text-[#9CDC65]">잎</Text>

        <Pressable>
          <Text className="text-[32px] text-white">홈</Text>
        </Pressable>
      </View>

      {/* 타이틀 */}
      <View className="mt-[110px] mb-[64px] items-center">
        <Text className="text-[52px] font-bold tracking-[6px] text-[#D9D9D9]">
          Re:Mind
        </Text>

        <Text className="mt-[12px] ml-[160px] text-[20px] tracking-[8px] text-[#D9D9D9]">
          인지 훈련게임
        </Text>
      </View>

      {/* 레벨 리스트 */}
      <View className="gap-[24px]">
        {LEVELS.map((level) => {
          const isSelected = selectedLevel === level.id;

          return (
            <Pressable
              key={level.id}
              onPress={() => setSelectedLevel(level.id)}
              className={clsx(
                "h-[96px] flex-row items-center justify-between rounded-[18px] bg-[#D9D9D9] px-[32px]",
                isSelected && "border-[4px] border-[#9CDC65]",
              )}
            >
              <View>
                <Text className="text-[26px] font-bold text-[#333333]">
                  {level.title}
                </Text>

                <Text className="mt-[4px] text-[19px] text-[#707070]">
                  {level.label}
                </Text>
              </View>

              <Text className="text-[32px] tracking-[-2px] text-[#555555]">
                {"★".repeat(level.starCount)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 시작 버튼 */}
      <Pressable
        onPress={handleStartGame}
        disabled={!selectedLevel}
        className={clsx(
          "mt-[64px] self-center rounded-[22px] border-[4px] border-[#D9D9D9] px-[36px] py-[16px]",
          !selectedLevel && "opacity-45",
        )}
      >
        <Text className="text-[32px] font-semibold text-[#D9D9D9]">
          게임 시작하기
        </Text>
      </Pressable>
    </View>
  );
}
