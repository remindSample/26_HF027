import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import Header from "../components/Header";

const tags = ["여행", "외출", "경로당", "산책", "강아지", "어린 시절", "추억", "음식"];

export default function GuardianAiQuestionScreen() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPromptMode, setIsPromptMode] = useState(false);
  const [prompt, setPrompt] = useState("");

  const toggleTag = (tag: string) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag],
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-[12px] py-5">
        <Header title="AI 질문 생성" showSettingButton={true} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-[22px] pb-10 pt-[45px]"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[24px] font-bold leading-[45px] text-black">
          어떤 것에 대해{"\n"}질문을 생성할까요?
        </Text>

        <Text className="mt-[90px] text-[24px] font-bold text-black">
          {isPromptMode ? "프롬프트 입력" : "태그로 선택하기"}
        </Text>

        {isPromptMode ? (
          <TextInput
            className="mt-[35px] min-h-[172px] rounded-[10px] border-[2px] border-[#CFCFCF] px-[20px] py-[26px] text-[16px] font-medium text-black"
            multiline
            placeholder="프롬프트를 입력하세요..."
            placeholderTextColor="#8E8E8E"
            textAlignVertical="top"
            value={prompt}
            onChangeText={setPrompt}
          />
        ) : (
          <View className="mt-[35px] min-h-[172px] flex-row flex-wrap gap-x-[12px] gap-y-[23px] rounded-[10px] border-[2px] border-[#CFCFCF] px-[20px] py-[15px]">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);

              return (
                <Pressable
                  key={tag}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => toggleTag(tag)}
                  className={`min-h-[28px] items-center justify-center rounded-full border px-[16px] ${
                    isSelected ? "border-[3px] border-[#5F5F5F]" : "border-[#D9D9D9]"
                  }`}
                >
                  <Text className="text-[16px] font-medium text-black">{tag}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          className="mt-[51px] h-[60px] items-center justify-center rounded-[10px] bg-[#616161]"
        >
          <Text className="text-[24px] font-bold text-white">생성하기</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setIsPromptMode((currentMode) => !currentMode)}
          className="mt-[62px] h-[60px] items-center justify-center rounded-[10px] border border-[#8E8E8E] bg-white"
        >
          <Text className="text-[24px] font-bold text-black">
            {isPromptMode ? "태그로 간단하게 생성" : "자유롭게 프롬프트 입력"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
