import { Link } from "expo-router";
import { ScrollView, Text, View, Pressable } from "react-native";

import Header from "@/components/Header";

type Question = {
  id: number;
  q_type: string;
  content: string;
  answered: boolean;
  date: string;
};

const TODAY = "2026년 5월 29일 (수)";

const QUESTIONS: Question[] = [
  {
    id: 1,
    q_type: "memory_recall",
    content: "살면서 가장 기억에 남는 남편과의 순간은 언제였나요?",
    answered: true,
    date: "2026.05.29",
  },
  {
    id: 2,
    q_type: "emotional_expression",
    content: "가장 좋아하는 음식과 그 이유는 무엇인가요?",
    answered: false,
    date: "2026.05.29",
  },
];

export default function QuestionScreen() {
  return (
    <View className="flex-1 bg-[#F0F8FF]">

      {/*상단바*/}
      <Header title="오늘의 질문"/>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 gap-3.5"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[15px] font-semibold text-[#333333]">
          {TODAY}
        </Text>
        <Text className="text-[13px] text-[#5BA4A4] font-semibold mb-1">
          오늘의 답변 완료!
        </Text>

        {QUESTIONS.map((q) => (
          <Link
            key={q.id}
            href={{
              pathname: "/answer",
              params: {
                questionId: q.id,
                qType: q.q_type,
                questionText: q.content,
              },
            }}
            asChild
          >
            <Pressable
              className={`bg-white rounded-[14px] p-[18px] gap-2.5 border ${
                q.answered ? "border-[#B7E4C7]" : "border-[#E8E8E8]"
              }`}
              style={{ elevation: 1 }}
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-[#999999]">{q.date} (수)</Text>
                {q.answered && (
                  <View className="bg-[#B7E4C7] rounded-md px-2 py-[3px]">
                    <Text className="text-[11px] font-semibold text-[#1B5E20]">
                      답변 완료
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-[15px] text-[#222222] leading-[23px]">
                {q.content}
              </Text>
              {q.answered && (
                <Text className="text-xs text-[#5BA4A4] font-semibold">
                  답변 완료 ✓
                </Text>
              )}
            </Pressable>
          </Link>
        ))}
      </ScrollView>

    </View>
  );
}
