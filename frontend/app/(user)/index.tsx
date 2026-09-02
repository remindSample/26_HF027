import { useState } from "react";
import { Link } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import Ic_Game3 from "../../assets/Icon/Ic_Game3.png";

const ONBOARDING_STEPS = [
  {
    icon: "한줄",
    title: "매일 한 줄 기록",
    description: "오늘의 질문에 답하며 기억을 짧게 남겨보세요.",
  },
  {
    icon: "연속",
    title: "연속 기록 쌓기",
    description: "하루하루 기록하면 연속 기록이 쌓여요.",
  },
  {
    icon: "달력",
    title: "달력으로 한눈에",
    description: "기록한 날을 달력에서 확인하고 지난 답변도 다시 볼 수 있어요.",
  },
  {
    icon: "안내",
    title: "안내",
    description:
      "이 앱은 의료 진단·치료 목적이 아니며, 매일 기록하는 활동을 돕는 도구예요.",
  },
];

export default function HomeScreen() {
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(true);
  const currentOnboardingStep = ONBOARDING_STEPS[onboardingStep];
  const isLastOnboardingStep = onboardingStep === ONBOARDING_STEPS.length - 1;

  const handleNextOnboarding = () => {
    if (isLastOnboardingStep) {
      setIsOnboardingVisible(false);
      return;
    }

    setOnboardingStep((prev) => prev + 1);
  };

  return (
    <View className="flex-1 bg-white">
      {/* 상단 바 */}
      <View className="flex-row items-center justify-end border-b border-[#E0E0E0] bg-white px-4 py-5">
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
              <Image source={Ic_Game3} style={{width: 70, height: 70}}/>

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

      {isOnboardingVisible ? (
        <View className="absolute inset-0 z-10 bg-black/75 px-7 pt-[72px]">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="온보딩 건너뛰기"
            onPress={() => setIsOnboardingVisible(false)}
            className="self-end px-2 py-2"
          >
            <Text className="text-[18px] font-semibold text-white">
              건너뛰기
            </Text>
          </Pressable>

          <View className="flex-1 items-center justify-center">
            <View className="mb-9 h-[88px] w-[88px] items-center justify-center rounded-[18px] bg-white">
              <Text className="text-[22px] font-bold text-[#7B18C8]">
                {currentOnboardingStep.icon}
              </Text>
            </View>

            <Text className="text-center text-[34px] font-bold leading-[44px] text-white">
              {currentOnboardingStep.title}
            </Text>

            <Text className="mt-6 max-w-[320px] text-center text-[22px] leading-[34px] text-[#D5D8DF]">
              {currentOnboardingStep.description}
            </Text>

            <View className="mt-12 flex-row items-center gap-3">
              {ONBOARDING_STEPS.map((step, index) => (
                <View
                  key={step.title}
                  className={
                    index === onboardingStep
                      ? "h-3 w-12 rounded-full bg-[#7B18C8]"
                      : "h-3 w-3 rounded-full bg-[#9CA3AF]"
                  }
                />
              ))}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isLastOnboardingStep ? "온보딩 시작하기" : "다음 온보딩 보기"
            }
            onPress={handleNextOnboarding}
            className="mb-10 h-[64px] items-center justify-center rounded-[18px] bg-[#7B18C8]"
          >
            <Text className="text-[24px] font-bold text-white">
              {isLastOnboardingStep ? "시작하기" : "다음"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
