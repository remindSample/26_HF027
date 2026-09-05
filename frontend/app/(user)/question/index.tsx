import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import Header from "@/components/Header";
import {
  generateQuestion,
  getMonthlyAnswerReport,
  getQuestionsByUser,
  type QuestionResponse,
  type QuestionTag,
} from "@/apis";

type Question = {
  id: number;
  q_type: string;
  content: string;
  answered: boolean;
  date: string;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatToday(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
}

function formatQuestionDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day} (${WEEKDAYS[date.getDay()]})`;
}

function getFallbackQuestions(date = new Date()): Question[] {
  const questionDate = formatQuestionDate(date);

  return [
    {
      id: 1,
      q_type: "memory_recall",
      content: "살면서 가장 기억에 남는 남편과의 순간은 언제였나요?",
      answered: true,
      date: questionDate,
    },
    {
      id: 2,
      q_type: "emotional_expression",
      content: "가장 좋아하는 음식과 그 이유는 무엇인가요?",
      answered: false,
      date: questionDate,
    },
  ];
}

const QUESTION_TAGS: { label: string; value: QuestionTag }[] = [
  { label: "가족", value: "family" },
  { label: "음식", value: "food" },
  { label: "여행", value: "travel" },
  { label: "계절", value: "season" },
  { label: "취미", value: "hobby" },
];

function toQuestion(question: QuestionResponse): Question {
  const createdAt = new Date(question.created_at);
  const date = Number.isNaN(createdAt.getTime()) ? "" : formatQuestionDate(createdAt);

  return {
    id: question.id,
    q_type: question.q_type ?? "memory_recall",
    content: question.content,
    answered: false,
    date,
  };
}

export default function QuestionScreen() {
  const [questions, setQuestions] = useState<Question[]>(() => getFallbackQuestions());
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<number>>(
    new Set()
  );
  const [today, setToday] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<QuestionTag | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setToday(new Date());
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      try {
        const now = new Date();
        const [questionData, reportData] = await Promise.all([
          getQuestionsByUser(),
          getMonthlyAnswerReport(now.getFullYear(), now.getMonth() + 1),
        ]);
        if (!isMounted) return;

        setQuestions(
          questionData.length > 0 ? questionData.map(toQuestion) : getFallbackQuestions()
        );
        setAnsweredQuestionIds(
          new Set(reportData.answers.map((answer) => answer.question_id))
        );
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) return;

        setQuestions(getFallbackQuestions());
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

  const handleGenerateQuestion = async (tag: QuestionTag) => {
    if (isGenerating) {
      return;
    }

    setSelectedTag(tag);
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const question = await generateQuestion(tag);
      setQuestions((prev) => [toQuestion(question), ...prev]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "질문 생성에 실패했습니다."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FDF2EC]">

      {/*상단바*/}
      <Header title="오늘의 질문"/>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 gap-3.5"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[20px] font-semibold text-[#333333]">
          {formatToday(today)}
        </Text>
        <Text className="text-[15px] text-[#174C33] font-semibold mb-1">
          해시태그를 누르면 오늘의 질문이 생성돼요.
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {QUESTION_TAGS.map((tag) => {
            const isSelected = selectedTag === tag.value;

            return (
              <Pressable
                key={tag.value}
                onPress={() => handleGenerateQuestion(tag.value)}
                disabled={isGenerating}
                className={`rounded-full border px-4 py-2 ${
                  isSelected
                    ? "border-[#5BA4A4] bg-[#D8EDEE]"
                    : "border-[#D9EAEA] bg-white"
                }`}
              >
                <Text className="text-[13px] font-semibold text-[#333333]">
                  #{tag.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isGenerating && (
          <View className="bg-white rounded-[14px] p-5 items-center">
            <ActivityIndicator color="#5BA4A4" />
            <Text className="mt-2 text-[13px] text-[#777777]">
              OpenAI가 질문을 만들고 있어요.
            </Text>
          </View>
        )}

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
                answeredQuestionIds.has(q.id) || q.answered
                  ? "border-[#B7E4C7]"
                  : "border-[#E8E8E8]"
              }`}
              style={{ elevation: 1 }}
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-[#999999]">{q.date}</Text>
                {(answeredQuestionIds.has(q.id) || q.answered) && (
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
              {(answeredQuestionIds.has(q.id) || q.answered) && (
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
