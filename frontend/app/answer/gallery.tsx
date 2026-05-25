import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";

// 데모용 mock OCR 텍스트 (실제 OCR 연동 시 교체)
const MOCK_OCR_TEXTS = [
  "오늘 손주가 집에 놀러 왔다. 오랜만에 같이 밥을 먹고 이야기를 나눴다. 정말 반갑고 기뻤다.",
  "아침에 공원을 산책했다. 날씨가 맑고 바람이 시원해서 기분이 좋았다. 꽃도 많이 피어 있었다.",
  "친구와 함께 시장에 다녀왔다. 오랜만에 만나 옛날 이야기를 나누며 웃었다.",
];

export default function GalleryScreen() {
  const { questionId, qType, questionText } = useLocalSearchParams<{
    questionId: string;
    qType: string;
    questionText: string;
  }>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [done, setDone] = useState(false);
  const [ocrText, setOcrText] = useState("");

  useEffect(() => {
    pickImage();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      router.back();
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (result.canceled) {
      router.back();
      return;
    }

    setImageUri(result.assets[0].uri);
    runMockOCR();
  };

  const runMockOCR = () => {
    setRecognizing(true);
    // 2초 후 mock OCR 결과 반환
    setTimeout(() => {
      const text = MOCK_OCR_TEXTS[Math.floor(Math.random() * MOCK_OCR_TEXTS.length)];
      setOcrText(text);
      setRecognizing(false);
      setDone(true);
    }, 2000);
  };

  const handleProceed = () => {
    router.replace({
      pathname: "/answer/write",
      params: { questionId, qType, questionText, prefilled: ocrText },
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>사진 인식</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>사진을 선택 중...</Text>
          </View>
        )}

        {recognizing && (
          <View style={styles.statusBox}>
            <ActivityIndicator size="large" color="#5BA4A4" />
            <Text style={styles.statusText}>AI 인식 중...{"\n"}잠시만 기다려주세요.</Text>
          </View>
        )}

        {done && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>인식된 텍스트</Text>
            <Text style={styles.resultText}>{ocrText}</Text>
            <View style={styles.btnRow}>
              <Pressable style={styles.retryBtn} onPress={pickImage}>
                <Text style={styles.retryText}>재촬영</Text>
              </Pressable>
              <Pressable style={styles.proceedBtn} onPress={handleProceed}>
                <Text style={styles.proceedText}>인식 진행하기</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#111111" },
  header: {
    height: 56, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 16,
    backgroundColor: "#1A1A1A", borderBottomWidth: 1, borderBottomColor: "#333",
  },
  backBtn: { width: 40, alignItems: "center" },
  backIcon: { fontSize: 24, color: "#FFFFFF" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  body: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 24 },
  image: { width: "100%", height: 280, borderRadius: 12 },
  imagePlaceholder: {
    width: "100%", height: 280, backgroundColor: "#333",
    borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  placeholderText: { color: "#888", fontSize: 16 },
  statusBox: { alignItems: "center", gap: 16 },
  statusText: { color: "#FFFFFF", fontSize: 16, textAlign: "center", lineHeight: 26 },
  resultBox: {
    backgroundColor: "#FFFFFF", borderRadius: 14, padding: 20,
    width: "100%", gap: 12,
  },
  resultLabel: { fontSize: 13, color: "#5BA4A4", fontWeight: "600" },
  resultText: { fontSize: 15, color: "#333", lineHeight: 24 },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  retryBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10,
    backgroundColor: "#EEEEEE", alignItems: "center",
  },
  retryText: { fontSize: 15, fontWeight: "600", color: "#555" },
  proceedBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 10,
    backgroundColor: "#5BA4A4", alignItems: "center",
  },
  proceedText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
