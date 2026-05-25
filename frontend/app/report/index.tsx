import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const CURRENT_MONTH = "2025년 5월";

export default function ReportMainScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>인지변화보고서</Text>
        <Text style={styles.headerIcon}>✓</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 월 선택 */}
        <View style={styles.monthRow}>
          <Text style={styles.calIcon}>📅</Text>
          <Text style={styles.monthText}>{CURRENT_MONTH} 리포트</Text>
        </View>

        {/* 코멘트 카드 */}
        <View style={styles.commentCard}>
          <View style={styles.commentImageBox} />
          <View style={styles.commentRight}>
            <Text style={styles.commentText}>최근 답변 참여가{"\n"}안정적이에요!</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2/2 완료</Text>
            </View>
          </View>
        </View>

        {/* 메뉴 버튼 */}
        <Link href="/report/activity" asChild>
          <Pressable style={styles.menuButton}>
            <Text style={styles.menuButtonText}>활동 리포트</Text>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
        </Link>

        <Link href="/report/detail" asChild>
          <Pressable style={styles.menuButton}>
            <Text style={styles.menuButtonText}>상세 지표</Text>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
        </Link>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Text style={[styles.navText, styles.navActive]}>리포트</Text>
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
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  headerIcon: { fontSize: 20, color: "#5BA4A4" },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16 },

  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    elevation: 1,
  },
  calIcon: { fontSize: 18 },
  monthText: { fontSize: 16, fontWeight: "600", color: "#333" },

  commentCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 14,
    elevation: 1,
  },
  commentImageBox: {
    width: 64,
    height: 64,
    backgroundColor: "#D9D9D9",
    borderRadius: 8,
  },
  commentRight: { flex: 1, gap: 8 },
  commentText: { fontSize: 15, fontWeight: "500", color: "#222", lineHeight: 22 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#B7E4C7",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#1B5E20" },

  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 22,
    elevation: 1,
  },
  menuButtonText: { fontSize: 20, fontWeight: "700", color: "#111" },
  menuArrow: { fontSize: 28, color: "#555", fontWeight: "300" },

  bottomNav: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  navText: { fontSize: 15, fontWeight: "500", color: "#AAAAAA" },
  navActive: { color: "#5BA4A4", fontWeight: "700" },
});
