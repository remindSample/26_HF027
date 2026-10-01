import Header from "@/components/Header";
import { getMonthlyAnswerReport } from "@/apis";
import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ReportMainScreen() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const [answerCount, setAnswerCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadReport() {
        try {
          const report = await getMonthlyAnswerReport(currentYear, currentMonth);
          if (isMounted) {
            setAnswerCount(report.answer_count);
          }
        } catch {
          if (isMounted) {
            setAnswerCount(0);
          }
        }
      }

      loadReport();

      return () => {
        isMounted = false;
      };
    }, [currentMonth, currentYear])
  );

  return (
    <View className="flex-1 bg-[#F0F8FF]">
      <Header title="인지변화보고서" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 gap-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 월 리포트 요약 */}
        <View className="overflow-hidden border-2 border-black bg-[#FFF9F5]">
          <View className="flex-row items-center justify-between bg-[#FDF2EC] px-4 py-6 border-b-2 border-black">
            <View className="flex-row items-center gap-2.5">
              <Ionicons name="calendar-outline" size={28} color="#242428" />
              <Text className="text-[24px] font-medium text-[#111111]">
                {currentYear}년 {currentMonth}월 리포트
              </Text>
            </View>
            <View className="border border-[#8A8A8A] rounded-lg px-4 py-2">
              <Text className="text-[16px] font-medium text-[#111111]">
                {answerCount}개 답변
              </Text>
            </View>
          </View>

          <View className="flex-row bg-[#FFFDFB] px-4 py-10 items-center gap-6">
            <View className="w-[104px] h-[86px] bg-[#D9D9D9] rounded-lg" />
            <Text className="flex-1 text-[25px] font-medium text-[#111111] leading-[34px]">
              이번 달 답변 기록이{"\n"}리포트에 반영됐어요!
            </Text>
          </View>
        </View>

        {/* 메뉴 버튼 */}
        <Link href="/report/activity" asChild>
          <Pressable
            className="flex-row items-center justify-between bg-white rounded-[14px] px-[22px] py-[22px]"
            style={{ elevation: 1 }}
          >
            <Text className="text-xl font-bold text-[#111111]">
              활동 리포트
            </Text>
            <Text className="text-[28px] text-[#555555] font-light">›</Text>
          </Pressable>
        </Link>

        <Link href="/report/detail" asChild>
          <Pressable
            className="flex-row items-center justify-between bg-white rounded-[14px] px-[22px] py-[22px]"
            style={{ elevation: 1 }}
          >
            <Text className="text-xl font-bold text-[#111111]">상세 지표</Text>
            <Text className="text-[28px] text-[#555555] font-light">›</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </View>
  );
}
