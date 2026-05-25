import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_BASE = "http://localhost:8000";

export default function WriteAnswerScreen() {
  const { questionId, qType, questionText, prefilled } = useLocalSearchParams<{
    questionId: string;
    qType: string;
    questionText: string;
    prefilled?: string;
  }>();

  const [text, setText] = useState(prefilled ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert("알림", "답변을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1,
          question_id: questionId ? Number(questionId) : null,
          q_type: qType ?? null,
          question_text: questionText ?? null,
          answer_text: text.trim(),
          input_type: "text",
        }),
      });

      if (!res.ok) throw new Error("저장 실패");

      Alert.alert("완료", "답변이 저장됐습니다!", [
        { text: "확인", onPress: () => router.push("/question") },
      ]);
    } catch (e) {
      Alert.alert("오류", "답변 저장에 실패했습니다. 서버 연결을 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>직접 입력</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.questionBox}>
          <Text style={styles.questionLabel}>질문</Text>
          <Text style={styles.questionText}>{questionText}</Text>
        </View>

        <Text style={styles.inputLabel}>답변을 입력해주세요</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="여기에 답변을 작성해주세요..."
          placeholderTextColor="#BBBBBB"
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.counter}>{text.length}자</Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>답변 저장하기</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16 },
  questionBox: {
    backgroundColor: "#E8F5F5", borderRadius: 12,
    padding: 16, gap: 6,
  },
  questionLabel: { fontSize: 12, color: "#5BA4A4", fontWeight: "600" },
  questionText: { fontSize: 15, color: "#333", lineHeight: 23 },
  inputLabel: { fontSize: 14, color: "#555", fontWeight: "600" },
  input: {
    backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1,
    borderColor: "#D0E8E8", padding: 16, fontSize: 15,
    color: "#222", minHeight: 200, lineHeight: 24,
  },
  counter: { fontSize: 12, color: "#AAAAAA", textAlign: "right" },
  footer: { padding: 16, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E0E0E0" },
  submitBtn: {
    backgroundColor: "#5BA4A4", borderRadius: 14,
    paddingVertical: 16, alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
});
