import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

type MemoryItem = {
  id: number;
  isoDate: string;
  displayDate: string;
  question: string;
};

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

const memoryItems: MemoryItem[] = [
  {
    id: 1,
    isoDate: "2026-04-03",
    displayDate: "2026년 04월 03일",
    question: "가장 행복했던 여행지는 어디인가요?",
  },
  {
    id: 2,
    isoDate: "2026-04-22",
    displayDate: "2026년 04월 22일",
    question: "최근에 가장 또렷하게 떠오른 기억은 무엇인가요?",
  },
  {
    id: 3,
    isoDate: "2026-04-23",
    displayDate: "2026년 04월 23일",
    question: "함께 시간을 보내고 싶은 사람은 누구인가요?",
  },
  {
    id: 4,
    isoDate: "2026-04-24",
    displayDate: "2026년 04월 24일",
    question: "오늘 떠오른 따뜻한 장면을 적어보세요.",
  },
  {
    id: 5,
    isoDate: "2026-04-26",
    displayDate: "2026년 04월 26일",
    question: "오래 기억하고 싶은 장소는 어디인가요?",
  },
  {
    id: 6,
    isoDate: "2026-04-28",
    displayDate: "2026년 04월 28일",
    question: "기분이 좋아졌던 순간을 떠올려보세요.",
  },
  {
    id: 7,
    isoDate: "2026-04-29",
    displayDate: "2026년 04월 29일",
    question: "가장 소중한 물건에는 어떤 기억이 있나요?",
  },
  {
    id: 8,
    isoDate: "2026-04-30",
    displayDate: "2026년 04월 30일",
    question: "이번 달에 새롭게 떠오른 기억은 무엇인가요?",
  },
];

function getIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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
      <Link href="/(guardian)/memory/list" asChild>
        <Pressable className="h-[50px] flex-1 flex-row items-center justify-center rounded-[16px] bg-[#BFBFBF]">
          <Ionicons name="list" size={25} color="#1F1F1F" />
          <Text className="ml-2 text-[20px] font-medium text-black">목록</Text>
        </Pressable>
      </Link>

      <Pressable className="h-[50px] flex-1 flex-row items-center justify-center rounded-[16px] bg-[#7B7B7B]">
        <Ionicons name="calendar-outline" size={25} color="#FFFFFF" />
        <Text className="ml-2 text-[20px] font-medium text-white">달력</Text>
      </Pressable>

      <Link href="/(guardian)/memory/week" asChild>
        <Pressable className="h-[50px] flex-1 flex-row items-center justify-center rounded-[16px] bg-[#BFBFBF]">
          <Ionicons name="calendar-clear-outline" size={25} color="#1F1F1F" />
          <Text className="ml-2 text-[20px] font-medium text-black">주간</Text>
        </Pressable>
      </Link>
    </View>
  );
}

function MonthMemoryList({ items }: { items: MemoryItem[] }) {
  return (
    <View className="border-t border-white px-5 pb-5 pt-6">
      <Text className="text-[21px] font-medium text-black">이 달의 기억들</Text>

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
                {item.question}
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
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(4);
  const [pickerType, setPickerType] = useState<"year" | "month" | null>(null);

  const answerDates = useMemo(
    () => new Set(memoryItems.map((item) => item.isoDate)),
    [],
  );
  const calendarCells = useMemo(
    () => getCalendarCells(selectedYear, selectedMonth),
    [selectedMonth, selectedYear],
  );
  const monthItems = useMemo(
    () =>
      memoryItems.filter((item) =>
        item.isoDate.startsWith(
          `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`,
        ),
      ),
    [selectedMonth, selectedYear],
  );

  const moveMonth = (amount: number) => {
    const nextDate = new Date(selectedYear, selectedMonth - 1 + amount, 1);
    setSelectedYear(nextDate.getFullYear());
    setSelectedMonth(nextDate.getMonth() + 1);
    setPickerType(null);
  };

  const years = Array.from({ length: 5 }, (_, index) => selectedYear - 2 + index);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-6 pt-[30px]"
        showsVerticalScrollIndicator={false}
      >
        <View className="h-[56px] flex-row items-center bg-[#D9D9D9] px-3">
          <Ionicons name="search-outline" size={38} color="#858585" />
          <TextInput
            accessibilityLabel="기억 검색"
            className="ml-3 flex-1 text-[25px] font-medium text-black"
            placeholder="기억 검색하기..."
            placeholderTextColor="#858585"
          />
        </View>

        <MemoryTabs />

        <View className="-mx-5 mt-8 bg-[#A9A9A9]">
          <View className="px-5 pb-7 pt-[26px]">
            <View className="rounded-[14px] bg-[#DADADA] px-3 pb-4 pt-5">
              <View className="flex-row items-center justify-between">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="이전 달"
                  className="h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-[#8C8C8C]"
                  onPress={() => moveMonth(-1)}
                >
                  <Ionicons name="chevron-back" size={31} color="#111111" />
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
                  className="h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-[#8C8C8C]"
                  onPress={() => moveMonth(1)}
                >
                  <Ionicons name="chevron-forward" size={31} color="#111111" />
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
                  const hasAnswer =
                    day !== null &&
                    answerDates.has(getIsoDate(selectedYear, selectedMonth, day));

                  return (
                    <View
                      key={`${day ?? "empty"}-${index}`}
                      className="w-[14.2857%] p-[4px]"
                    >
                      <View
                        className={`aspect-square items-center justify-center rounded-[16px] bg-white ${
                          hasAnswer ? "border-[3px] border-black" : ""
                        }`}
                      >
                        {day !== null ? (
                          <Text className="text-[24px] font-medium text-black">
                            {day}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <MonthMemoryList items={monthItems} />
        </View>
      </ScrollView>
    </View>
  );
}
