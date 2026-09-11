import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import Header from "@/components/Header";
import { getMonthlyAnswerReport } from "@/apis";

// 데모용 mock 데이터
const WORD_USAGE = [
  { label: "9월", value: 0.82, isUser: true },
  { label: "8월", value: 0.65, isUser: false },
  { label: "7월", value: 0.7, isUser: false },
  { label: "6월", value: 0.58, isUser: false },
  { label: "평균", value: 0.68, isUser: false },
];

const COMPLEXITY = [
  { label: "9월", value: 8.2, isUser: true },
  { label: "8월", value: 6.5, isUser: false },
  { label: "7월", value: 7.0, isUser: false },
  { label: "6월", value: 5.8, isUser: false },
  { label: "평균", value: 6.9, isUser: false },
];

function HorizontalBar({
  label,
  value,
  maxValue,
  isUser,
  unit,
}: {
  label: string;
  value: number;
  maxValue: number;
  isUser: boolean;
  unit: string;
}) {
  const pct = Math.min((value / maxValue) * 100, 100);
  return (
    <View className="flex-row items-center gap-2 my-1">
      <Text className="w-9 text-xs text-[#666666] text-right">{label}</Text>
      <View className="flex-1 h-[18px] bg-[#EEEEEE] rounded-[9px] overflow-hidden">
        <View
          className={`h-full rounded-[9px] ${isUser ? "bg-[#5BA4A4]" : "bg-[#AAAAAA]"}`}
          style={{ width: `${pct}%` as any }}
        />
      </View>
      <Text className="w-9 text-xs text-[#444444]">
        {value}
        {unit}
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
  const [isSentimentLoading, setIsSentimentLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadSentiment() {
        setIsSentimentLoading(true);
        try {
          const now = new Date();
          const report = await getMonthlyAnswerReport(
            now.getFullYear(),
            now.getMonth() + 1
          );
          if (isMounted) {
            setSentiment({
              positive: report.sentiment_summary.positive ?? 0,
              neutral: report.sentiment_summary.neutral ?? 0,
              negative: report.sentiment_summary.negative ?? 0,
            });
          }
        } catch {
          if (isMounted) {
            setSentiment(null);
          }
        } finally {
          if (isMounted) {
            setIsSentimentLoading(false);
          }
        }
      }

      loadSentiment();

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

  return (
    <View className="flex-1 bg-[#FDF2EC]">
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
          {WORD_USAGE.map((d) => (
            <HorizontalBar
              key={d.label}
              label={d.label}
              value={d.value}
              maxValue={1}
              isUser={d.isUser}
              unit=""
            />
          ))}
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
          {COMPLEXITY.map((d) => (
            <HorizontalBar
              key={d.label}
              label={d.label}
              value={d.value}
              maxValue={10}
              isUser={d.isUser}
              unit=""
            />
          ))}
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
              정확도 87%
            </Text>
            <Text className="text-sm text-[#555555]">성공 26회 / 총 30회</Text>
            <Text className="text-sm text-[#5BA4A4] font-semibold">
              ↑ 지난달 대비 +5%
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
          {isSentimentLoading ? (
            <View className="items-center py-3">
              <ActivityIndicator color="#5BA4A4" />
            </View>
          ) : (
            <View className="mt-3 gap-2.5">
              {sentimentBars.map((d) => (
                <SentimentBar
                  key={d.label}
                  label={d.label}
                  value={d.value}
                  color={d.color}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

    </View>
  );
}
