import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link, type Href } from "expo-router";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import IcCpu from "@/assets/Icon/Ic_Cpu.svg";
import Header from "../components/Header";

type ShortcutTileProps = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconSource?: ImageSourcePropType;
  href?: Href;
  label: string;
  wide?: boolean;
};

const questionText =
  "살아오면서 가장 기억에 남는\n행복했던 시간은 언제였나요?";

function ShortcutTile({
  icon,
  iconSource,
  href,
  label,
  wide = false,
}: ShortcutTileProps) {
  const tileHref =
    href ??
    (icon === "format-list-bulleted"
      ? "/(guardian)/question/modify_question"
      : undefined);

  const tile = (
    <Pressable
      className={`items-center justify-center rounded-[8px] border-[3px] border-[#939393] bg-white ${
        wide ? "h-[120px] w-full" : "h-[120px] flex-1"
      }`}
    >
      {iconSource ? (
        <Image source={iconSource} className="h-12 w-12" resizeMode="contain" />
      ) : icon ? (
        <MaterialCommunityIcons name={icon} size={48} color="#242428" />
      ) : null}
      <Text className="mt-4 text-center text-[20px] font-medium text-black">
        {label}
      </Text>
    </Pressable>
  );

  if (!tileHref) return tile;

  return (
    <Link href={tileHref} asChild>
      {tile}
    </Link>
  );
}

export default function GuardianQuestionScreen() {
  return (
    <View className="flex-1 bg-white">
      <View className="px-[12px] pt-5">
        <Header title="오늘의 질문" showSettingButton={true} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10 pt-[40px]"
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-[10px] border-[3px] border-[#939393] px-[28px] pb-8 pt-4">
          <View className="flex-row items-center gap-7">
            <Text className="text-[20px] font-bold text-black">
              오늘 보낸 질문
            </Text>

            <View className="rounded-[9px] bg-[#D9D9D9] px-4 py-1.5">
              <Text className="text-[12px] font-medium text-black">
                답변 완료
              </Text>
            </View>
          </View>

          <Text className="mt-6 text-[20px] leading-[38px] text-black">
            {questionText}
          </Text>
        </View>

        <Text className="mt-[50px] text-[32px] font-bold text-black">
          관리 바로가기
        </Text>

        <View className="mt-6 flex-row gap-6">
          <ShortcutTile
            href="/(guardian)/question/add_question"
            icon="file-plus-outline"
            label="질문 추가"
          />
          <ShortcutTile icon="format-list-bulleted" label="질문 수정/목록" />
        </View>

        <View className="mt-8">
          <ShortcutTile
            href="/(guardian)/question/ai_question"
            iconSource={IcCpu}
            label="AI 질문 설정"
            wide
          />
        </View>
      </ScrollView>
    </View>
  );
}
