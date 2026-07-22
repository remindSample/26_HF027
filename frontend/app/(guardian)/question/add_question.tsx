import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import Header from "../components/Header";

export default function GuardianQuestionAddScreen() {
  const [question, setQuestion] = useState("");

  const submitQuestion = () => {
    if (!question.trim()) return;

    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
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
          className="mt-[125px] h-[60px] items-center justify-center rounded-[10px] bg-[#616161]"
        >
          <Text className="text-[24px] font-bold text-white">질문 등록하기</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
