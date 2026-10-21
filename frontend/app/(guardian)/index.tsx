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
    <Pressable
      className="h-[112px] flex-1 items-center justify-center rounded-[14px] border-2 border-black bg-[#F9F7F4]"
      style={{
        elevation: 3,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
      }}
    >
      <MaterialCommunityIcons name={icon} size={32} color={color} />
      <Text className="mt-2 text-center text-[16px] font-medium text-[#174C33]">
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
          className="mt-4 px-[13px] text-[24px] font-medium text-[#174C33]"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          안녕하세요, {guardianName} 보호자님
        </Text>

        <View
          className="mt-[52px] overflow-hidden border-2 border-black bg-[#F9F7F4]"
          style={{
            elevation: 4,
            shadowColor: "#000000",
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
          }}
        >
          <View className="border-b-2 border-black bg-[#F9EBDF] px-6 py-3">
            <Text className="text-[16px] font-medium text-[#174C33]">
              연결된 사용자
            </Text>
          </View>

          <View className="flex-row items-center px-7 py-[18px]">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#174C33]">
              <MaterialCommunityIcons
                name="account-outline"
                size={48}
                color="#FFFFFF"
              />
            </View>

            <View className="ml-7 flex-1">
              <Text className="text-[22px] font-medium text-black">
                {elderName ? `${elderName} 님` : "연결된 사용자 없음"}
              </Text>
              <View className="mt-2 flex-row items-center">
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
            <Pressable
              className="mx-[18px] mb-[18px] h-[54px] flex-row items-center justify-center rounded-full border-2 border-black bg-[#BFCBC7]"
              style={{
                elevation: 3,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }}
            >
              <MaterialCommunityIcons
                name="plus-circle-outline"
                size={24}
                color="#FFFFFF"
              />
              <Text className="ml-2 text-[16px] font-medium text-white">
                새로운 질문 추가하기
              </Text>
            </Pressable>
          </Link>
        </View>

        <View
          className="mt-5 flex-row items-center rounded-[14px] border-2 border-black bg-[#F9F7F4] px-5 py-4"
          style={{
            elevation: 3,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
          }}
        >
          <View className="h-[52px] w-[52px] ml-3 items-center justify-center rounded-[12px] bg-[#FAEDE0]">
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={30}
              color="#174C33"
            />
          </View>
          <View className="ml-7 flex-1">
            <Text className="text-[16px] font-medium text-[#174C33]">
              {notificationTitle}
            </Text>
            <Text className="mt-1 text-[14px] font-medium text-[#5F5F5F]">
              {notificationDescription}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row gap-5">
          <View
            className="flex-1 gap-1.5 rounded-[14px] border-2 border-black bg-[#F9F7F4] px-3.5 py-3"
            style={{
              elevation: 3,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
            }}
          >
            <View className="self-start rounded-[8px] border border-[#8C8C8C] bg-[#FDF2EC] px-2.5 py-0.5">
              <Text className="text-[13px] font-medium text-black">
                손동작 게임
              </Text>
            </View>
            <Text className="text-[16px] font-medium text-black" numberOfLines={1}>
              지난 게임 Lv. 1
            </Text>
            <Text className="text-[20px] tracking-[2px]">
              <Text className="text-[#174C33]">★</Text>
              <Text className="text-[#CFCFCF]">☆☆</Text>
            </Text>
          </View>

          <View
            className="flex-1 gap-1.5 rounded-[14px] border-2 border-black bg-[#F9F7F4] px-3.5 py-3"
            style={{
              elevation: 3,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
            }}
          >
            <View className="self-start rounded-[8px] border border-[#8C8C8C] bg-[#FDF2EC] px-2.5 py-0.5">
              <Text className="text-[13px] font-medium text-black">
                오늘의 답변
              </Text>
            </View>
            <Text className="text-[20px] font-medium text-black">
              {displayedTodayAnswerCount}
              <Text className="text-[14px] text-[#5F5F5F]">/{TODAY_ANSWER_GOAL}개</Text>
            </Text>
            <View className="h-[10px] overflow-hidden rounded-full bg-[#FAEDE0]">
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

        <View className="mt-[68px]">
          <View className="mb-[28px] flex-row items-center">
            <Text className="text-[22px] font-medium text-[#A1978B]">
              최근 활동 기록
            </Text>
            <View className="ml-4 h-px flex-1 bg-[#D4C9BB]" />
          </View>

          <View className="gap-4">
            {isLoading ? (
              <View className="items-center justify-center rounded-[14px] bg-[#FAEDE0] px-[18px] py-4">
                <ActivityIndicator color="#174C33" />
              </View>
            ) : recentAnswers.length === 0 ? (
              <View className="rounded-[14px] bg-[#FAEDE0] px-[18px] py-4">
                <Text className="text-[16px] font-medium text-black">
                  최근 답변 기록이 없습니다.
                </Text>
                <Text className="mt-1 text-[13px] text-[#9B9B9B]">
                  사용자 연결 후 답변을 확인할 수 있습니다.
                </Text>
              </View>
            ) : (
              recentAnswers.map((answer) => (
                <View key={answer.id} className="flex-row items-center gap-4 rounded-[14px] bg-[#FAEDE0] px-[18px] py-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E6F1EA]">
                    <MaterialCommunityIcons
                      name="check-circle-outline"
                      size={26}
                      color="#7FB69A"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[16px] leading-6 text-black">
                      {answer.question_content}
                    </Text>
                    <View className="mt-1 flex-row items-center gap-1">
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={13}
                        color="#9B9B9B"
                      />
                      <Text className="text-[13px] text-[#9B9B9B]">
                        {formatAnswerTime(answer.answered_at)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {!elderName && (
        <View className="-mx-[30px] bg-[#BFCBC7] px-7 pb-5 pt-4">
          <Text className="text-center text-[22px] font-medium text-[#174C33]">
            사용자와 계정연결을 진행해주세요 !
          </Text>
          <Text className="mt-2 text-center text-[20px] font-medium text-[#174C33]">
            연결 진행하기
          </Text>
        </View>
        )}
      </ScrollView>
    </View>
  );
}
