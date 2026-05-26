import Header from "@/components/Header";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

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
const COMPLETED_DATES = [1, 2, 3, 5, 7, 8, 10, 11];

export default function ActivityReportScreen() {
  return (
    <View className="flex-1 bg-[#F0F8FF]">
      <Header title="건강 리포트" />

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
              5월 리포트 요약
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
              ‹ 2026.05 ›
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
            {/* 5월 1일 = 목요일, offset 4 */}
            {Array.from({ length: 4 }).map((_, i) => (
              <View
                key={`empty-${i}`}
                className="w-[14.28%] items-center mb-1.5 h-9"
              />
            ))}
            {Array.from({ length: 11 }).map((_, i) => {
              const day = i + 1;
              const done = COMPLETED_DATES.includes(day);
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
            산책을 자주 하 시고, 가족과의 추억을 떠올리셔요.
          </Text>
        </View>
      </ScrollView>

    </View>
  );
}
