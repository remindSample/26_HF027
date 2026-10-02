import Header from "@/components/Header";
import { uploadImageAnswer } from "@/apis";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";

export default function GalleryAnswerScreen() {
  const { questionId, questionText } = useLocalSearchParams<{
    questionId?: string;
    questionText?: string;
  }>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");

  const submitAnswer = async (nextImageUri: string) => {
    const parsedQuestionId = Number(questionId);
    if (!Number.isFinite(parsedQuestionId)) {
      Alert.alert("알림", "질문 정보를 찾을 수 없습니다.");
      return;
    }

    setImageUri(nextImageUri);
    setUploadStatus("idle");
    setIsSubmitting(true);
    try {
      await uploadImageAnswer({
        questionId: parsedQuestionId,
        imageUri: nextImageUri,
      });
      setUploadStatus("success");
      Alert.alert("알림", "답변이 등록되었습니다", [
        { text: "확인", onPress: () => router.push("/question") },
      ]);
    } catch (error) {
      setUploadStatus("error");
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
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      // HEIC 등 OpenAI Vision이 거부하는 포맷을 대비해 업로드 직전 JPEG로 강제 변환
      const jpegResult = await manipulateAsync(result.assets[0].uri, [], {
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
      submitAnswer(jpegResult.uri);
    }
  };

  return (
    <View className="flex-1 bg-[#FDF2EC]">
      <Header title="갤러리에서 가져오기" />

      <View className="flex-1 p-5 gap-4">
        <View className="mt-7 bg-[#FFFBF7] p-5 gap-2.5 border-2 border-black" 
        style={{
                elevation: 3,
                shadowColor: "#000000",
                shadowOffset: { width: 3, height: 3 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }}>
          <Text className="text-[16px] text-[#5BA4A4] font-semibold">오늘의 질문</Text>
          <Text className="text-[20px] text-[#222222] leading-[23px]">
            {questionText ?? "질문을 불러오지 못했습니다."}
          </Text>
        </View>


        <Pressable
          className="mt-10 h-14 rounded-[14px] bg-[#FFFBF7] items-center border-2 border-black justify-center"
          style={{
                elevation: 3,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }}
          onPress={pickImage}
        >
          <Text className="text-black text-[16px] font-semibold">이미지 선택하기</Text>
        </Pressable>

        {imageUri ? (
          <View className="bg-white rounded-[14px] p-4 gap-3" style={{ elevation: 1 }}>
            <Text className="text-[14px] text-[#333333] font-semibold">선택된 이미지</Text>
            <Image source={{ uri: imageUri }} className="w-full h-64 rounded-xl bg-[#E8E8E8]" />
            <Text
              className={`text-[12px] ${
                uploadStatus === "error" ? "text-[#E57373]" : "text-[#5BA4A4]"
              }`}
            >
              {isSubmitting
                ? "서버에 저장 중..."
                : uploadStatus === "success"
                ? "서버 저장 요청 완료"
                : uploadStatus === "error"
                ? "저장 실패 - 다시 시도해주세요."
                : ""}
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
