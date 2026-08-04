import Header from "@/components/Header";
import { submitAnswer as submitAnswerToApi } from "@/lib/api";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";

export default function GalleryAnswerScreen() {
  const { questionId, questionText } = useLocalSearchParams<{
    questionId?: string;
    questionText?: string;
  }>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAnswer = async (nextImageUri: string) => {
    const parsedQuestionId = Number(questionId);
    if (!Number.isFinite(parsedQuestionId)) {
      Alert.alert("알림", "질문 정보를 찾을 수 없습니다.");
      return;
    }

    setImageUri(nextImageUri);
    setIsSubmitting(true);
    try {
      await submitAnswerToApi({
        question_id: parsedQuestionId,
        input_type: "handwriting",
        image_url: nextImageUri,
      });
    } catch (error) {
      Alert.alert(
        "알림",
        error instanceof Error ? error.message : "이미지 답변 저장에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      submitAnswer(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1 bg-[#F0F8FF]">
      <Header title="갤러리에서 가져오기" />

      <View className="flex-1 p-5 gap-4">
        <View className="bg-white rounded-[14px] p-4 gap-2" style={{ elevation: 1 }}>
          <Text className="text-[13px] text-[#5BA4A4] font-semibold">오늘의 질문</Text>
          <Text className="text-[15px] text-[#222222] leading-[23px]">
            {questionText ?? "질문을 불러오지 못했습니다."}
          </Text>
        </View>

        <Pressable
          className="h-14 rounded-xl bg-[#5BA4A4] items-center justify-center"
          onPress={pickImage}
        >
          <Text className="text-white text-[16px] font-semibold">이미지 선택하기</Text>
        </Pressable>

        {imageUri ? (
          <View className="bg-white rounded-[14px] p-4 gap-3" style={{ elevation: 1 }}>
            <Text className="text-[14px] text-[#333333] font-semibold">선택된 이미지</Text>
            <Image source={{ uri: imageUri }} className="w-full h-64 rounded-xl bg-[#E8E8E8]" />
            <Text className="text-[12px] text-[#5BA4A4]">
              {isSubmitting ? "서버에 저장 중..." : "서버 저장 요청 완료"}
            </Text>
            <Text className="text-[12px] text-[#777777]" numberOfLines={1}>
              {imageUri}
            </Text>
          </View>
        ) : (
          <View className="bg-white rounded-[14px] p-5" style={{ elevation: 1 }}>
            <Text className="text-[14px] text-[#777777] leading-[21px]">
              아직 선택된 이미지가 없습니다.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
