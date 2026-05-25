import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function GameHomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.card}>
        {/* 상단 바 */}
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>나가기</Text>
            <Text style={styles.handIcon}>✋</Text>
          </Pressable>

          <Text style={styles.soundIcon}>⌕</Text>
        </View>

        {/* 로고 영역 */}
        <View style={styles.logoArea}>
          <Text style={styles.logoText}>Re:Mind</Text>
          <Text style={styles.subTitle}>인지 훈련게임</Text>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonArea}>
          <Pressable
            style={styles.mainButton}
            onPress={() => router.push("/game/connect")}
          >
            <Text style={styles.mainButtonText}>스마트 장갑 연동</Text>
          </Pressable>

          <Pressable
            style={styles.mainButton}
            onPress={() => router.push("/game/level")}
          >
            <Text style={styles.mainButtonText}>게임 시작하기</Text>
          </Pressable>
        </View>

        {/* 게임 방법 */}
        <View style={styles.guideArea}>
          <Text style={styles.guideTitle}>게임 방법</Text>

          <Text style={styles.guideText}>
            장갑을 착용하고 연동을 진행해주세요!
          </Text>

          <Text style={styles.guideText}>
            주먹과 보자기가 내려오면 똑같이{"\n"}
            따라하세요!
          </Text>

          <Text style={styles.guideText}>
            판정 라인에 닿을 때 정확히 따라하세요!
          </Text>

          <Text style={styles.guideText}>연속 성공시 보너스 점수가 있어요</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: "#55595A",
  },

  card: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: "#55595A",
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 48,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  backIcon: {
    marginRight: 10,
    fontSize: 52,
    lineHeight: 52,
    fontWeight: "300",
    color: "#FFFFFF",
  },

  backText: {
    fontSize: 20,
    color: "#FFFFFF",
  },

  handIcon: {
    marginLeft: 18,
    fontSize: 30,
    color: "#EB7E7B",
  },

  soundIcon: {
    transform: [{ rotate: "180deg" }],
    fontSize: 42,
    color: "#FFFFFF",
  },

  logoArea: {
    marginTop: 70,
    alignItems: "center",
  },

  logoText: {
    alignSelf: "flex-start",
    marginLeft: 30,
    fontSize: 52,
    fontWeight: "800",
    letterSpacing: 8,
    color: "#D7D7D7",
  },

  subTitle: {
    marginTop: 18,
    marginLeft: 185,
    fontSize: 24,
    letterSpacing: 8,
    color: "#D7D7D7",
  },

  buttonArea: {
    marginTop: 105,
    gap: 28,
  },

  mainButton: {
    height: 112,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: "#D7D7D7",
    borderRadius: 30,
    backgroundColor: "#D7D7D7",
  },

  mainButtonText: {
    fontSize: 34,
    fontWeight: "600",
    letterSpacing: 2,
    color: "#4A4A4A",
  },

  guideArea: {
    marginTop: 120,
  },

  guideTitle: {
    marginBottom: 30,
    fontSize: 32,
    fontWeight: "800",
    color: "#E5E5E5",
  },

  guideText: {
    marginBottom: 28,
    fontSize: 24,
    lineHeight: 38,
    fontWeight: "500",
    color: "#E5E5E5",
  },
});
