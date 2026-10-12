import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import Header from "@/components/Header";
import {
  getAnswerReportHistory,
  getMonthlyAnswerReport,
  getMonthlyGameReport,
  type MonthlyGameReport,
  type MonthlyHistoryResponse,
} from "@/apis";

function HorizontalBar({
  label,
  value,
  maxValue,
  isUser,
  unit,
  hasData = true,
}: {
  label: string;
  value: number;
  maxValue: number;
  isUser: boolean;
  unit: string;
  hasData?: boolean;
}) {
  const pct = hasData ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <View className="flex-row items-center gap-2 my-1">
      <Text className="w-9 text-xs text-[#666666] text-right">{label}</Text>
      <View className="flex-1 h-[18px] bg-[#EEEEEE] rounded-[9px] overflow-hidden">
        {hasData && (
          <View
            className={`h-full rounded-[9px] ${isUser ? "bg-[#5BA4A4]" : "bg-[#AAAAAA]"}`}
            style={{ width: `${pct}%` as any }}
          />
        )}
      </View>
      <Text className="w-9 text-xs text-[#444444]">
        {hasData ? `${value}${unit}` : "-"}
      </Text>
    </View>
  );
}

function SentimentBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="w-[30px] text-[13px] text-[#555555]">{label}</Text>
      <View className="flex-1 h-[22px] bg-[#EEEEEE] rounded overflow-hidden">
        <View
          className="h-full rounded"
          style={{ width: `${value}%` as any, backgroundColor: color }}
        />
      </View>
      <Text className="w-7 text-[13px] font-bold text-[#444444] text-right">
        {value}
      </Text>
    </View>
  );
}

