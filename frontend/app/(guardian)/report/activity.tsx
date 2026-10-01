import Header from "@/components/Header";
import { getMonthlyAnswerReport, getMonthlyGameReport, type AnswerResponse, type MonthlyGameReport } from "@/apis";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

const CALENDAR_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDiffPct(pct: number | null) {
  if (pct === null) {
    return "지난달 데이터 없음";
  }
  const sign = pct > 0 ? "+" : "";
  return `지난달 대비 ${sign}${pct}%`;
}

function diffColorClass(pct: number | null) {
  if (pct === null) return "text-[#999999]";
  if (pct < 0) return "text-[#E57373]";
  return "text-[#5BA4A4]";
}

export default function ActivityReportScreen() {
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [aiComment, setAiComment] = useState("");
  const [avgWordCount, setAvgWordCount] = useState(0);
  const [wordCountDiffPct, setWordCountDiffPct] = useState<number | null>(null);
  const [avgComplexityScore, setAvgComplexityScore] = useState(0);
  const [complexityDiffPct, setComplexityDiffPct] = useState<number | null>(null);
  const [gameReport, setGameReport] = useState<MonthlyGameReport | null>(null);
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOffset = new Date(currentYear, currentMonth - 1, 1).getDay();

  useEffect(() => {
    const timer = setInterval(() => {
      const nextDate = new Date();
      setCurrentYear(nextDate.getFullYear());
      setCurrentMonth(nextDate.getMonth() + 1);
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadReport() {
        try {
          const report = await getMonthlyAnswerReport(currentYear, currentMonth);
          const gameData = await getMonthlyGameReport(currentYear, currentMonth);
          if (isMounted) {
            setAnswers(report.answers);
            setAiComment(report.ai_comment);
            setAvgWordCount(report.avg_word_count);
            setWordCountDiffPct(report.word_count_diff_pct);
            setAvgComplexityScore(report.avg_complexity_score);
            setComplexityDiffPct(report.complexity_diff_pct);
            setGameReport(gameData);
          }
        } catch {
          if (isMounted) {
            setAnswers([]);
            setAiComment("코멘트를 불러오지 못했습니다.");
            setAvgWordCount(0);
            setWordCountDiffPct(null);
            setAvgComplexityScore(0);
            setComplexityDiffPct(null);
            setGameReport(null);
          }
        }
      }

      loadReport();

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

  const complexityScoreOutOf100 = Math.round(
    Math.min((avgComplexityScore / 10) * 100, 100)
  );
  const gameAccuracy = gameReport?.accuracy ?? null;
  const averageHealthScore =
    gameAccuracy === null
      ? complexityScoreOutOf100
      : Math.round((complexityScoreOutOf100 + gameAccuracy) / 2);
  const missionRate = Math.round(
    Math.min((Object.keys(answersByDay).length / Math.max(daysInMonth, 1)) * 100, 100)
  );
  const guardianMemo =
    answers.length > 0
      ? `${currentMonth}월 답변 ${answers.length}개와 게임 ${gameReport?.session_count ?? 0}회 기록을 바탕으로 리포트가 생성됐습니다.`
      : "이번 달 답변 기록이 아직 없습니다.";

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
                {averageHealthScore}점
              </Text>
            </View>
            <View className="w-px h-[50px] bg-[#E0E0E0]" />
            <View className="flex-1 items-center gap-1">
              <Text className="text-2xl">✅</Text>
              <Text className="text-xs text-[#777777]">미션 완료율</Text>
              <Text className="text-[22px] font-extrabold text-[#222222]">
                {missionRate}%
              </Text>
            </View>
          </View>

          <View className="bg-[#F5F5F5] rounded-[10px] p-3">
            <Text className="text-sm text-[#444444] leading-[22px]">
              {aiComment}
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
                <View key={day} className="w-[14.28%] items-center mb-1.5 h-9">
                  <Text
                    className={`text-[13px] ${done ? "font-bold text-[#222222]" : "text-[#555555]"}`}
                  >
                    {day}
                  </Text>
              {done && (
                    <Text className="text-[8px] text-[#5BA4A4] mt-0.5">●</Text>
                  )}
                </View>
              );
            })}
          </View>

          <View className="flex-row items-center gap-1.5 mt-2">
            <Text className="text-xs text-[#5BA4A4]">●</Text>
            <Text className="text-xs text-[#777777] mr-3">활동 완료</Text>
            <Text className="text-xs text-[#CCCCCC]">●</Text>
            <Text className="text-xs text-[#777777]">미완료</Text>
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
              {avgWordCount.toFixed(1)} 개
            </Text>
            <Text className={`text-[13px] font-semibold ${diffColorClass(wordCountDiffPct)}`}>
              {formatDiffPct(wordCountDiffPct)}
            </Text>
          </View>
          <View
            className="flex-1 bg-white rounded-[14px] p-4 items-center gap-1.5"
            style={{ elevation: 1 }}
          >
            <Text className="text-[13px] text-[#777777]">문장 복잡도</Text>
            <Text className="text-[26px] font-extrabold text-[#222222]">
              {complexityScoreOutOf100} 점
            </Text>
            <Text className={`text-[13px] font-semibold ${diffColorClass(complexityDiffPct)}`}>
              {formatDiffPct(complexityDiffPct)}
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
            {guardianMemo}
          </Text>
        </View>
      </ScrollView>

    </View>
  );
}
