import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image as ExpoImage } from "expo-image";
import {
  getAuthSession,
  getGuardianLinksByGuardian,
  getGuardianRecentAnswers,
  getMonthlyAnswerReport,
  getUser,
  type RecentAnswerResponse,
} from "@/apis";
import { Link, router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import IcSetting from "../../assets/Icon/Ic_Settings.svg";
import LogoReMind from "../../assets/Icon/Logo_ReMind.png";

const quickMenus = [
  {
    label: "질문 관리",
    icon: "clipboard-edit-outline",
    href: "/(guardian)/question",
    color: "#174C33",
  },
  {
    label: "기억 앨범",
    icon: "head-cog-outline",
    href: "/(guardian)/memory/list",
    color: "#174C33",
  },
  {
    label: "분석 리포트",
    icon: "chart-bar",
    href: "/(guardian)/report",
    color: "#174C33",
  },
  {
    label: "알림",
    icon: "bell-ring-outline",
    href: undefined,
    color: "#174C33",
  },
] as const;

const TODAY_ANSWER_GOAL = 2;

function QuickMenuTile({
  label,
  icon,
  href,
  color,
}: (typeof quickMenus)[number]) {
  const tile = (
    <Pressable className="h-[112px] flex-1 items-center justify-center rounded-[14px] border-2 border-[#BFCBC7] bg-[#F9F7F4]">
      <MaterialCommunityIcons name={icon} size={42} color={color} />
      <Text className="mt-2 text-center text-[22px] font-medium text-[#174C33]">
        {label}
      </Text>
    </Pressable>
  );

  if (!href) {
    return tile;
  }

  return (
    <Link href={href as Href} asChild>
      {tile}
    </Link>
  );
}

function formatAnswerTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getDaysSince(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const answerStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return Math.max(
    0,
    Math.floor((todayStart.getTime() - answerStart.getTime()) / 86400000),
  );
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function GuardianHomeScreen() {
  const [guardianName, setGuardianName] = useState("보호자");
  const [elderName, setElderName] = useState<string | null>(null);
  const [recentAnswers, setRecentAnswers] = useState<RecentAnswerResponse[]>([]);
  const [todayAnswerCount, setTodayAnswerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const latestAnswer = recentAnswers[0];
  const displayedTodayAnswerCount = Math.min(todayAnswerCount, TODAY_ANSWER_GOAL);
  const todayAnswerProgress: `${number}%` = `${(displayedTodayAnswerCount / TODAY_ANSWER_GOAL) * 100}%`;
  const daysSinceLatestAnswer = latestAnswer
    ? getDaysSince(latestAnswer.answered_at)
    : null;
  const notificationTitle = !elderName
    ? "연결된 사용자가 없습니다"
    : latestAnswer && daysSinceLatestAnswer === 0
      ? `${elderName}님이 오늘 답변했어요`
      : latestAnswer && daysSinceLatestAnswer !== null
        ? `${elderName}님이 ${daysSinceLatestAnswer}일째\n답변하지 않았어요`
        : `${elderName}님의 최근 답변이 없습니다`;
  const notificationDescription = !elderName
    ? "사용자와 연결하면 답변 공백 알림을 확인할 수 있어요."
    : latestAnswer
      ? `최근 답변일: ${formatAnswerTime(latestAnswer.answered_at)}`
      : "새 질문을 추가하거나 답변을 기다려주세요.";

  useEffect(() => {
    let isMounted = true;

    async function loadGuardianHome() {
      try {
        setIsLoading(true);
        const session = await getAuthSession();
        const guardianId = session?.user.id;

        if (!session || !guardianId) {
          return;
        }

        const links = await getGuardianLinksByGuardian(guardianId);
        const acceptedLink = links.find((link) => link.status === "accepted");
        let elderNameValue: string | null = null;
        let answers: RecentAnswerResponse[] = [];
        let todayCount = 0;

        if (acceptedLink) {
          const now = new Date();
          const [elder, recentAnswerResult, report] = await Promise.all([
            getUser(acceptedLink.elder_id),
            getGuardianRecentAnswers(acceptedLink.elder_id, 3),
            getMonthlyAnswerReport(
              now.getFullYear(),
              now.getMonth() + 1,
              acceptedLink.elder_id,
            ),
          ]);
          const todayKey = getDateKey(now);

          elderNameValue = elder.name;
          answers = recentAnswerResult;
          todayCount = report.answers.filter((answer) => {
            const answeredAt = new Date(answer.answered_at);

            return !Number.isNaN(answeredAt.getTime())
              && getDateKey(answeredAt) === todayKey;
          }).length;
        }

        if (isMounted) {
          setGuardianName(session.user.name);
          setElderName(elderNameValue);
          setRecentAnswers(answers);
          setTodayAnswerCount(todayCount);
        }
      } catch {
        if (isMounted) {
          setElderName(null);
          setRecentAnswers([]);
          setTodayAnswerCount(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadGuardianHome();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View className="flex-1 bg-[#FDF2EC]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-[30px] pb-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative -mx-[30px] mb-4 h-[104px] flex-row items-center justify-center px-[28px] pt-4">
          <ExpoImage
            source={LogoReMind}
            contentFit="contain"
            style={{ width: 150, height: 50 }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="설정"
            hitSlop={10}
            onPress={() => router.push("/(guardian)/settings")}
            className="absolute right-[12px] top-[36px] h-[48px] w-[48px] items-center justify-center"
          >
            <ExpoImage
              source={IcSetting}
              contentFit="contain"
              tintColor="#174C33"
              style={{ width: 36, height: 36 }}
            />
          </Pressable>
        </View>

        <Text
          className="mt-4 text-center text-[24px] font-bold text-[#174C33]"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          안녕하세요, {guardianName}님!
        </Text>

        <View className="mt-[52px] flex-row items-center rounded-[14px] border-2 border-[#BFCBC7] bg-[#F9F7F4] px-9 py-6">
          <View className="h-[78px] w-[78px] items-center justify-center rounded-full bg-[#174C33]">
            <MaterialCommunityIcons
              name="account-outline"
              size={62}
              color="#FFFFFF"
            />
          </View>

          <View className="ml-7 flex-1">
            <Text className="text-[31px] font-medium text-black">
              {elderName ? `${elderName} 님` : "연결된 사용자 없음"}
            </Text>
            <View className="mt-3.5 flex-row items-center">
              <View
                className={`mr-2 h-[13px] w-[13px] rounded-full ${
                  elderName ? "bg-[#64D844]" : "bg-[#BDBDBD]"
                }`}
              />
              <Text
                className={`text-[14px] font-medium ${
                  elderName ? "text-[#64D844]" : "text-[#8A8A8A]"
                }`}
              >
                {elderName ? "연결되었습니다" : "연결 대기 중"}
              </Text>
            </View>
          </View>
        </View>

        <Link href="/(guardian)/question/add_question" asChild>
          <Pressable className="mt-3 h-[64px] flex-row items-center justify-center rounded-[10px] bg-[#BFCBC7]">
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={34}
              color="#000000"
            />
            <Text className="ml-3 text-[24px] font-medium text-black">
              새로운 질문 추가하기
            </Text>
          </Pressable>
        </Link>

        <View className="mt-5 flex-row items-center rounded-[14px] border-2 border-[#BFCBC7] bg-[#F9F7F4] px-5 py-4">
          <View className="h-[52px] w-[52px] ml-3 items-center justify-center rounded-[12px] bg-[#FAEDE0]">
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={32}
              color="#174C33"
            />
          </View>
          <View className="ml-7 flex-1">
            <Text className="text-[20px] font-bold text-[#174C33]">
              {notificationTitle}
            </Text>
            <Text className="mt-1 text-[16px] font-medium text-[#5F5F5F]">
              {notificationDescription}
            </Text>
          </View>
        </View>

        <View className="mt-[52px] flex-row gap-5">
          <View className="relative flex-1 rounded-[14px] border-2 border-[#BFCBC7] bg-[#F9F7F4] px-4 pb-4 pt-[29px]">
            <View className="absolute top-[-18px] self-center rounded-[10px] bg-[#BFCBC7] px-3 py-1">
              <Text className="text-[18px] font-bold text-[#174C33]">
                캐치손바닥
              </Text>
            </View>
            <Text className="text-[20px] font-medium text-black">
              지난 게임: level 1
            </Text>
            <Text className="mt-1 text-center text-[31px] tracking-[2px] text-[#E3E3E3]">
              ★☆☆
            </Text>
          </View>

          <View className="relative flex-1 rounded-[14px] border-2 border-[#BFCBC7] bg-[#F9F7F4] px-4 pb-4 pt-[29px]">
            <View className="absolute top-[-18px] self-center rounded-[10px] bg-[#BFCBC7] px-3 py-1">
              <Text className="text-[18px] font-bold text-[#174C33]">
                오늘의 답변
              </Text>
            </View>
            <Text className="text-[20px] font-medium text-black">
              {displayedTodayAnswerCount}/{TODAY_ANSWER_GOAL}개
            </Text>
            <View className="mt-3 h-[17px] overflow-hidden rounded-full bg-[#FAEDE0]">
              <View
                className="h-full rounded-full bg-[#BFCBC7]"
                style={{ width: todayAnswerProgress }}
              />
            </View>
          </View>
        </View>

        <View className="mt-5 flex-row gap-5">
          {quickMenus.slice(0, 2).map((menu) => (
            <QuickMenuTile key={menu.label} {...menu} />
          ))}
        </View>

        <View className="mt-4 flex-row gap-5">
          {quickMenus.slice(2).map((menu) => (
            <QuickMenuTile key={menu.label} {...menu} />
          ))}
        </View>

        <View className="mt-6 overflow-hidden rounded-t-[10px] border-2 border-[#BFCBC7] bg-[#F9F7F4]">
          <View className="h-[78px] flex-row items-center justify-between border-b border-[#BFCBC7] bg-[#F9EBDF] px-7">
            <Text className="text-[22px] font-medium text-[#174C33]">
              최근 활동 기록
            </Text>
            <MaterialCommunityIcons
              name="history"
              size={32}
              color="#174C33"
            />
          </View>

          {isLoading ? (
            <View className="h-[104px] items-center justify-center bg-[#F9F7F4] px-7">
              <ActivityIndicator color="#174C33" />
            </View>
          ) : recentAnswers.length === 0 ? (
            <View className="h-[104px] justify-center bg-[#F9F7F4] px-7">
              <Text className="text-[22px] font-medium text-[#111827]">
                최근 답변 기록이 없습니다.
              </Text>
              <Text className="mt-1 text-[20px] font-medium text-[#5F5F5F]">
                사용자 연결 후 답변을 확인할 수 있습니다.
              </Text>
            </View>
          ) : (
            recentAnswers.map((answer) => (
              <View key={answer.id} className="min-h-[104px] flex-row items-center border-b border-[#BFCBC7] bg-[#F9F7F4] px-7 py-4">
                <View className="h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#FAEDE0]">
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={31}
                    color="#174C33"
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-[18px] font-medium text-[#111827]">
                    {answer.question_content}
                  </Text>
                  <Text className="pt-[4px] text-[15px] font-medium text-[#5F5F5F]">
                    {formatAnswerTime(answer.answered_at)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {!elderName && (
        <View className="-mx-[30px] bg-[#BFCBC7] px-7 pb-5 pt-4">
          <Text className="text-center text-[22px] font-bold text-[#174C33]">
            사용자와 계정연결을 진행해주세요 !
          </Text>
          <Text className="mt-2 text-center text-[20px] font-bold text-[#174C33]">
            연결 진행하기
          </Text>
        </View>
        )}
      </ScrollView>
    </View>
  );
}
