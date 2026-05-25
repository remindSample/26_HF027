import { Link, router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Question = {
  id: number;
  q_type: string;
  content: string;
  answered: boolean;
  date: string;
};

const TODAY = "2026년 5월 29일 (수)";

const QUESTIONS: Question[] = [
  {
    id: 1,
    q_type: "memory_recall",
    content: "살면서 근육 세 때 가장 가까에 남편 순간은 어떤 건가요?",
    answered: true,
    date: "2026.05.29",
  },
  {
    id: 2,
    q_type: "emotional_expression",
    content: "살면서 근육 세 때 가장 가까에 남편 순간은 어떤 건가요?",
    answered: false,
    date: "2026.05.29",
  },
];

export default function QuestionScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>오늘의 질문</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dateText}>{TODAY}</Text>
        <Text style={styles.subText}>오늘의 선택 완료!</Text>

        {QUESTIONS.map((q) => (
          <Link
            key={q.id}
            href={{ pathname: "/answer", params: { questionId: q.id, qType: q.q_type, questionText: q.content } }}
            asChild
          >
            <Pressable style={[styles.card, q.answered && styles.cardDone]}>
              <View style={styles.cardTop}>
                <Text style={styles.cardDate}>{q.date} (수)</Text>
                {q.answered && (
                  <View style={styles.doneBadge}>
                    <Text style={styles.doneBadgeText}>답변 완료</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardQuestion}>{q.content}</Text>
              {q.answered && (
                <Text style={styles.doneText}>남 편 완 료 ✓</Text>
              )}
            </Pressable>
          </Link>
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        <Link href="/report" asChild>
          <Pressable><Text style={styles.navText}>리포트</Text></Pressable>
        </Link>
        <Link href="/" asChild>
          <Pressable><Text style={styles.navText}>홈</Text></Pressable>
        </Link>
        <Text style={styles.navText}>앨범</Text>
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
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 14 },
  dateText: { fontSize: 15, fontWeight: "600", color: "#333" },
  subText: { fontSize: 13, color: "#5BA4A4", fontWeight: "600", marginBottom: 4 },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18,
    gap: 10, elevation: 1, borderWidth: 1, borderColor: "#E8E8E8",
  },
  cardDone: { borderColor: "#B7E4C7" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardDate: { fontSize: 12, color: "#999" },
  doneBadge: {
    backgroundColor: "#B7E4C7", borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  doneBadgeText: { fontSize: 11, fontWeight: "600", color: "#1B5E20" },
  cardQuestion: { fontSize: 15, color: "#222", lineHeight: 23 },
  doneText: { fontSize: 12, color: "#5BA4A4", fontWeight: "600" },
  bottomNav: {
    height: 70, flexDirection: "row", justifyContent: "space-around",
    alignItems: "center", backgroundColor: "#FFFFFF",
    borderTopWidth: 1, borderTopColor: "#E0E0E0",
  },
  navText: { fontSize: 15, fontWeight: "500", color: "#AAAAAA" },
});
