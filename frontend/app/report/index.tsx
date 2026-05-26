import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

const CURRENT_MONTH = "2025년 5월";

export default function ReportMainScreen() {
  return (
    <View className="flex-1 bg-[#F0F8FF]">
      <View className="h-14 flex-row items-center justify-between px-5 bg-white border-b border-[#E0E0E0]">
        <Text className="text-lg font-bold text-[#111111]">인지변화보고서</Text>
        <Text className="text-xl text-[#5BA4A4]">✓</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 gap-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 월 선택 */}
        <View
          className="flex-row items-center bg-white rounded-xl p-3.5 gap-2.5"
          style={{ elevation: 1 }}
        >
          <Text className="text-lg">📅</Text>
          <Text className="text-base font-semibold text-[#333333]">
            {CURRENT_MONTH} 리포트
          </Text>
        </View>

        {/* 코멘트 카드 */}
        <View
          className="flex-row bg-white rounded-xl p-4 items-center gap-3.5"
          style={{ elevation: 1 }}
        >
          <View className="w-16 h-16 bg-[#D9D9D9] rounded-lg" />
          <View className="flex-1 gap-2">
            <Text className="text-[15px] font-medium text-[#222222] leading-[22px]">
              최근 답변 참여가{"\n"}안정적이에요!
            </Text>
            <View className="self-start bg-[#B7E4C7] rounded-md px-2.5 py-[3px]">
              <Text className="text-xs font-semibold text-[#1B5E20]">
                2/2 완료
              </Text>
            </View>
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

      <View className="h-[70px] flex-row justify-around items-center bg-white border-t border-[#E0E0E0]">
        <Text className="text-[15px] font-bold text-[#5BA4A4]">리포트</Text>
        <Link href="/" asChild>
          <Pressable>
            <Text className="text-[15px] font-medium text-[#AAAAAA]">홈</Text>
          </Pressable>
        </Link>
        <Text className="text-[15px] font-medium text-[#AAAAAA]">앨범</Text>
      </View>
    </View>
  );
}
