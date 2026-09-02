import Header from "@/components/Header";
import { getMonthlyAnswerReport, submitAnswer as submitAnswerToApi } from "@/apis";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function WriteAnswerScreen() {
  const { questionId, questionText } = useLocalSearchParams<{
    questionId?: string;
    questionText?: string;
  }>();
  const [draft, setDraft] = useState("");
  const [answerText, setAnswerText] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getAnswerStreak = (answeredDates: Date[]) => {
    const dateKeys = new Set(answeredDates.map(toDateKey));
    const currentDate = new Date();
    let streak = 0;

    while (dateKeys.has(toDateKey(currentDate))) {
      streak += 1;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const submitAnswer = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const parsedQuestionId = Number(questionId);
    if (!Number.isFinite(parsedQuestionId)) {
      Alert.alert("알림", "질문 정보를 찾을 수 없습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const answer = await submitAnswerToApi({
        question_id: parsedQuestionId,
        input_type: "text",
        content_text: trimmed,
      });

      setAnswerText(answer.content_text ?? trimmed);
      setDraft("");

      const answeredAt = new Date(answer.answered_at);
      const report = await getMonthlyAnswerReport(
        answeredAt.getFullYear(),
        answeredAt.getMonth() + 1
      );
      const streak = getAnswerStreak(
        report.answers.map((item) => new Date(item.answered_at))
      );

      if (streak >= 2) {
        Alert.alert("연속답변일수!", `${streak}일 연속으로 답변했어요.`);
      } else {
        Alert.alert("알림", "답변이 저장되었습니다.");
      }
    } catch (error) {
      Alert.alert(
        "알림",
        error instanceof Error ? error.message : "답변 저장에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F0F8FF]">
      <Header title="텍스트로 입력하기" />

      <View className="flex-1 p-5 gap-4">
        <View className="bg-white rounded-[14px] p-4 gap-2" style={{ elevation: 1 }}>
          <Text className="text-[13px] text-[#5BA4A4] font-semibold">오늘의 질문</Text>
          <Text className="text-[15px] text-[#222222] leading-[23px]">
            {questionText ?? "질문을 불러오지 못했습니다."}
          </Text>
        </View>

        <View className="bg-white rounded-[14px] p-4 gap-3" style={{ elevation: 1 }}>
          <TextInput
            className="min-h-36 rounded-xl border border-[#D9EAEA] px-4 py-3 text-[15px] text-[#222222]"
            multiline
            placeholder="답변을 입력해주세요."
            placeholderTextColor="#999999"
            textAlignVertical="top"
            value={draft}
            onChangeText={setDraft}
          />

          <Pressable
            className={`h-12 rounded-xl items-center justify-center ${
              isSubmitting ? "bg-[#9BCBCB]" : "bg-[#5BA4A4]"
            }`}
            onPress={() => submitAnswer(draft)}
            disabled={isSubmitting}
          >
            <Text className="text-white font-semibold">
              {isSubmitting ? "저장 중..." : "저장하기"}
            </Text>
          </Pressable>
        </View>

        {answerText && (
          <View className="bg-white rounded-[14px] p-4 gap-2" style={{ elevation: 1 }}>
            <Text className="text-[14px] text-[#333333] font-semibold">저장된 답변</Text>
            <Text className="text-[15px] text-[#222222] leading-[23px]">{answerText}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
