import Header from "@/components/Header";
import { submitAnswer as submitAnswerToApi } from "@/lib/api";
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
