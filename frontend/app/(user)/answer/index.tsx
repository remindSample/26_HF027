import Header from "@/components/Header";
import { type Href, router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
 
export default function AnswerMethodScreen() {
  const { questionId, qType, questionText } = useLocalSearchParams<{
    questionId: string;
    qType: string;
    questionText: string;
  }>();

  const goTo = (method: "camera" | "gallery" | "write") => {
    router.push({
      pathname: `/answer/${method}`,
      params: { questionId, qType, questionText },
    } as Href);
  };

  return (
    <View className="flex-1 bg-[#FDF2EC]">

      <Header title="보호자가 남긴 질문"/>

      <View className="flex-1 p-5 gap-6">
        <View
          className="mt-7 bg-[#FFFBF7] p-5 gap-2.5 border-2 border-black"
          style={{
                elevation: 3,
                shadowColor: "#000000",
                shadowOffset: { width: 3, height: 3 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }}
        >
          <Text className="text-[16px] text-[#5BA4A4] font-semibold">
            오늘의 질문
          </Text>
          <Text className="text-[20px] text-[#222222] leading-[25px] font-medium">
            {questionText}
          </Text>
          <Text className="text-[13px] text-[#999999]">
            가볍게 답변해보세요.
          </Text>
        </View>

        <View className="gap-5">
          <Pressable
            className="mt-10 flex-row items-center gap-4 bg-[#FFFBF7] rounded-[14px] px-[22px] py-5 border-2 border-black"
            style={{
                elevation: 3,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }}
            onPress={() => goTo("camera")}
          >
            <Text className="text-[26px]">📷</Text>
            <Text className="text-[17px] font-semibold text-[#333333]">
              카메라 촬영
            </Text>
          </Pressable>

          <Pressable
            className="flex-row items-center gap-4 bg-[#FFFBF7] rounded-[14px] px-[22px] py-5 border-2 border-black"
            style={{
                elevation: 3,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }}
            onPress={() => goTo("gallery")}
          >
            <Text className="text-[26px]">🖼</Text>
            <Text className="text-[17px] font-semibold text-[#333333]">
              갤러리에서 가져오기
            </Text>
          </Pressable>

          <Pressable
            className="flex-row items-center gap-4 bg-[#FFFBF7] rounded-[14px] px-[22px] py-5 border-2 border-black"
            style={{
                elevation: 3,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }}
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
