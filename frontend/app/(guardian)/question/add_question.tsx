import { router } from "expo-router";
import { useState } from "react";
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

import { createGuardianQuestion, getCurrentGuardianAcceptedLink } from "@/apis";
import Header from "../components/Header";

export default function GuardianQuestionAddScreen() {
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        contentContainerClassName="px-[22px] pb-10 pt-[28px]"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          className="h-[346px] rounded-[10px] border-[3px] border-[#939393] bg-[#E9E9E9] px-[26px] py-[28px] text-[20px] leading-[38px] text-black"
          multiline
          placeholder="질문을 입력해주세요..."
          placeholderTextColor="#000000"
          textAlignVertical="top"
          value={question}
          onChangeText={setQuestion}
        />

        <Pressable
          accessibilityRole="button"
          onPress={submitQuestion}
          className="mt-[125px] h-[60px] items-center justify-center rounded-[10px] bg-[#174C33]"
        >
          <Text className="text-[24px] font-bold text-white">질문 등록하기</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
