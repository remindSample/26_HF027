import { Link } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import Ic_Game from "../../assets/Icon/Ic_Game.png";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white">
      {/* 상단 바 */}
      <View className="h-34 flex-row items-center justify-end border-b border-[#E0E0E0] bg-white px-4 pt-12 pb-5">
        <Pressable className="w-10 items-center">
          <Text className="text-2xl text-[#d2d2d2]">설정</Text>
        </Pressable>
      </View>

      {/* 스크롤 되는 본문 */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-12 pt-[40px] pb-[40px]"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[30px] font-medium text-[#111111] mb-[40px]">
          안녕하세요, 홍길동 님
        </Text>

        <View className="w-full border-2 border-[#9CC7CA] bg-[#E9F6F6] rounded-[14px] px-7 pt-[22px] pb-7 mb-[42px]">
          <View className="flex-row items-center justify-between mb-[34px]">
            <Text className="text-[17px] font-bold text-[#111111]">
              오늘의 질문
            </Text>
            <View className="w-[106px] h-6 rounded-md bg-[#DDDDDD] items-center justify-center">
              <Text className="text-xs font-medium text-[#333333]">
                2개 남음
              </Text>
            </View>
          </View>

          <Text className="text-base leading-6 text-[#111111] mb-7">
            어린 시절 가장 기억에 남는 친구는{"\n"}
            누구였나요?
          </Text>

          <Link href="/question" asChild>
            <Pressable className="h-9 border border-[#9CC7CA] rounded-lg bg-[#D8EDEE] items-center justify-center">
              <Text className="text-base font-medium text-[#111111]">
                답변 작성하기
              </Text>
            </Pressable>
          </Link>
        </View>

        <View className="flex-row gap-[18px]">
          <Link href="/game" asChild>
            <Pressable className="w-[136px] h-[182px] border-2 border-[#9CC7CA] bg-[#E9F6F6] rounded-[14px] items-center justify-center">
              <Image source={Ic_Game} />

              <Text className="text-[17px] leading-6 font-medium text-[#111111] text-center">
                손동작 게임{"\n"}시작
              </Text>
            </Pressable>
          </Link>

          <View className="flex-1 gap-3.5">
            <Pressable
              disabled
              className="w-full h-[84px] border-2 border-[#D4D4D4] bg-white rounded-[14px] items-center justify-center"
            >
              <Text className="text-[17px] font-medium text-[#C9C9C9]">
                연속기록 28일
              </Text>
            </Pressable>

            <Pressable
              disabled
              className="w-full h-[84px] border-2 border-[#D4D4D4] bg-white rounded-[14px] items-center justify-center"
            >
              <Text className="text-[17px] font-medium text-[#C9C9C9]">
                언어활력도
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
