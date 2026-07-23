import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link, type Href } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import Header from "./components/Header";

const quickMenus = [
  {
    label: "질문 관리",
    icon: "clipboard-edit-outline",
    href: "/(guardian)/question",
    color: "#000000",
  },
  {
    label: "기억 앨범",
    icon: "head-cog-outline",
    href: "/(guardian)/memory/list",
    color: "#000000",
  },
  {
    label: "분석 리포트",
    icon: "chart-bar",
    href: "/(guardian)/report",
    color: "#000000",
  },
  {
    label: "알림",
    icon: "bell-ring-outline",
    href: undefined,
    color: "#FFD800",
  },
] as const;

function QuickMenuTile({
  label,
  icon,
  href,
  color,
}: (typeof quickMenus)[number]) {
  const tile = (
    <Pressable className="h-[112px] flex-1 items-center justify-center rounded-[14px] bg-[#D9D9D9]">
      <MaterialCommunityIcons name={icon} size={42} color={color} />
      <Text className="mt-2 text-center text-[22px] font-medium text-black">
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

export default function GuardianHomeScreen() {
  return (
    <View className="flex-1 bg-white">
      <View className="px-[12px] py-5">
        <Header title="" showBackButton={false} showSettingButton={true} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-[30px] pt-4 pb-4"
        showsVerticalScrollIndicator={false}
      >

        <Text
          className="text-center text-[48px] font-extrabold text-[#6F6F6F]"
          style={{
            textShadowColor: "#B8B8B8",
            textShadowOffset: { width: 0, height: 5 },
            textShadowRadius: 6,
          }}
        >
          Re:Mind
        </Text>

        <Text className="mt-4 text-center text-[28px] font-bold text-[#5D5D5D]">
          안녕하세요, 홍길동 님!
        </Text>

        <View className="mt-[52px] flex-row items-center rounded-[14px] border-[3px] border-[#D6D6D6] px-9 py-6">
          <View className="h-[78px] w-[78px] items-center justify-center rounded-full bg-[#5F5F5F]">
            <MaterialCommunityIcons
              name="account-outline"
              size={62}
              color="#FFFFFF"
            />
          </View>

          <View className="ml-7 flex-1">
            <Text className="text-[31px] font-medium text-black">홍길동 님</Text>
            <View className="mt-1 flex-row items-center">
              <View className="mr-2 h-[13px] w-[13px] rounded-full bg-[#00F000]" />
              <Text className="text-[20px] font-medium text-[#00F000]">
                연결되었습니다
              </Text>
            </View>
          </View>
        </View>

        <Link href="/(guardian)/question/add_question" asChild>
          <Pressable className="mt-3 h-[64px] flex-row items-center justify-center rounded-[10px] bg-[#D9D9D9]">
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

        <View className="mt-[52px] flex-row gap-5">
          <View className="relative flex-1 rounded-[14px] border-[3px] border-[#D9D9D9] px-4 pb-4 pt-[29px]">
            <View className="absolute top-[-18px] self-center rounded-[10px] bg-[#D9D9D9] px-3 py-1">
              <Text className="text-[18px] font-bold text-[#595959]">
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

          <View className="relative flex-1 rounded-[14px] border-[3px] border-[#D9D9D9] px-4 pb-4 pt-[29px]">
            <View className="absolute top-[-18px] self-center rounded-[10px] bg-[#D9D9D9] px-3 py-1">
              <Text className="text-[18px] font-bold text-[#595959]">
                오늘의 답변
              </Text>
            </View>
            <Text className="text-[20px] font-medium text-black">1/2개</Text>
            <View className="mt-3 h-[17px] overflow-hidden rounded-full bg-[#E1E1E1]">
              <View className="h-full w-1/2 rounded-l-full bg-[#666666]" />
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

        <View className="-mx-[30px] mt-6 overflow-hidden rounded-t-[10px] border border-[#C7CDDD]">
          <View className="h-[78px] flex-row items-center justify-between border-b border-[#C7CDDD] bg-[#FAFAFF] px-7">
            <Text className="text-[22px] font-medium text-[#1F2937]">
              최근 활동 기록
            </Text>
            <MaterialCommunityIcons
              name="history"
              size={32}
              color="#6F7682"
            />
          </View>

          <View className="h-[104px] flex-row items-center bg-white px-7">
            <View className="h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#EAF4FC]">
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={31}
                color="#005EA8"
              />
            </View>
            <View className="ml-4">
              <Text className="text-[22px] font-medium text-[#111827]">
                오전 퀴즈를 완료했습니다.
              </Text>
              <Text className="text-[20px] font-medium text-[#6B7280]">
                10:30 AM
              </Text>
            </View>
          </View>
        </View>

        <View className="-mx-[30px] bg-[#D7E7F3] px-7 pb-5 pt-4">
          <Text className="text-center text-[22px] font-bold text-white">
            사용자와 계정연결을 진행해주세요 !
          </Text>
          <Text className="mt-2 text-center text-[20px] font-bold text-white">
            연결 진행하기
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
