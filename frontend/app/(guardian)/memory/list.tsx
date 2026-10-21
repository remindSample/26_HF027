import {
  addAnswerFavorite,
  addAnswerLike,
  getAnswerFavorites,
  getAnswerLikes,
  getAuthSession,
  getCurrentGuardianAcceptedLink,
  getMonthlyAnswerReport,
  removeAnswerFavorite,
  removeAnswerLike,
  type AnswerResponse,
} from "@/apis";
import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type MemoryItem = {
  id: number;
  displayDate: string;
  question: string;
  answerPreview?: string;
  answerText: string;
  characterCount: number;
  isFavorite: boolean;
  isLiked: boolean;
};

const filterChips = [
  { key: "all", label: "전체" },
  { key: "month", label: "이번 달" },
  { key: "favorite", label: "", icon: "star" },
  { key: "liked", label: "", icon: "heart" },
  { key: "positive", label: "긍정적" },
] as const;

const ACTIVE_ICON_COLORS = {
  star: "#E8B04B",
  heart: "#E07A7A",
} as const;

function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월 ${String(
    date.getDate(),
  ).padStart(2, "0")}일`;
}

function toMemoryItem(answer: AnswerResponse): MemoryItem {
  const answerText = answer.content_text || answer.ocr_text || "텍스트 답변 없음";

  return {
    id: answer.id,
    displayDate: formatDisplayDate(answer.answered_at),
    question: answer.question_content || "작성한 답변",
    answerPreview: answerText,
    answerText,
    characterCount: answerText.length,
    isFavorite: false,
    isLiked: false,
  };
}

function MemoryTabs() {
  return (
    <View className="mt-8 flex-row justify-between gap-4">
      <Pressable
        className="h-[50px] flex-1 flex-row items-center justify-center rounded-[16px] bg-[#F9EBDF]"
        style={{
          elevation: 0.5,
          shadowColor: "#000000",
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
      >
        <Ionicons name="list" size={25} color="#1F1F1F" />
        <Text className="ml-2 text-[20px] font-medium text-black">목록</Text>
      </Pressable>

      <Link href="/(guardian)/memory/month" asChild>
        <Pressable
          className="h-[50px] flex-1 flex-row items-center justify-center rounded-[16px] bg-[#F9F7F4]"
          style={{
            elevation: 0.5,
            shadowColor: "#000000",
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
          }}
        >
          <Ionicons name="calendar-outline" size={25} color="#1F1F1F" />
          <Text className="ml-2 text-[20px] font-medium text-black">달력</Text>
        </Pressable>
      </Link>

      <Link href="/(guardian)/memory/week" asChild>
        <Pressable
          className="h-[50px] flex-1 flex-row items-center justify-center rounded-[16px] bg-[#F9F7F4]"
          style={{
            elevation: 0.5,
            shadowColor: "#000000",
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
          }}
        >
          <Ionicons name="calendar-clear-outline" size={25} color="#1F1F1F" />
          <Text className="ml-2 text-[20px] font-medium text-black">주간</Text>
        </Pressable>
      </Link>
    </View>
  );
}

function MemoryCard({
  item,
  isOpen,
  onToggleFavorite,
  onToggleLike,
  onToggleDetail,
}: {
  item: MemoryItem;
  isOpen: boolean;
  onToggleFavorite: (id: number) => void;
  onToggleLike: (id: number) => void;
  onToggleDetail: (id: number) => void;
}) {
  return (
    <View className="overflow-hidden rounded-[10px] bg-[#FFFBF7] border-2 border-black">
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
            color={item.isFavorite ? ACTIVE_ICON_COLORS.star : "#4D4D4D"}
          />
        </Pressable>
      </View>

      <View className="border-t border-black px-4 pb-4 pt-4">
        <Text className="text-[19px] font-medium leading-[28px] text-black">
          {item.question}
        </Text>

        <View className="mt-3 min-h-[94px] justify-between bg-white px-4 py-4 border border-[#F9EBDF]">
          {isOpen ? (
            <View>
              <Text className="text-[15px] font-medium text-[#777777]">
                답변
              </Text>
              <Text className="mt-2 text-[19px] font-medium leading-[28px] text-black">
                {item.answerText}
              </Text>
            </View>
          ) : (
            <Text className="text-[19px] font-medium text-[#8A8A8A]">
              {item.answerPreview ?? "답변..."}
            </Text>
          )}
          <Pressable className="self-end" onPress={() => onToggleDetail(item.id)}>
            <Text className="text-[17px] font-medium text-black">
              {isOpen ? "접기" : "자세히 보기"}
            </Text>
          </Pressable>
        </View>

        <View className="mt-3 border-t border-[#D2D2D2] pt-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-[18px] font-medium text-black">
              {item.characterCount}자
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="좋아요"
              hitSlop={8}
              onPress={() => onToggleLike(item.id)}
            >
              <Ionicons
                name={item.isLiked ? "heart" : "heart-outline"}
                size={34}
                color={item.isLiked ? ACTIVE_ICON_COLORS.heart : "#4D4D4D"}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function GuardianMemoryListScreen() {
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMemoryId, setSelectedMemoryId] = useState<number | null>(null);
  const [guardianId, setGuardianId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadMemories() {
        setIsLoading(true);
        try {
          const session = await getAuthSession();
          const currentGuardianId = session?.user.id ?? null;
          if (isMounted) {
            setGuardianId(currentGuardianId);
          }

          const link = await getCurrentGuardianAcceptedLink();
          if (!link) {
            if (isMounted) {
              setMemoryItems([]);
            }
            return;
          }

          const now = new Date();
          const report = await getMonthlyAnswerReport(
            now.getFullYear(),
            now.getMonth() + 1,
            link.elder_id,
          );
          // 조회에 실패한 쪽은 전부 false로 둡니다. (좋아요 조회 API 미배포 서버 대비)
          const [favorites, likes] = currentGuardianId
            ? await Promise.all([
                getAnswerFavorites(currentGuardianId).catch(() => []),
                getAnswerLikes(currentGuardianId).catch(() => []),
              ])
            : [[], []];
          const favoriteIds = new Set(favorites.map((mark) => mark.answer_id));
          const likedIds = new Set(likes.map((mark) => mark.answer_id));

          if (isMounted) {
            setMemoryItems(
              report.answers.map((answer) => ({
                ...toMemoryItem(answer),
                isFavorite: favoriteIds.has(answer.id),
                isLiked: likedIds.has(answer.id),
              })),
            );
          }
        } catch {
          if (isMounted) {
            setMemoryItems([]);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }

      loadMemories();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const toggleMark = async (id: number, field: "isFavorite" | "isLiked") => {
    const target = memoryItems.find((item) => item.id === id);
    if (!target) return;

    const previous = target[field];
    const setMark = (value: boolean) =>
      setMemoryItems((items) =>
        items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      );

    setMark(!previous);

    try {
      if (!guardianId) {
        throw new Error("guardian id not found");
      }

      if (field === "isFavorite") {
        await (previous
          ? removeAnswerFavorite(id, guardianId)
          : addAnswerFavorite(id, guardianId));
      } else {
        await (previous
          ? removeAnswerLike(id, guardianId)
          : addAnswerLike(id, guardianId));
      }
    } catch {
      setMark(previous);
      Alert.alert("알림", "저장에 실패했어요. 다시 시도해주세요.");
    }
  };

  const toggleFavorite = (id: number) => toggleMark(id, "isFavorite");

  const toggleLike = (id: number) => toggleMark(id, "isLiked");

  const visibleItems = memoryItems.filter((item) => {
    switch (activeFilter) {
      case "favorite":
        return item.isFavorite;
      case "liked":
        return item.isLiked;
      case "month":
        // 현재 목록은 이번 달 답변만 조회하므로 전부 표시합니다.
        return true;
      case "positive":
        // TODO: 감정 분석 연동
        return true;
      default:
        return true;
    }
  });

  const emptyMessage =
    activeFilter === "favorite"
      ? "즐겨찾기한 기억이 없습니다."
      : activeFilter === "liked"
        ? "좋아요한 기억이 없습니다."
        : "표시할 기억이 없습니다.";

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
                onPress={() => {
                  setActiveFilter(chip.key);
                  setSelectedMemoryId(null);
                }}
              >
                {"icon" in chip ? (
                  <Ionicons
                    name={isActive ? chip.icon : `${chip.icon}-outline`}
                    size={30}
                    color={isActive ? ACTIVE_ICON_COLORS[chip.icon] : "#1F1F1F"}
                  />
                ) : (
                  <Text className="text-[19px] font-medium text-black">
                    {chip.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="mt-8 gap-7">
          {isLoading ? (
            <View className="items-center py-4">
              <ActivityIndicator color="#174C33" />
            </View>
          ) : visibleItems.length > 0 ? (
            visibleItems.map((item) => (
              <MemoryCard
                key={item.id}
                item={item}
                isOpen={selectedMemoryId === item.id}
                onToggleFavorite={toggleFavorite}
                onToggleLike={toggleLike}
                onToggleDetail={(id) =>
                  setSelectedMemoryId((current) => (current === id ? null : id))
                }
              />
            ))
          ) : (
            <View className="items-center justify-center rounded-[10px] bg-[#EEEEEE] px-5 py-12">
              <Text className="text-center text-[18px] font-medium text-[#777777]">
                {emptyMessage}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
