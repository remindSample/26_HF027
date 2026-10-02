import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { getMonthlyAnswerReport, type AnswerResponse } from "@/apis";

type MemoryItem = {
  id: number;
  isoDate: string;
  displayDate: string;
  answerText: string;
};

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

function getIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function toDateKey(date: Date) {
  return getIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function formatDisplayDate(date: Date) {
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월 ${String(
    date.getDate(),
  ).padStart(2, "0")}일`;
}

function toMemoryItem(answer: AnswerResponse): MemoryItem {
  const answeredAt = new Date(answer.answered_at);

  return {
    id: answer.id,
    isoDate: toDateKey(answeredAt),
    displayDate: formatDisplayDate(answeredAt),
    answerText: answer.content_text || answer.ocr_text || "텍스트 답변 없음",
  };
}

function getCalendarCells(year: number, month: number) {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: firstWeekday }, () => null);

  for (let day = 1; day <= lastDate; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
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

      <Pressable className="h-[50px] flex-1 flex-row items-center justify-center rounded-[16px] bg-[#F9EBDF]"
      style={{
                  elevation: 0.5,
                  shadowColor: "#000000",
                  shadowOffset: { width: 1, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                }}>
        <Ionicons name="calendar-outline" size={25} color="#000000" />
        <Text className="ml-2 text-[20px] font-medium text-black">달력</Text>
      </Pressable>

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

function MonthMemoryList({
  items,
  title,
}: {
  items: MemoryItem[];
  title: string;
}) {
  return (
    <View className="border-t border-white px-5 pb-5 pt-6">
      <Text className="text-[21px] font-medium text-black">{title}</Text>

      <View className="mt-5 gap-4">
        {items.length > 0 ? (
          items.map((item) => (
            <Pressable
              key={item.id}
              className="rounded-[14px] bg-[#E7E7E7] px-4 py-4"
            >
              <Text className="text-[16px] font-medium text-[#777777]">
                {item.displayDate}
              </Text>
              <Text className="mt-5 text-[20px] font-medium leading-[29px] text-black">
                {item.answerText}
              </Text>
            </Pressable>
          ))
        ) : (
          <View className="rounded-[14px] bg-[#E7E7E7] px-4 py-8">
            <Text className="text-center text-[18px] font-medium text-[#777777]">
              이 달의 기억이 없습니다.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function GuardianMemoryMonthScreen() {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [pickerType, setPickerType] = useState<"year" | "month" | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadAnswers() {
        setIsLoading(true);
        try {
          const report = await getMonthlyAnswerReport(selectedYear, selectedMonth);
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

      loadAnswers();

      return () => {
        isMounted = false;
      };
    }, [selectedMonth, selectedYear]),
  );

  const answerDates = useMemo(
    () => new Set(memoryItems.map((item) => item.isoDate)),
    [memoryItems],
  );
  const memoryItemsByDate = useMemo(() => {
    return memoryItems.reduce<Record<string, MemoryItem[]>>((acc, item) => {
      acc[item.isoDate] = [...(acc[item.isoDate] ?? []), item];
      return acc;
    }, {});
  }, [memoryItems]);
  const calendarCells = useMemo(
    () => getCalendarCells(selectedYear, selectedMonth),
    [selectedMonth, selectedYear],
  );
  const monthItems = useMemo(
    () => {
      const currentMonthItems = memoryItems.filter((item) =>
        item.isoDate.startsWith(
          `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`,
        ),
      );

      if (!selectedDateKey) {
        return currentMonthItems;
      }

      return currentMonthItems.filter((item) => item.isoDate === selectedDateKey);
    },
    [memoryItems, selectedDateKey, selectedMonth, selectedYear],
  );

  const selectDayAnswers = (day: number) => {
    const dateKey = getIsoDate(selectedYear, selectedMonth, day);
    const dayItems = memoryItemsByDate[dateKey] ?? [];

    if (dayItems.length === 0) {
      return;
    }

    setSelectedDateKey(dateKey);
  };

  const moveMonth = (amount: number) => {
    const nextDate = new Date(selectedYear, selectedMonth - 1 + amount, 1);
    setSelectedYear(nextDate.getFullYear());
    setSelectedMonth(nextDate.getMonth() + 1);
    setSelectedDateKey(null);
    setPickerType(null);
  };

  const selectedDay = selectedDateKey
    ? Number(selectedDateKey.slice(8, 10))
    : null;
  const memoryListTitle = selectedDay
    ? `${selectedMonth}월 ${selectedDay}일 기억들`
    : "이 달의 기억들";

  const years = Array.from({ length: 5 }, (_, index) => selectedYear - 2 + index);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);

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

        <View className="-mx-5 mt-8 bg-[#FDF2EC]">
          <View className="px-5 pb-7 pt-[26px]">
            <View className="rounded-[14px] bg-[#BFCBC7]/70 px-3 pb-4 pt-5">
              <View className="flex-row items-center justify-between">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="이전 달"
                  className="h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-[#BFCBC7]"
                  onPress={() => moveMonth(-1)}
                >
                  <Ionicons name="chevron-back" size={31} color="#ffffff" />
                </Pressable>

                <View className="flex-row items-center justify-center">
                  <Pressable
                    className="flex-row items-center"
                    onPress={() =>
                      setPickerType((current) =>
                        current === "year" ? null : "year",
                      )
                    }
                  >
                    <Text className="text-[28px] font-medium text-black">
                      {String(selectedYear).slice(2)} 년
                    </Text>
                    <Ionicons name="caret-down" size={24} color="#5A5A5A" />
                  </Pressable>

                  <Pressable
                    className="ml-4 flex-row items-center"
                    onPress={() =>
                      setPickerType((current) =>
                        current === "month" ? null : "month",
                      )
                    }
                  >
                    <Text className="text-[28px] font-medium text-black">
                      {selectedMonth} 월
                    </Text>
                    <Ionicons name="caret-down" size={24} color="#5A5A5A" />
                  </Pressable>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="다음 달"
                  className="h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-[#BFCBC7]"
                  onPress={() => moveMonth(1)}
                >
                  <Ionicons name="chevron-forward" size={31} color="#ffffff" />
                </Pressable>
              </View>

              {pickerType === "year" ? (
                <View className="mt-4 flex-row justify-center gap-2">
                  {years.map((candidateYear) => {
                    const isSelected = candidateYear === selectedYear;

                    return (
                      <Pressable
                        key={candidateYear}
                        className={`rounded-[10px] px-3 py-2 ${
                          isSelected ? "bg-[#858585]" : "bg-white"
                        }`}
                        onPress={() => {
                          setSelectedYear(candidateYear);
                          setPickerType(null);
                        }}
                      >
                        <Text
                          className={`text-[16px] font-medium ${
                            isSelected ? "text-white" : "text-black"
                          }`}
                        >
                          {candidateYear}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              {pickerType === "month" ? (
                <View className="mt-4 flex-row flex-wrap justify-center gap-2">
                  {months.map((candidateMonth) => {
                    const isSelected = candidateMonth === selectedMonth;

                    return (
                      <Pressable
                        key={candidateMonth}
                        className={`w-[46px] rounded-[10px] py-2 ${
                          isSelected ? "bg-[#858585]" : "bg-white"
                        }`}
                        onPress={() => {
                          setSelectedMonth(candidateMonth);
                          setPickerType(null);
                        }}
                      >
                        <Text
                          className={`text-center text-[16px] font-medium ${
                            isSelected ? "text-white" : "text-black"
                          }`}
                        >
                          {candidateMonth}월
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              <View className="mt-4 flex-row">
                {weekdays.map((weekday) => (
                  <Text
                    key={weekday}
                    className="flex-1 text-center text-[22px] font-medium text-black"
                  >
                    {weekday}
                  </Text>
                ))}
              </View>

              <View className="mt-4 flex-row flex-wrap">
                {calendarCells.map((day, index) => {
                  const dateKey =
                    day !== null ? getIsoDate(selectedYear, selectedMonth, day) : "";
                  const hasAnswer =
                    day !== null && answerDates.has(dateKey);

                  return (
                    <View
                      key={`${day ?? "empty"}-${index}`}
                      className="p-[4px]"
                      style={{ width: `${100 / 7}%` }}
                    >
                      <Pressable
                        className={`aspect-square items-center justify-center rounded-[16px] bg-white ${
                          hasAnswer ? "border-[3px] border-black" : ""
                        }`}
                        onPress={() => {
                          if (day !== null) selectDayAnswers(day);
                        }}
                      >
                        {hasAnswer ? (
                          <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF4B4B]" />
                        ) : null}
                        {day !== null ? (
                          <Text className="text-[24px] font-medium text-black">
                            {day}
                          </Text>
                        ) : null}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {isLoading ? (
            <View className="items-center py-4">
              <ActivityIndicator color="#7B7B7B" />
            </View>
          ) : null}

          <MonthMemoryList items={monthItems} title={memoryListTitle} />
        </View>
      </ScrollView>
    </View>
  );
}
