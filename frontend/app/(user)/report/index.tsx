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
    <View className="flex-1 bg-[#FDF2EC]">
      <Header title="인지변화보고서" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-10 gap-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 월 리포트 요약 */}
        <View className="mx-4 overflow-hidden border-2 border-black bg-[#FFF9F5] " 
        style={{
            elevation: 4,
            shadowColor: "#000000",
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
          }}>
          <View className="flex-row items-center justify-between bg-[#F9EBDF] px-4 py-6 border-b-2 border-black">
            <View className="flex-row items-center gap-2.5">
              <Ionicons name="calendar-outline" size={28} color="#242428" />
              <Text className="text-[22px] font-medium text-[#174C33]">
                {currentYear}년 {currentMonth}월 리포트
              </Text>
            </View>
            <View className="border border-[#8A8A8A] bg-[#FDF2EC] rounded-lg px-2 py-1.5">
              <Text className="text-[16px] font-medium text-[#111111]">
                {answerCount}개 답변
              </Text>
            </View>
          </View>

          <View className="flex-row bg-[#FFFDFB] px-4 py-10 items-center gap-6">
            <View className="w-[104px] h-[86px] bg-[#D9D9D9] rounded-lg" />
            <Text className="flex-1 text-[22px] text-[#111111] leading-[34px]">
              이번 달 답변 기록이{"\n"}리포트에 반영됐어요!
            </Text>
          </View>
        </View>

        {/* 메뉴 버튼 */}
        <Link href="/report/activity" asChild>
          <Pressable
            className="flex-row items-center justify-between border-2 border-black bg-[#F9F7F4] rounded-[14px] px-[22px] py-[22px] mt-[50px]"
            style={{
                elevation: 3,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }}
          >
            <Text className="text-xl font-bold text-[#111111]">
              활동 리포트
            </Text>
            <Text className="text-[28px] text-[#555555] font-light">›</Text>
          </Pressable>
        </Link>

        <Link href="/report/detail" asChild>
          <Pressable
            className="flex-row items-center justify-between border-2 border-black bg-[#F9F7F4] rounded-[14px] px-[22px] py-[22px] mt-[10px]"
            style={{
                elevation: 3,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }}
          >
            <Text className="text-xl font-bold text-[#111111]">상세 지표</Text>
            <Text className="text-[28px] text-[#555555] font-light">›</Text>
          </Pressable>
        </Link>
      </ScrollView>

    </View>
  );
}
