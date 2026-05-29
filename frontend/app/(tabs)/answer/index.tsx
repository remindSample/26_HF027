import Header from "@/components/Header";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function AnswerMethodScreen() {
  const { questionId, qType, questionText } = useLocalSearchParams<{
    questionId: string;
    qType: string;
    questionText: string;
  }>();

  const goTo = (method: string) => {
    router.push({
      pathname: `/answer/${method}`,
      params: { questionId, qType, questionText },
    });
  };

  return (
    <View className="flex-1 bg-[#F0F8FF]">

      <Header title="보호자가 남긴 질문"/>

      <View className="flex-1 p-5 gap-6">
        <View
          className="bg-white rounded-[14px] p-5 gap-2.5"
          style={{ elevation: 1 }}
        >
          <Text className="text-[13px] text-[#5BA4A4] font-semibold">
            오늘의 질문
          </Text>
          <Text className="text-base text-[#222222] leading-[25px] font-medium">
            {questionText}
          </Text>
          <Text className="text-[13px] text-[#999999]">
            나는 네 사용을 즐겨야해요.
          </Text>
        </View>

        <View className="gap-3.5">
          <Pressable
            className="flex-row items-center gap-4 bg-white rounded-[14px] px-[22px] py-5"
            style={{ elevation: 1 }}
            onPress={() => goTo("camera")}
          >
            <Text className="text-[26px]">📷</Text>
            <Text className="text-[17px] font-semibold text-[#333333]">
              카메라 촬영
            </Text>
          </Pressable>

          <Pressable
            className="flex-row items-center gap-4 bg-white rounded-[14px] px-[22px] py-5"
            style={{ elevation: 1 }}
            onPress={() => goTo("gallery")}
          >
            <Text className="text-[26px]">🖼</Text>
            <Text className="text-[17px] font-semibold text-[#333333]">
              갤러리에서 가져오기
            </Text>
          </Pressable>

          <Pressable
            className="flex-row items-center gap-4 bg-white rounded-[14px] px-[22px] py-5"
            style={{ elevation: 1 }}
            onPress={() => goTo("write")}
          >
            <Text className="text-[26px]">⌨️</Text>
            <Text className="text-[17px] font-semibold text-[#333333]">
              키보드로 직접 입력
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