export default function DetailScreen() {
  const [sentiment, setSentiment] = useState<{
    positive: number;
    neutral: number;
    negative: number;
  } | null>(null);
  const [gameReport, setGameReport] = useState<MonthlyGameReport | null>(null);
  const [isSentimentLoading, setIsSentimentLoading] = useState(true);
  const [history, setHistory] = useState<MonthlyHistoryResponse | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadReport() {
        setIsSentimentLoading(true);
        setIsHistoryLoading(true);
        try {
          const now = new Date();
          const report = await getMonthlyAnswerReport(
            now.getFullYear(),
            now.getMonth() + 1
          );
          const gameData = await getMonthlyGameReport(
            now.getFullYear(),
            now.getMonth() + 1
          );
          const historyData = await getAnswerReportHistory(4);
          if (isMounted) {
            setSentiment({
              positive: report.sentiment_summary.positive ?? 0,
              neutral: report.sentiment_summary.neutral ?? 0,
              negative: report.sentiment_summary.negative ?? 0,
            });
            setGameReport(gameData);
            setHistory(historyData);
          }
        } catch {
          if (isMounted) {
            setSentiment(null);
            setGameReport(null);
            setHistory(null);
          }
        } finally {
          if (isMounted) {
            setIsSentimentLoading(false);
            setIsHistoryLoading(false);
          }
        }
      }

      loadReport();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const sentimentBars = sentiment
    ? [
        { label: "긍정", value: sentiment.positive, color: "#5BA4A4" },
        { label: "중립", value: sentiment.neutral, color: "#BBBBBB" },
        { label: "부정", value: sentiment.negative, color: "#E57373" },
      ]
    : [];

  const wordUsageBars = history
    ? [
        ...history.months.map((item, index) => ({
          label: `${item.month}월`,
          value: item.avg_word_count ?? 0,
          hasData: item.has_data,
          isUser: index === 0,
        })),
        {
          label: "평균",
          value: history.average.avg_word_count ?? 0,
          hasData: history.average.avg_word_count !== null,
          isUser: false,
        },
      ]
    : [];

  const maxWordCount = Math.max(
    1,
    ...wordUsageBars.filter((d) => d.hasData).map((d) => d.value)
  );

  const complexityBars = history
    ? [
        ...history.months.map((item, index) => ({
          label: `${item.month}월`,
          value:
            item.avg_complexity_score !== null
              ? Math.round(Math.min((item.avg_complexity_score / 10) * 100, 100))
              : 0,
          hasData: item.has_data,
          isUser: index === 0,
        })),
        {
          label: "평균",
          value:
            history.average.avg_complexity_score !== null
              ? Math.round(Math.min((history.average.avg_complexity_score / 10) * 100, 100))
              : 0,
          hasData: history.average.avg_complexity_score !== null,
          isUser: false,
        },
      ]
    : [];

  const gameAccuracyText =
    gameReport?.accuracy !== null && gameReport?.accuracy !== undefined
      ? `정확도 ${gameReport.accuracy}%`
      : "아직 게임 기록 없음";
  const gameCountText =
    gameReport && gameReport.total_count > 0
      ? `성공 ${gameReport.success_count}회 / 총 ${gameReport.total_count}회`
      : "게임을 완료하면 기록이 표시돼요";
  const gameDiffText =
    gameReport?.accuracy_diff_pct !== null && gameReport?.accuracy_diff_pct !== undefined
      ? `지난달 대비 ${gameReport.accuracy_diff_pct > 0 ? "+" : ""}${gameReport.accuracy_diff_pct}%`
      : "지난달 비교 데이터 없음";

  return (
    <View className="flex-1 bg-[#F0F8FF]">
      <Header title="상세 지표" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 단어 사용률 */}
        <View
          className="bg-white rounded-[14px] p-4 gap-2.5"
          style={{ elevation: 1 }}
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-[15px] font-bold text-[#333333]">
              단어 사용률 ❓
            </Text>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-[#BBBBBB]" />
              <Text className="text-[11px] text-[#777777] mr-1">평균치</Text>
              <View className="w-2.5 h-2.5 rounded-full bg-[#5BA4A4]" />
              <Text className="text-[11px] text-[#777777] mr-1">사용자</Text>
            </View>
          </View>
          {isHistoryLoading ? (
            <View className="items-center py-3">
              <ActivityIndicator color="#5BA4A4" />
            </View>
          ) : (
            wordUsageBars.map((d) => (
              <HorizontalBar
                key={d.label}
                label={d.label}
                value={d.value}
                maxValue={maxWordCount}
                isUser={d.isUser}
                unit="개"
                hasData={d.hasData}
              />
            ))
          )}
        </View>

        {/* 언어 복잡도 */}
        <View
          className="bg-white rounded-[14px] p-4 gap-2.5"
          style={{ elevation: 1 }}
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-[15px] font-bold text-[#333333]">
              언어 복잡도 ❓
            </Text>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-[#BBBBBB]" />
              <Text className="text-[11px] text-[#777777] mr-1">평균치</Text>
              <View className="w-2.5 h-2.5 rounded-full bg-[#5BA4A4]" />
              <Text className="text-[11px] text-[#777777] mr-1">사용자</Text>
            </View>
          </View>
          {isHistoryLoading ? (
            <View className="items-center py-3">
              <ActivityIndicator color="#5BA4A4" />
            </View>
          ) : (
            complexityBars.map((d) => (
              <HorizontalBar
                key={d.label}
                label={d.label}
                value={d.value}
                maxValue={100}
                isUser={d.isUser}
                unit="점"
                hasData={d.hasData}
              />
            ))
          )}
        </View>

        {/* 손바닥 게임 */}
        <View
          className="bg-white rounded-[14px] p-4 gap-2.5"
          style={{ elevation: 1 }}
        >
          <Text className="text-[15px] font-bold text-[#333333]">
            손바닥 게임 ❓
          </Text>
          <View className="items-center py-2 gap-1.5">
            <Text className="text-[28px] font-extrabold text-[#5BA4A4]">
              {gameAccuracyText}
            </Text>
            <Text className="text-sm text-[#555555]">{gameCountText}</Text>
            <Text className="text-sm text-[#5BA4A4] font-semibold">
              {gameDiffText}
            </Text>
          </View>
        </View>

        {/* 감정 분석 */}
        <View
          className="bg-white rounded-[14px] p-4 gap-2.5"
          style={{ elevation: 1 }}
        >
          <Text className="text-[15px] font-bold text-[#333333]">
            ♡ 감정 분석 (최근 한달 기록)
          </Text>
          <View className="mt-3 gap-2.5">
            {isSentimentLoading ? (
              <View className="items-center py-3">
                <ActivityIndicator color="#5BA4A4" />
              </View>
            ) : (
              sentimentBars.map((d) => (
                <SentimentBar
                  key={d.label}
                  label={d.label}
                  value={d.value}
                  color={d.color}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

    </View>
  );
}
