import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";


export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      {/* 상단 바 */}
      <View style={styles.header}>
        <Text style={styles.settingText}>설정</Text>
      </View>

      {/* 스크롤 되는 본문 */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>안녕하세요, 홍길동 님</Text>

        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionTitle}>오늘의 질문</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>2개 남음</Text>
            </View>
          </View>

          <Text style={styles.questionText}>
            어린 시절 가장 기억에 남는 친구는{"\n"}
            누구였나요?
          </Text>

          <Link href="/question" asChild>
            <Pressable style={styles.answerButton}>
              <Text style={styles.answerButtonText}>답변 작성하기</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.menuRow}>
          <Link href="/game" asChild>
            <Pressable style={styles.gameButton}>
              <Text style={styles.iconText}>⇩</Text>

              <View style={styles.handRow}>
                <Text style={styles.handIcon}>🖐</Text>
                <Text style={styles.handIcon}>✊</Text>
              </View>

              <Text style={styles.gameButtonText}>손동작 게임{"\n"}시작</Text>
            </Pressable>
          </Link>

          <View style={styles.disabledButtonColumn}>
            <Pressable disabled style={styles.disabledButton}>
              <Text style={styles.disabledButtonText}>연속기록 28일</Text>
            </Pressable>

            <Pressable disabled style={styles.disabledButton}>
              <Text style={styles.disabledButtonText}>언어활력도</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* 하단 탭 */}
      <View style={styles.bottomNav}>
        <Link href="/report" asChild>
          <Pressable><Text style={styles.bottomNavText}>리포트</Text></Pressable>
        </Link>
        <Text style={styles.bottomNavText}>홈</Text>
        <Text style={styles.bottomNavText}>앨범</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: 84,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 24,
  },

  settingText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#C9C9C9",
  },

  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 48,
    paddingTop: 72,
    paddingBottom: 60,
  },

  greeting: {
    fontSize: 30,
    fontWeight: "500",
    color: "#111111",
    marginBottom: 58,
  },

  questionCard: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#9CC7CA",
    backgroundColor: "#E9F6F6",
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 28,
    marginBottom: 42,
  },

  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 34,
  },

  questionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
  },

  countBadge: {
    width: 106,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#DDDDDD",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333333",
  },

  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#111111",
    marginBottom: 28,
  },

  answerButton: {
    height: 36,
    borderWidth: 1,
    borderColor: "#9CC7CA",
    borderRadius: 8,
    backgroundColor: "#D8EDEE",
    alignItems: "center",
    justifyContent: "center",
  },

  answerButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111111",
  },

  menuRow: {
    flexDirection: "row",
    gap: 18,
  },

  gameButton: {
    width: 136,
    height: 182,
    borderWidth: 2,
    borderColor: "#9CC7CA",
    backgroundColor: "#E9F6F6",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  iconText: {
    fontSize: 30,
    lineHeight: 30,
    color: "#17283A",
  },

  handRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2,
    marginBottom: 14,
  },

  handIcon: {
    fontSize: 28,
  },

  gameButtonText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "500",
    color: "#111111",
    textAlign: "center",
  },

  disabledButtonColumn: {
    gap: 14,
  },

  disabledButton: {
    width: 150,
    height: 84,
    borderWidth: 2,
    borderColor: "#D4D4D4",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButtonText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#C9C9C9",
  },

  bottomNav: {
    height: 94,
    borderTopWidth: 1,
    borderTopColor: "#DCDCDC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
  },

  bottomNavText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#CFCFCF",
  },
});
