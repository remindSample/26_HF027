import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

const CURRENT_MONTH = "2025년 5월";

export default function ReportMainScreen() {
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
                {CURRENT_MONTH} 리포트
              </Text>
            </View>
            <View className="border border-[#8A8A8A] rounded-lg px-4 py-2">
              <Text className="text-[16px] font-medium text-[#111111]">
                2/2 완료
              </Text>
            </View>
          </View>

          <View className="flex-row bg-[#FFFDFB] px-4 py-10 items-center gap-6">
            <View className="w-[104px] h-[86px] bg-[#D9D9D9] rounded-lg" />
            <Text className="flex-1 text-[25px] font-medium text-[#111111] leading-[34px]">
              최근 답변 참여가{"\n"}안정적이에요!
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
