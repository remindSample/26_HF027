import Header from "@/components/Header";
import { uploadImageAnswer } from "@/apis";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";

type CameraRef = React.ElementRef<typeof CameraView>;

export default function CameraAnswerScreen() {
  const { questionId, questionText } = useLocalSearchParams<{
    questionId?: string;
    questionText?: string;
  }>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraRef>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAnswer = async (nextImageUri: string) => {
    const parsedQuestionId = Number(questionId);
    if (!Number.isFinite(parsedQuestionId)) {
      Alert.alert("알림", "질문 정보를 찾을 수 없습니다.");
      return;
    }

    setImageUri(nextImageUri);
    setOcrText(null);
    setIsSubmitting(true);
    try {
      const answer = await uploadImageAnswer({
        questionId: parsedQuestionId,
        imageUri: nextImageUri,
      });
      setOcrText(answer.ocr_text ?? "인식된 텍스트가 없습니다.");
      Alert.alert("알림", "촬영 답변이 저장되었습니다.");
    } catch (error) {
      Alert.alert(
        "알림",
        error instanceof Error ? error.message : "촬영 답변 저장에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const takePicture = async () => {
    if (!permission?.granted) {
      const nextPermission = await requestPermission();
      if (!nextPermission.granted) return;
    }

    if (!cameraRef.current || isTakingPicture) return;

    setIsTakingPicture(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo?.uri) {
        submitAnswer(photo.uri);
      }
    } finally {
      setIsTakingPicture(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F0F8FF]">
      <Header title="카메라 촬영" />

      <View className="flex-1 p-5 gap-4">
        <View className="bg-white rounded-[14px] p-4 gap-2" style={{ elevation: 1 }}>
          <Text className="text-[13px] text-[#5BA4A4] font-semibold">오늘의 질문</Text>
          <Text className="text-[15px] text-[#222222] leading-[23px]">
            {questionText ?? "질문을 불러오지 못했습니다."}
          </Text>
        </View>

        {!permission?.granted ? (
          <View className="bg-white rounded-[14px] p-5 gap-4" style={{ elevation: 1 }}>
            <Text className="text-[15px] text-[#333333] leading-[22px]">
              카메라 촬영을 위해 권한이 필요합니다.
            </Text>
            <Pressable
              className="h-12 rounded-xl bg-[#5BA4A4] items-center justify-center"
              onPress={requestPermission}
            >
              <Text className="text-white font-semibold">카메라 권한 허용</Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-1 gap-4">
            <View className="flex-1 overflow-hidden rounded-[14px] bg-black">
              <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
            </View>

            <Pressable
              className="h-14 rounded-xl bg-[#5BA4A4] items-center justify-center"
              onPress={takePicture}
              disabled={isTakingPicture}
            >
              <Text className="text-white text-[16px] font-semibold">
                {isTakingPicture ? "촬영 중..." : "촬영하기"}
              </Text>
            </Pressable>
          </View>
        )}

        {imageUri && (
          <View className="bg-white rounded-[14px] p-4 gap-3" style={{ elevation: 1 }}>
            <Text className="text-[14px] text-[#333333] font-semibold">촬영된 이미지</Text>
            <Image source={{ uri: imageUri }} className="w-full h-48 rounded-xl bg-[#E8E8E8]" />
            <Text className="text-[12px] text-[#5BA4A4]">
              {isSubmitting ? "OCR 인식 후 저장 중..." : "OCR 저장 요청 완료"}
            </Text>
            {ocrText && (
              <View className="rounded-xl bg-[#F5F5F5] p-3">
                <Text className="text-[13px] font-semibold text-[#333333]">
                  인식된 답변
                </Text>
                <Text className="mt-2 text-[14px] leading-[22px] text-[#222222]">
                  {ocrText}
                </Text>
              </View>
            )}
            <Text className="text-[12px] text-[#777777]" numberOfLines={1}>
              {imageUri}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
