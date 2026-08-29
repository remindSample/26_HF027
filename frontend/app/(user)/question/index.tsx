import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import Header from "@/components/Header";
import { getQuestionsByUser, type QuestionResponse } from "@/apis";

type Question = {
  id: number;
  q_type: string;
  content: string;
  answered: boolean;
  date: string;
};

const TODAY = "2026년 5월 29일 (수)";

const FALLBACK_QUESTIONS: Question[] = [
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

function toQuestion(question: QuestionResponse): Question {
  const createdAt = new Date(question.created_at);
  const date = Number.isNaN(createdAt.getTime())
    ? ""
    : createdAt.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

  return {
    id: question.id,
    q_type: question.q_type ?? "memory_recall",
    content: question.content,
    answered: false,
    date,
  };
}

export default function QuestionScreen() {
  const [questions, setQuestions] = useState<Question[]>(FALLBACK_QUESTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      try {
        const data = await getQuestionsByUser();
        if (!isMounted) return;

        setQuestions(data.length > 0 ? data.map(toQuestion) : FALLBACK_QUESTIONS);
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) return;

        setQuestions(FALLBACK_QUESTIONS);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "질문을 불러오지 못했습니다."
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadQuestions();

    return () => {
      isMounted = false;
    };
  }, []);

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

        {isLoading && (
          <View className="bg-white rounded-[14px] p-5 items-center">
            <ActivityIndicator color="#5BA4A4" />
          </View>
        )}

        {errorMessage && (
          <View className="bg-white rounded-[14px] p-4">
            <Text className="text-[13px] text-[#999999] leading-[20px]">
              서버 질문을 불러오지 못해 데모 질문을 표시합니다.
            </Text>
          </View>
        )}

        {questions.map((q) => (
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
