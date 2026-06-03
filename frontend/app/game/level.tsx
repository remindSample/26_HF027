import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GameHeader from "./components/GameHeader";

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

export default function LevelScreen() {
  const [selectedLevel, setSelectedLevel] = useState<LevelId>("1");

  const handleStartGame = () => {
    router.push({
      pathname: "/game/play",
      params: {
        level: selectedLevel,
      },
    });
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#555656]">
      <ScrollView
        className="flex-1 bg-[#555656]"
        contentContainerClassName="pb-20 bg-[#555656]"
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-6 px-4">
          <GameHeader
            rightElement={
              <Ionicons name="volume-high-outline" size={30} color="#FFFFFF" />
            }
          />
        </View>

        <View className="px-[36px]">
          <View className="items-center mt-[40px] mb-[74px]">
            <Text className="text-[52px] font-extrabold text-[#D9D9D9] tracking-[8px]">
              Re:Mind
            </Text>
            <Text className="mt-2 text-[24px] text-[#D9D9D9] tracking-[8px]">
              인지 훈련게임
            </Text>
          </View>

          <View className="w-full">
            {LEVELS.map((level) => {
              const isSelected = selectedLevel === level.id;

              return (
                <TouchableOpacity
                  key={level.id}
                  activeOpacity={0.75}
                  onPress={() => setSelectedLevel(level.id)}
                  className={`w-full h-[70px] rounded-[15px] px-8 mb-[18px] flex-row items-center justify-between overflow-hidden ${
                    isSelected ? "bg-[#D9D9D9]" : "bg-[#BDBDBD]"
                  }`}
                >
                  <View className="shrink">
                    <Text className="text-[22px] font-bold text-[#3F3F3F] mb-1.5">
                      {level.title}
                    </Text>
                    <Text className="text-[16px] text-[#777777]">{level.label}</Text>
                  </View>

                  <Text className="text-[36px] text-[#4A4A4A] tracking-[-2px]">
                    {"★".repeat(level.starCount)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleStartGame}
            className="w-[216px] h-[68px] rounded-3xl border-[5px] border-[#D9D9D9] self-center items-center justify-center mt-[31px]"
          >
            <Text className="text-[28px] font-bold text-[#D9D9D9]">
              게임 시작하기
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
