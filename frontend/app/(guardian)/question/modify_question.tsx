import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import Header from "../components/Header";

type Question = {
  id: number;
  content: string;
};

const mockServerQuestions: Question[] = [
  { id: 1, content: "어릴 때 가장 좋아했던 음식은 무엇이었나요?" },
  { id: 2, content: "살면서 한 번쯤 가보고 싶은 여행지가 있다면 어디인가요? 여행지에서 어떤 경험을 하고 싶나요?" },
  { id: 3, content: "좋아하는 음식은 무엇인가요? 그 음식을 좋아하게 된 이유나 추억이 있나요?" },
  { id: 4, content: "최근 일주일 동안 가장 행복했던 순간은 언제인가요?" },
];

export default function GuardianQuestionModifyScreen() {
  const [questions, setQuestions] = useState<Question[]>(mockServerQuestions);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(guardian)/question");
  };

  const removeQuestion = (questionId: number) => {
    setQuestions((currentQuestions) =>
      currentQuestions.filter((question) => question.id !== questionId),
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-[12px] py-5">
        <Header
          title="질문 수정"
          showSettingButton={true}
          onBack={handleBack}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-[22px] pb-10 pt-[64px]"
        showsVerticalScrollIndicator={false}
      >
        {questions.length > 0 ? (
          <View className="gap-[40px]">
            {questions.map((question) => (
              <Pressable
                key={question.id}
                accessibilityRole="button"
                className="relative h-[145px] justify-center rounded-[10px] border-[3px] border-[#939393] bg-[#E9E9E9] pl-[23px] pr-[45px]"
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="질문 삭제"
                  hitSlop={10}
                  onPress={() => removeQuestion(question.id)}
                  className="absolute right-[12px] top-[12px] z-10"
                >
                  <Feather name="x-circle" size={25} color="#242424" />
                </Pressable>

                <Text className="text-[24px] font-medium leading-[28px] text-black">
                  {question.content}
                </Text>

                <Feather
                  name="chevron-right"
                  size={36}
                  color="#242424"
                  style={{ position: "absolute", right: 6, bottom: 10 }}
                />
              </Pressable>
            ))}
          </View>
        ) : (
          <Text className="text-center text-[24px] font-medium text-[#616161]">
            등록된 질문이 없습니다.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
