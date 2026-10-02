import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

type MemoryItem = {
  id: number;
  displayDate: string;
  question: string;
  answerPreview?: string;
  characterCount: number;
  isFavorite: boolean;
  isLiked: boolean;
};

const filterChips = [
  { key: "all", label: "전체" },
  { key: "month", label: "이번 달" },
  { key: "favorite", label: "", icon: "star" },
  { key: "positive", label: "긍정적" },
] as const;

const initialMemoryItems: MemoryItem[] = [
  {
    id: 1,
    displayDate: "2026년 04월 01일",
    question: "가장 행복했던 여행지는 어디인가요?",
    answerPreview: "답변...",
    characterCount: 287,
    isFavorite: true,
    isLiked: true,
  },
  {
    id: 2,
    displayDate: "2026년 04월 03일",
    question: "첫 직장에서의 기억을 떠올려보세요.",
    answerPreview: "답변...",
    characterCount: 287,
    isFavorite: false,
    isLiked: true,
  },
];

function MemoryTabs() {
  return (
    <View className="mt-8 flex-row justify-between gap-4">
      <Pressable className="h-[50px] flex-1 flex-row items-center justify-center rounded-[16px] bg-[#F9EBDF]"
      style={{
                elevation: 0.5,
                shadowColor: "#000000",
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
              }}>
        <Ionicons name="list" size={25} color="#1F1F1F" />
        <Text className="ml-2 text-[20px] font-medium text-black">목록</Text>
      </Pressable>

      <Link href="/(user)/memory/month" asChild>
        <Pressable className="h-[50px] flex-1 flex-row items-center justify-center rounded-[16px] bg-[#F9F7F4]"
        style={{
                  elevation: 0.5,
                  shadowColor: "#000000",
                  shadowOffset: { width: 1, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                }}>
          <Ionicons name="calendar-outline" size={25} color="#1F1F1F" />
          <Text className="ml-2 text-[20px] font-medium text-black">달력</Text>
        </Pressable>
      </Link>

      <Link href="/(user)/memory/week" asChild>
        <Pressable className="h-[50px] flex-1 flex-row items-center justify-center rounded-[16px] bg-[#F9F7F4]"
        style={{
                  elevation: 0.5,
                  shadowColor: "#000000",
                  shadowOffset: { width: 1, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                }}>
          <Ionicons name="calendar-clear-outline" size={25} color="#1F1F1F" />
          <Text className="ml-2 text-[20px] font-medium text-black">주간</Text>
        </Pressable>
      </Link>
    </View>
  );
}

function MemoryCard({
  item,
  onToggleFavorite,
}: {
  item: MemoryItem;
  onToggleFavorite: (id: number) => void;
}) {
  return (
    <View className="overflow-hidden rounded-[10px] bg-[#FFFBF7] border-2 broder-black">
      <View className="min-h-[52px] flex-row items-center justify-between bg-[#F9EBDF] px-6 py-3">
        <Text className="flex-1 text-center text-[21px] font-medium text-black">
          {item.displayDate}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="즐겨찾기"
          className="h-11 w-11 items-center justify-center"
          onPress={() => onToggleFavorite(item.id)}
        >
          <Ionicons
            name={item.isFavorite ? "star" : "star-outline"}
            size={30}
            color="#4D4D4D"
          />
        </Pressable>
      </View>

      <View className="border-t border-black px-4 pb-4 pt-4">
        <Text className="text-[19px] font-medium leading-[28px] text-black">
          {item.question}
        </Text>

        <View className="mt-3 min-h-[94px] justify-between bg-white px-4 py-4 border-1 border-[#F9EBDF]">
          <Text className="text-[19px] font-medium text-[#8A8A8A]">
            {item.answerPreview ?? "답변..."}
          </Text>
          <Pressable className="self-end">
            <Text className="text-[17px] font-medium text-black">
              자세히 보기
            </Text>
          </Pressable>
        </View>

        <View className="mt-3 border-t border-[#D2D2D2] pt-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-[18px] font-medium text-black">
              {item.characterCount}자
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="좋아요">
              <Ionicons
                name={item.isLiked ? "heart" : "heart-outline"}
                size={34}
                color="#4D4D4D"
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function GuardianMemoryListScreen() {
  const [memoryItems, setMemoryItems] = useState(initialMemoryItems);
  const [activeFilter, setActiveFilter] = useState("all");

  const toggleFavorite = (id: number) => {
    setMemoryItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item,
      ),
    );
  };

  return (
    <View className="flex-1 bg-[#FDF2EC]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-6 pt-[30px]"
        showsVerticalScrollIndicator={false}
      >
        <View className="h-[56px] flex-row items-center bg-white px-3">
          <Ionicons name="search-outline" size={38} color="#858585" />
          <TextInput
            accessibilityLabel="기억 검색"
            className="ml-3 flex-1 text-[25px] font-medium text-black"
            placeholder="기억 검색하기..."
            placeholderTextColor="#858585"
          />
        </View>

        <MemoryTabs />

        <ScrollView
          horizontal
          className="-mx-5 mt-6"
          contentContainerClassName="gap-3 px-5"
          showsHorizontalScrollIndicator={false}
        >
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.key;

            return (
              <Pressable
                key={chip.key}
                className={`my-1 h-[46px] min-w-[56px] flex-row items-center justify-center rounded-[23px] px-7 ${
                  isActive ? "bg-[#F9EBDF]" : "bg-[#F9F7F4]"
                }`}
                style={{
                  elevation: 0.5,
                  shadowColor: "#000000",
                  shadowOffset: { width: 0.5, height: 0.5 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                }}
                onPress={() => setActiveFilter(chip.key)}
              >
                {"icon" in chip ? (
                  <Ionicons name={chip.icon} size={30} color="#1F1F1F" />
                ) : (
                  <Text
                    className="text-[19px] font-medium text-black"
                  >
                    {chip.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="mt-8 gap-7">
          {memoryItems.length > 0 ? (
            memoryItems.map((item) => (
              <MemoryCard
                key={item.id}
                item={item}
                onToggleFavorite={toggleFavorite}
              />
            ))
          ) : (
            <View className="items-center justify-center rounded-[10px] bg-[#EEEEEE] px-5 py-12">
              <Text className="text-center text-[18px] font-medium text-[#777777]">
                표시할 기억이 없습니다.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
