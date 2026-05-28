import { type Href, router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function AnswerMethodScreen() {
  const { questionId, qType, questionText } = useLocalSearchParams<{
    questionId: string;
    qType: string;
    questionText: string;
  }>();

  const goTo = (method: "camera" | "gallery" | "write") => {
    router.push({
      pathname: `/answer/${method}`,
      params: { questionId, qType, questionText },
    } as Href);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>보호자가 남긴 질문</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.questionBox}>
          <Text style={styles.questionLabel}>오늘의 질문</Text>
          <Text style={styles.questionText}>{questionText}</Text>
          <Text style={styles.questionSub}>나는 네 사용을 즐겨야해요.</Text>
        </View>

        <View style={styles.methodList}>
          <Pressable style={styles.methodBtn} onPress={() => goTo("camera")}>
            <Text style={styles.methodIcon}>📷</Text>
            <Text style={styles.methodText}>카메라 촬영</Text>
          </Pressable>

          <Pressable style={styles.methodBtn} onPress={() => goTo("gallery")}>
            <Text style={styles.methodIcon}>🖼</Text>
            <Text style={styles.methodText}>갤러리에서 가져오기</Text>
          </Pressable>

          <Pressable style={styles.methodBtn} onPress={() => goTo("write")}>
            <Text style={styles.methodIcon}>⌨️</Text>
            <Text style={styles.methodText}>키보드로 직접 입력</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F0F8FF" },
  header: {
    height: 56, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 16,
    backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E0E0E0",
  },
  backBtn: { width: 40, alignItems: "center" },
  backIcon: { fontSize: 24, color: "#333" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  body: { flex: 1, padding: 20, gap: 24 },
  questionBox: {
    backgroundColor: "#FFFFFF", borderRadius: 14,
    padding: 20, gap: 10, elevation: 1,
  },
  questionLabel: { fontSize: 13, color: "#5BA4A4", fontWeight: "600" },
  questionText: { fontSize: 16, color: "#222", lineHeight: 25, fontWeight: "500" },
  questionSub: { fontSize: 13, color: "#999" },
  methodList: { gap: 14 },
  methodBtn: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: "#FFFFFF", borderRadius: 14,
    paddingHorizontal: 22, paddingVertical: 20, elevation: 1,
  },
  methodIcon: { fontSize: 26 },
  methodText: { fontSize: 17, fontWeight: "600", color: "#333" },
});
