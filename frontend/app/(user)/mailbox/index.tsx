import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import Header from "@/components/Header";
import { getGuardianQuestions, type GuardianQuestionResponse } from "@/apis";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function MailboxScreen() {
  const [questions, setQuestions] = useState<GuardianQuestionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const items = useMemo(
    () =>
      [...questions].sort((a, b) => {
        if (a.answered !== b.answered) {
          return a.answered ? 1 : -1;
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [questions],
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadQuestions() {
        try {
          const data = await getGuardianQuestions();
          const visible = data.filter(
            (q) => !q.answered || !q.answered_at || Date.now() - new Date(q.answered_at).getTime() < DAY_MS
          );

          if (isMounted) {
            setQuestions(visible);
          }
        } catch {
          // 오류가 나도 서버 메시지 대신 빈 화면 안내를 보여줍니다.
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }

      loadQuestions();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const goAnswer = (question: GuardianQuestionResponse) => {
    router.push({
      pathname: "/answer",
      params: {
        questionId: question.id,
        qType: question.q_type ?? "",
        questionText: question.content,
        from: "mailbox",
      },
    } as Href);
  };

  return (
    <View className="flex-1 bg-[#FDF2EC]">
      <Header title="보호자 질문" />

      <FlatList
        data={items}
        keyExtractor={(q) => String(q.id)}
        contentContainerClassName="px-[28px] pt-5 pb-[110px] gap-5"
        ListEmptyComponent={
          isLoading ? null : (
            <View className="mt-[180px] items-center gap-3 px-7">
              <Text className="text-[56px]">✉️</Text>
              <Text className="text-[20px] font-bold text-[#6B6B6B]">아직 도착한 질문이 없어요</Text>
              <Text className="text-center text-[15px] leading-[22px] text-[#8A8A8A]">
                보호자가 질문을 보내면{"\n"}이곳에서 확인할 수 있어요
              </Text>
            </View>
          )
        }
        renderItem={({ item: q }) => (
          <View
            className={`rounded-[10px] bg-[#FFFBF7] border-2 px-5 pt-4 pb-[18px] gap-[6px] ${
              q.answered ? "border-[#C9C9C9]" : "border-[#111111]"
            }`}
            style={{
              elevation: 3,
              shadowColor: q.answered ? "#E2E2E2" : "#8A8A8A",
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-[18px]">💌</Text>
              <Text className={`text-[16px] font-bold ${q.answered ? "text-[#8A8A8A]" : "text-[#5BA4A4]"}`}>
                {q.guardian_name ?? "보호자"}님이 질문을 보냈어요!
              </Text>
            </View>

            <Text className={`text-[20px] font-medium leading-[28px] ${q.answered ? "text-[#3A3A3A]" : "text-[#111111]"}`}>
              {q.content}
            </Text>

            <Text className="text-[14px] text-[#6B6B6B]">{formatDate(q.created_at)}</Text>

            {q.answered ? (
              <View className="mt-[6px] h-[38px] items-center justify-center">
                <Text className="text-[17px] font-bold text-[#5BA4A4]">✓ 답변 완료</Text>
              </View>
            ) : (
              <Pressable
                onPress={() => goAnswer(q)}
                accessibilityRole="button"
                className="mt-2 h-[50px] items-center justify-center rounded-[30px] border-[3px] border-[#F2DCCD] bg-[#BAC6C2]"
                style={{
                  elevation: 4,
                  shadowColor: "#B2B1AE",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                }}
              >
                <Text className="text-[20px] font-bold tracking-[1px] text-white">답변 작성하기</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}
