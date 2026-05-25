import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// 데모용 mock 데이터 (실제 API 연결 시 교체)
const MOCK_DATA = {
  score: 88,
  mission_rate: 94,
  comment:
    "이번 달은 어휘력이 지난달 대비 12% 향상됐습니다. 꾸준한 활동이 도움이 되고 있어요!",
  word_count: 197,
  word_diff: 22,
  complexity: 85,
  complexity_diff: 17,
};

const CALENDAR_DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const COMPLETED_DATES = [1, 2, 3, 5, 7, 8, 10, 11];

export default function ActivityReportScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>건강 리포트</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.userName}>김순자 어르신의 인지 건강 분석</Text>

        {/* 요약 카드 */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>5월 리포트 요약</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>매우 좋음</Text>
            </View>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreIcon}>🏆</Text>
              <Text style={styles.scoreLabel}>평균 건강 점수</Text>
              <Text style={styles.scoreValue}>{MOCK_DATA.score}점</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreIcon}>✅</Text>
              <Text style={styles.scoreLabel}>미션 완료율</Text>
              <Text style={styles.scoreValue}>{MOCK_DATA.mission_rate}%</Text>
            </View>
          </View>

          <View style={styles.commentBox}>
            <Text style={styles.commentText}>{MOCK_DATA.comment}</Text>
          </View>
        </View>

        {/* 활동 캘린더 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>활동 달력</Text>
            <Text style={styles.sectionMonth}>‹ 2026.05 ›</Text>
          </View>

          <View style={styles.calendarGrid}>
            {CALENDAR_DAYS.map((d) => (
              <Text key={d} style={styles.calDayLabel}>{d}</Text>
            ))}
            {/* 5월 1일 = 목요일, offset 4 */}
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.calCell} />
            ))}
            {Array.from({ length: 11 }).map((_, i) => {
              const day = i + 1;
              const done = COMPLETED_DATES.includes(day);
              return (
                <View key={day} style={[styles.calCell, done && styles.calCellDone]}>
                  <Text style={[styles.calDayNum, done && styles.calDayNumDone]}>
                    {day}
                  </Text>
                  {done && <Text style={styles.dot}>●</Text>}
                </View>
              );
            })}
          </View>

          <View style={styles.legend}>
            <Text style={styles.legendDot}>●</Text>
            <Text style={styles.legendLabel}>활동 완료</Text>
            <Text style={[styles.legendDot, { color: "#CCC" }]}>●</Text>
            <Text style={styles.legendLabel}>미완료</Text>
          </View>
        </View>

        {/* 단어/복잡도 수치 */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>단어 점수</Text>
            <Text style={styles.metricValue}>{MOCK_DATA.word_count} 개</Text>
            <Text style={styles.metricDiff}>↑{MOCK_DATA.word_diff}개 증가</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>문장 복잡도</Text>
            <Text style={styles.metricValue}>{MOCK_DATA.complexity} 점</Text>
            <Text style={styles.metricDiff}>↑{MOCK_DATA.complexity_diff}점 증가</Text>
          </View>
        </View>

        {/* 보호자 메모 */}
        <View style={styles.memoCard}>
          <View style={styles.memoHeader}>
            <Text style={styles.memoTitle}>보호자 메모</Text>
            <Text style={styles.memoIcon}>✏️</Text>
          </View>
          <Text style={styles.memoText}>
            산책을 자주 하세시고, 가족과의 추억을 떠올리셔요.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Text style={styles.navText}>리포트</Text>
        <Pressable onPress={() => router.push("/")}><Text style={styles.navText}>홈</Text></Pressable>
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
  scrollContent: { padding: 16, gap: 16 },
  userName: { fontSize: 16, fontWeight: "600", color: "#333" },

  summaryCard: {
    backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, gap: 12, elevation: 1,
  },
  summaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryTitle: { fontSize: 15, fontWeight: "700", color: "#5BA4A4" },
  ratingBadge: {
    backgroundColor: "#B7E4C7", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  ratingText: { fontSize: 12, fontWeight: "600", color: "#1B5E20" },
  scoreRow: { flexDirection: "row", alignItems: "center" },
  scoreItem: { flex: 1, alignItems: "center", gap: 4 },
  scoreIcon: { fontSize: 24 },
  scoreLabel: { fontSize: 12, color: "#777" },
  scoreValue: { fontSize: 22, fontWeight: "800", color: "#222" },
  divider: { width: 1, height: 50, backgroundColor: "#E0E0E0" },
  commentBox: { backgroundColor: "#F5F5F5", borderRadius: 10, padding: 12 },
  commentText: { fontSize: 14, color: "#444", lineHeight: 22 },

  section: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, elevation: 1 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#333" },
  sectionMonth: { fontSize: 14, color: "#5BA4A4", fontWeight: "600" },

  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  calDayLabel: {
    width: "14.28%", textAlign: "center", fontSize: 12,
    color: "#888", marginBottom: 8, fontWeight: "600",
  },
  calCell: { width: "14.28%", alignItems: "center", marginBottom: 6, height: 36 },
  calCellDone: {},
  calDayNum: { fontSize: 13, color: "#555" },
  calDayNumDone: { fontWeight: "700", color: "#222" },
  dot: { fontSize: 8, color: "#5BA4A4", marginTop: 2 },
  legend: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  legendDot: { fontSize: 12, color: "#5BA4A4" },
  legendLabel: { fontSize: 12, color: "#777", marginRight: 12 },

  metricsRow: { flexDirection: "row", gap: 12 },
  metricCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14,
    padding: 16, alignItems: "center", gap: 6, elevation: 1,
  },
  metricTitle: { fontSize: 13, color: "#777" },
  metricValue: { fontSize: 26, fontWeight: "800", color: "#222" },
  metricDiff: { fontSize: 13, color: "#5BA4A4", fontWeight: "600" },

  memoCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, elevation: 1 },
  memoHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  memoTitle: { fontSize: 15, fontWeight: "700", color: "#333" },
  memoIcon: { fontSize: 18 },
  memoText: { fontSize: 14, color: "#555", lineHeight: 22 },

  bottomNav: {
    height: 70, flexDirection: "row", justifyContent: "space-around",
    alignItems: "center", backgroundColor: "#FFFFFF",
    borderTopWidth: 1, borderTopColor: "#E0E0E0",
  },
  navText: { fontSize: 15, fontWeight: "500", color: "#AAAAAA" },
});
