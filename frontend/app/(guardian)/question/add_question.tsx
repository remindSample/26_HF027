import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { createGuardianQuestion, getCurrentGuardianAcceptedLink, getUser } from "@/apis";
import Header from "../components/Header";

export default function GuardianQuestionAddScreen() {
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elderName, setElderName] = useState<string | null>(null);
  const isSubmitDisabled = isSubmitting || !question.trim();

  useEffect(() => {
    let isMounted = true;

    async function loadElderName() {
      try {
        const link = await getCurrentGuardianAcceptedLink();
        if (!link) return;

        const elder = await getUser(link.elder_id);
        if (isMounted) {
          setElderName(elder.name);
        }
      } catch {
        // 조회에 실패하면 "보낼 질문"으로 표시합니다.
      }
    }

    loadElderName();

    return () => {
      isMounted = false;
    };
  }, []);

  const submitQuestion = async () => {
    if (!question.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const link = await getCurrentGuardianAcceptedLink();

      if (!link) {
        Alert.alert("알림", "연결된 사용자가 없습니다. 먼저 사용자와 계정을 연결해주세요.");
        return;
      }

      await createGuardianQuestion(question.trim(), link.elder_id);
      router.back();
    } catch (error) {
      Alert.alert(
        "알림",
        error instanceof Error ? error.message : "질문 등록에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#FDF2EC]"
    >
      <View className="px-[12px] py-5">
        <Header title="질문 추가" showSettingButton={true}/>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-[22px] pb-10 pt-0"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="mt-[28px] overflow-hidden border-2 border-black bg-[#F9F7F4]"
          style={{
            elevation: 4,
            shadowColor: "#000000",
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
          }}
        >
          <View className="flex-row items-center justify-between border-b-2 border-black bg-[#F9EBDF] px-5 py-3.5">
            <Text className="text-[16px] font-medium text-[#174C33]">
              {elderName ? `${elderName} 님에게 보낼 질문` : "보낼 질문"}
            </Text>
            <View className="rounded-[8px] border border-[#8C8C8C] bg-[#FDF2EC] px-2.5 py-0.5">
              <Text className="text-[13px] font-medium text-black">
                {question.length} / 200자
              </Text>
            </View>
          </View>

          <TextInput
            className="h-[260px] bg-[#F9F7F4] px-5 py-[22px] text-[18px] leading-[32px] text-black"
            multiline
            maxLength={200}
            placeholder="질문을 입력해주세요..."
            placeholderTextColor="#9B9B9B"
            textAlignVertical="top"
            value={question}
            onChangeText={setQuestion}
          />
        </View>

        <View className="mt-4 px-1">
          <Text className="text-[14px] font-medium text-[#A1978B]">
            이런 질문이 좋아요
          </Text>
          <Text className="mt-1.5 text-[14px] leading-[22px] text-[#6B6255]">
            예) 어릴 적 가장 좋아했던 음식은 무엇이었나요?{"\n"}
            예) 처음 직장에 출근하던 날 기분이 어땠나요?
          </Text>
        </View>

        <View className="flex-1" />

        <Pressable
          accessibilityRole="button"
          onPress={submitQuestion}
          disabled={isSubmitDisabled}
          className={`h-[60px] flex-row items-center justify-center rounded-full border-2 border-black bg-[#BFCBC7] ${
            isSubmitDisabled ? "opacity-50" : ""
          }`}
          style={{
            elevation: 3,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
          }}
        >
          <MaterialCommunityIcons name="send-outline" size={22} color="#FFFFFF" />
          <Text className="ml-2 text-[18px] font-medium text-white">질문 등록하기</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
