import Header from "@/components/Header";
import { getMonthlyAnswerReport, type AnswerResponse } from "@/apis";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";

// 데모용 mock 데이터 (실제 API 연결 시 교체)
const MOCK_DATA = {
  score: 88,
  mission_rate: 94,
  comment:
    "이번 달은 어휘력이 지난달 대비 12% 향상됐습니다. 꾸준한 활동이 도움이 되고 있어요!",
  word_count: 197,
  word_diff: 22,
  complexity: 85,
  complexity_diff: 17,
};

const CALENDAR_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function ActivityReportScreen() {
  const [now, setNow] = useState(() => new Date());
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOffset = new Date(currentYear, currentMonth - 1, 1).getDay();

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
    let isMounted = true;

    async function loadAnswers() {
      setIsLoading(true);
      try {
        const report = await getMonthlyAnswerReport(currentYear, currentMonth);
        if (isMounted) {
          setAnswers(report.answers);
        }
      } catch {
        if (isMounted) {
          setAnswers([]);
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
    }, [currentYear, currentMonth])
  );

  const answersByDay = useMemo(() => {
    return answers.reduce<Record<number, AnswerResponse[]>>((acc, answer) => {
      const date = new Date(answer.answered_at);
      const day = date.getDate();
      acc[day] = [...(acc[day] ?? []), answer];
      return acc;
    }, {});
  }, [answers]);

  const handlePressDay = (day: number) => {
    const dayAnswers = answersByDay[day] ?? [];

    if (dayAnswers.length === 0) {
      return;
    }

    Alert.alert(
      `${currentMonth}월 ${day}일 답변`,
      dayAnswers
        .map((answer) => answer.content_text || answer.ocr_text || "텍스트 답변 없음")
        .join("\n\n")
    );
  };

  return (
    <View className="flex-1 bg-[#F0F8FF]">
      <Header title="활동 리포트" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-base font-semibold text-[#333333]">
          김순자 어르신의 인지 건강 분석
        </Text>

        {/* 요약 카드 */}
        <View
          className="bg-white rounded-[14px] p-4 gap-3"
          style={{ elevation: 1 }}
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-[15px] font-bold text-[#5BA4A4]">
              {currentMonth}월 리포트 요약
            </Text>
            <View className="bg-[#B7E4C7] rounded-lg px-2.5 py-1">
              <Text className="text-xs font-semibold text-[#1B5E20]">
                매우 좋음
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="flex-1 items-center gap-1">
              <Text className="text-2xl">🏆</Text>
              <Text className="text-xs text-[#777777]">평균 건강 점수</Text>
              <Text className="text-[22px] font-extrabold text-[#222222]">
                {MOCK_DATA.score}점
              </Text>
            </View>
            <View className="w-px h-[50px] bg-[#E0E0E0]" />
            <View className="flex-1 items-center gap-1">
              <Text className="text-2xl">✅</Text>
              <Text className="text-xs text-[#777777]">미션 완료율</Text>
              <Text className="text-[22px] font-extrabold text-[#222222]">
                {MOCK_DATA.mission_rate}%
              </Text>
            </View>
          </View>

          <View className="bg-[#F5F5F5] rounded-[10px] p-3">
            <Text className="text-sm text-[#444444] leading-[22px]">
              {MOCK_DATA.comment}
            </Text>
          </View>
        </View>

        {/* 활동 캘린더 */}
        <View className="bg-white rounded-[14px] p-4" style={{ elevation: 1 }}>
          <View className="flex-row justify-between mb-3">
            <Text className="text-[15px] font-bold text-[#333333]">
              활동 달력
            </Text>
            <Text className="text-sm text-[#5BA4A4] font-semibold">
              ‹ {currentYear}.{String(currentMonth).padStart(2, "0")} ›
            </Text>
          </View>

          {isLoading && (
            <View className="items-center py-3">
              <ActivityIndicator color="#5BA4A4" />
            </View>
          )}

          <View className="flex-row flex-wrap">
            {CALENDAR_DAYS.map((d) => (
              <Text
                key={d}
                className="w-[14.28%] text-center text-xs text-[#888888] mb-2 font-semibold"
              >
                {d}
              </Text>
            ))}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <View
                key={`empty-${i}`}
                className="w-[14.28%] items-center mb-1.5 h-9"
              />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const done = Boolean(answersByDay[day]?.length);
              return (
                <Pressable
                  key={day}
                  className="w-[14.28%] items-center mb-1.5 h-9"
                  onPress={() => handlePressDay(day)}
                >
                  {done && (
                    <View className="absolute right-[18px] top-0 h-1.5 w-1.5 rounded-full bg-[#FF4B4B]" />
                  )}
                  <Text
                    className={`text-[13px] ${done ? "font-bold text-[#222222]" : "text-[#555555]"}`}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row items-center gap-1.5 mt-2">
            <Text className="text-xs text-[#FF4B4B]">●</Text>
            <Text className="text-xs text-[#777777]">답변 완료</Text>
          </View>
        </View>

        {/* 단어/복잡도 수치 */}
        <View className="flex-row gap-3">
          <View
            className="flex-1 bg-white rounded-[14px] p-4 items-center gap-1.5"
            style={{ elevation: 1 }}
          >
            <Text className="text-[13px] text-[#777777]">단어 점수</Text>
            <Text className="text-[26px] font-extrabold text-[#222222]">
              {MOCK_DATA.word_count} 개
            </Text>
            <Text className="text-[13px] text-[#5BA4A4] font-semibold">
              ↑{MOCK_DATA.word_diff}개 증가
            </Text>
          </View>
          <View
            className="flex-1 bg-white rounded-[14px] p-4 items-center gap-1.5"
            style={{ elevation: 1 }}
          >
            <Text className="text-[13px] text-[#777777]">문장 복잡도</Text>
            <Text className="text-[26px] font-extrabold text-[#222222]">
              {MOCK_DATA.complexity} 점
            </Text>
            <Text className="text-[13px] text-[#5BA4A4] font-semibold">
              ↑{MOCK_DATA.complexity_diff}점 증가
            </Text>
          </View>
        </View>

        {/* 보호자 메모 */}
        <View className="bg-white rounded-[14px] p-4" style={{ elevation: 1 }}>
          <View className="flex-row justify-between mb-2.5">
            <Text className="text-[15px] font-bold text-[#333333]">
              보호자 메모
            </Text>
            <Text className="text-lg">✏️</Text>
          </View>
          <Text className="text-sm text-[#555555] leading-[22px]">
            산책을 자주 하시고, 가족과의 추억을 떠올려보세요.
          </Text>
        </View>
      </ScrollView>

    </View>
  );
}
