import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { getMonthlyAnswerReport, type AnswerResponse } from "@/apis";

type MemoryItem = {
  id: number;
  isoDate: string;
  question: string;
  answerText: string;
  characterCount: number;
};

type WeekDay = {
  isoDate: string;
  weekday: string;
  day: number;
};

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

function getIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function getWeekStart(date: Date) {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  return weekStart;
}

function getWeekDays(weekStart: Date): WeekDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return {
      isoDate: getIsoDate(date),
      weekday: weekdayLabels[index],
      day: date.getDate(),
    };
  });
}

function getWeekOfMonth(date: Date) {
  return Math.ceil(date.getDate() / 7);
}

function toMemoryItem(answer: AnswerResponse): MemoryItem {
  const answeredAt = new Date(answer.answered_at);
  const answerText = answer.content_text || answer.ocr_text || "텍스트 답변 없음";

  return {
    id: answer.id,
    isoDate: getIsoDate(answeredAt),
    question: answer.question_content || "작성한 답변",
    answerText,
    characterCount: answerText.length,
  };
}

function MemoryTabs() {
  return (
    <View className="mt-8 flex-row justify-between gap-4">
      <Link href="/(user)/memory/list" asChild>
        <Pressable className="h-[50px] flex-1 flex-row items-center justify-center rounded-[16px] bg-[#F9F7F4]"
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
      </Link>

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

      <Pressable className="h-[50px] flex-1 flex-row items-center justify-center rounded-[16px] bg-[#F9EBDF]"
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
    </View>
  );
}

function WeekMemoryRow({
  day,
  memory,
  isOpen,
  onToggleDetail,
}: {
  day: WeekDay;
  memory?: MemoryItem;
  isOpen: boolean;
  onToggleDetail: (id: number) => void;
}) {
  const hasMemory = Boolean(memory);

  return (
    <Pressable
      className={`min-h-[78px] rounded-[14px] px-5 py-3 ${
        hasMemory ? "bg-[#ede6d0]" : "bg-[#ffffff]"
      }`}
      onPress={() => {
        if (memory) onToggleDetail(memory.id);
      }}
    >
      <View className="flex-row items-center">
        <View className="w-[58px] items-center">
          <Text className="text-[17px] font-medium text-black">{day.weekday}</Text>
          <Text className="text-[24px] font-medium text-black">{day.day}</Text>
        </View>

        {hasMemory && memory ? (
          <>
            <View className="ml-7 flex-1">
              <Text
                className="text-[18px] font-medium leading-[28px] text-black"
                numberOfLines={1}
              >
                {memory.question}
              </Text>
              <Text className="mt-1 text-[17px] font-medium text-[#777777]">
                {memory.characterCount}자
              </Text>
            </View>
            <Ionicons name={isOpen ? "chevron-up" : "copy-outline"} size={37} color="#6B6255" />
          </>
        ) : (
          <Text className="ml-7 flex-1 text-[18px] font-medium text-[#777777]">
            기록 없음
          </Text>
        )}
      </View>

      {isOpen && memory ? (
        <View className="mt-3 rounded-[10px] bg-white px-4 py-4">
          <Text className="text-[15px] font-medium text-[#777777]">답변</Text>
          <Text className="mt-2 text-[18px] font-medium leading-[28px] text-black">
            {memory.answerText}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function UserMemoryWeekScreen() {
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMemoryId, setSelectedMemoryId] = useState<number | null>(null);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const titleDate = weekDays[3] ?? weekDays[0];
  const titleYear = titleDate.isoDate.slice(2, 4);
  const titleMonth = Number(titleDate.isoDate.slice(5, 7));
  const titleWeek = getWeekOfMonth(
    new Date(Number(titleDate.isoDate.slice(0, 4)), titleMonth - 1, titleDate.day),
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadMemories() {
        setIsLoading(true);
        try {
          const report = await getMonthlyAnswerReport(
            Number(titleDate.isoDate.slice(0, 4)),
            titleMonth,
          );
          if (isMounted) {
            setMemoryItems(report.answers.map(toMemoryItem));
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
    }, [titleDate.isoDate, titleMonth]),
  );

  const memoryByDate = useMemo(
    () =>
      new Map(memoryItems.map((memory) => [memory.isoDate, memory] as const)),
    [memoryItems],
  );

  const moveWeek = (amount: number) => {
    setWeekStart((current) => {
      const nextDate = new Date(current);
      nextDate.setDate(current.getDate() + amount * 7);
      return nextDate;
    });
    setSelectedMemoryId(null);
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

        <View className="-mx-5 mt-8 bg-[#FDF2EC] px-5 pb-8 pt-[26px]">
          <View className="rounded-[14px] bg-[#BFCBC7]/70 px-3 pb-4 pt-5">
            <View className="flex-row items-center justify-between">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="이전 주"
                className="h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-[#BFCBC7]"
                onPress={() => moveWeek(-1)}
              >
                <Ionicons name="chevron-back" size={31} color="#ffffff" />
              </Pressable>

              <Text className="text-[24px] font-medium text-black">
                {titleYear}년 {titleMonth}월 {titleWeek}주차
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="다음 주"
                className="h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-[#BFCBC7]"
                onPress={() => moveWeek(1)}
              >
                <Ionicons name="chevron-forward" size={31} color="#ffffff" />
              </Pressable>
            </View>

            <View className="mt-6 gap-3">
              {isLoading ? (
                <View className="items-center py-4">
                  <ActivityIndicator color="#174C33" />
                </View>
              ) : (
                weekDays.map((day) => {
                  const memory = memoryByDate.get(day.isoDate);

                  return (
                    <WeekMemoryRow
                      key={day.isoDate}
                      day={day}
                      memory={memory}
                      isOpen={Boolean(memory && selectedMemoryId === memory.id)}
                      onToggleDetail={(id) =>
                        setSelectedMemoryId((current) =>
                          current === id ? null : id,
                        )
                      }
                    />
                  );
                })
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
