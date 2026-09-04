import { useState } from "react";
import { Image as ExpoImage } from "expo-image";
import { Link } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { getAuthSession, getCurrentUserId } from "@/apis";
import Ic_Game3 from "../../assets/Icon/Ic_Game3.png";
import IcSettings from "../../assets/Icon/Ic_Settings2.png";

const ONBOARDING_STORAGE_KEY_PREFIX = "remind_user_onboarding_seen";
const RECENT_MEMORIES = [
  {
    date: "2026.03.29",
    question: "어린시절 가장 기억에 남는 친구는 누구였나요?",
  },
  {
    date: "2026.03.29",
    question: "가장 행복했던 여행지는 어디였나요?",
  },
];

const ONBOARDING_STEPS = [
  {
    icon: "질문",
    title: "매일 한 줄 기록",
    description: "오늘의 질문에 답하며 기억을 차분히 꺼내보세요.",
  },
  {
    icon: "연속",
    title: "연속 기록 쌓기",
    description: "하루하루 기록하면 연속 기록이 쌓여요.",
  },
  {
    icon: "달력",
    title: "달력으로 한눈에",
    description: "기록한 날을 달력에서 확인하고 지난 답변을 다시 볼 수 있어요.",
  },
  {
    icon: "안내",
    title: "안내",
    description:
      "이 앱은 의료 진단이나 치료 목적이 아니며, 매일 기록하는 활동을 돕는 도구예요.",
  },
];

function getOnboardingStorageKey() {
  return `${ONBOARDING_STORAGE_KEY_PREFIX}:${getCurrentUserId()}`;
}

function hasSeenOnboarding() {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return false;
  }

  try {
    return window.localStorage.getItem(getOnboardingStorageKey()) === "true";
  } catch {
    return false;
  }
}

function markOnboardingAsSeen() {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return;
  }

  try {
    window.localStorage.setItem(getOnboardingStorageKey(), "true");
  } catch {
    // 저장에 실패해도 온보딩 닫기 동작은 유지합니다.
  }
}

export default function HomeScreen() {
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(
    () => !hasSeenOnboarding(),
  );
  const currentOnboardingStep = ONBOARDING_STEPS[onboardingStep];
  const isLastOnboardingStep = onboardingStep === ONBOARDING_STEPS.length - 1;
  const currentUserName = getAuthSession()?.user.name ?? "사용자";

  const closeOnboarding = () => {
    markOnboardingAsSeen();
    setIsOnboardingVisible(false);
  };

  const handleNextOnboarding = () => {
    if (isLastOnboardingStep) {
      closeOnboarding();
      return;
    }

    setOnboardingStep((prev) => prev + 1);
  };

  return (
    <View className="flex-1 bg-[#FDF2EC]">
      <View className="relative h-[104px] flex-row items-center justify-center px-[28px] pt-4">
        <Text className="text-[44px] font-bold text-black">Re:Mind</Text>
        <Pressable className="absolute right-[28px] top-[34px] h-[48px] w-[48px] items-center justify-center">
          <ExpoImage
            source={IcSettings}
            contentFit="contain"
            style={{ width: 42, height: 42 }}
          />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-[26px] pb-[48px]"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mt-[14px] px-[13px] text-[24px] font-medium text-[#174C33]">
          안녕하세요, {currentUserName}님
        </Text>

        <View
          className="mx-[13px] mt-[40px] overflow-hidden border-2 border-black bg-[#F9F7F4]"
          style={{
            elevation: 4,
            shadowColor: "#000000",
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
          }}
        >
          <View className="h-[72px] flex-row items-center justify-between border-b border-black px-6">
            <Text className="text-[18px] bg-[#F9EBDF] font-medium text-[#174C33]">
              오늘의 질문
            </Text>
            <View className="h-[24px] w-[102px] items-center justify-center rounded-[8px] border border-[#8C8C8C] bg-[#FDF2EC]">
              <Text className="text-[14px] font-medium text-black">
                2개 남음
              </Text>
            </View>
          </View>

          <View className="min-h-[110px] flex-row items-center justify-between px-[18px] py-5">
            <Text className="flex-1 text-[18px] leading-[34px] text-black">
              어린시절 가장 기억에 남는 친구는 누구였나요?
            </Text>
            <Link href="/question" asChild>
              <Pressable
                className="ml-2 h-[76px] w-[98px] items-center justify-center rounded-full border-2 border-black bg-[#BFCBC7]"
                style={{
                  elevation: 3,
                  shadowColor: "#000000",
                  shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                }}
              >
                <Text className="text-center text-[16px] font-medium leading-[28px] text-white">
                  답변{"\n"}작성하기
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View className="mt-[64px] flex-row gap-[30px] px-[14px]">
          <Link href="/game" asChild>
            <Pressable
              className="h-[150px] w-[142px] items-center justify-center rounded-[14px] border-2 border-black bg-[#F9F7F4]"
              style={{
                elevation: 3,
                shadowColor: "#000000",
                shadowOffset: { width: 3, height: 3 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }}
            >
              <Image source={Ic_Game3} style={{ width: 68, height: 68 }} />
              <Text className="mt-3 text-center text-[16px] font-medium leading-[28px] text-[#174C33]">
                손동작 게임{"\n"}시작
              </Text>
            </Pressable>
          </Link>

          <View className="flex-1 gap-[22px]">
            <Pressable
              disabled
              className="h-[64px] items-center justify-center rounded-[14px] border-2 border-black bg-[#F9F7F4]"
              style={{
                elevation: 3,
                shadowColor: "#000000",
                shadowOffset: { width: 3, height: 3 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }}
            >
              <Text className="text-[16px] font-medium text-[#174C33]">
                연속기록 28일
              </Text>
            </Pressable>

            <Pressable
              disabled
              className="h-[64px] items-center justify-center rounded-[14px] border-2 border-black bg-[#F9F7F4]"
              style={{
                elevation: 3,
                shadowColor: "#000000",
                shadowOffset: { width: 3, height: 3 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }}
            >
              <Text className="text-[16px] font-medium text-[#174C33]">
                언어활력도
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-[68px]">
          <View className="mb-[28px] flex-row items-center">
            <Text className="text-[22px] font-medium text-[#A1978B]">
              최근기억
            </Text>
            <View className="ml-4 h-px flex-1 bg-[#D4C9BB]" />
          </View>

          <View className="gap-[30px]">
            {RECENT_MEMORIES.map((memory) => (
              <View
                key={memory.question}
                className="min-h-[86px] justify-center rounded-[14px] bg-[#FAEDE0] px-[24px] py-[18px]"
              >
                <Text className="text-[16px] font-medium text-[#9B9B9B]">
                  {memory.date}
                </Text>
                <Text className="mt-2 text-[16px] leading-[28px] text-black">
                  {memory.question}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {isOnboardingVisible ? (
        <View className="absolute inset-0 z-10 bg-black/75 px-7 pt-[72px]">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="온보딩 건너뛰기"
            onPress={closeOnboarding}
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
