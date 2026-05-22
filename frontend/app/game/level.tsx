import { router } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type LevelId = "1" | "2" | "3" | "4" | "5";

type Level = {
  id: LevelId;
  title: string;
  label: string;
  starCount: number;
};

const LEVELS: Level[] = [
  { id: "1", title: "레벨 1", label: "매우 쉬움", starCount: 1 },
  { id: "2", title: "레벨 2", label: "쉬움", starCount: 2 },
  { id: "3", title: "레벨 3", label: "보통", starCount: 3 },
  { id: "4", title: "레벨 4", label: "어려움", starCount: 4 },
  { id: "5", title: "레벨 5", label: "매우 어려움", starCount: 5 },
];

export default function LevelScreen() {
  const [selectedLevel, setSelectedLevel] = useState<LevelId>("1");

  const handleStartGame = () => {
    router.push({
      pathname: "/game/play",
      params: {
        level: selectedLevel,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.exitArea}
          >
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.exitText}>나가기</Text>
            <Text style={styles.handIcon}>✋</Text>
          </TouchableOpacity>

          <Text style={styles.soundIcon}>🔊</Text>
        </View>

        <View style={styles.logoArea}>
          <Text style={styles.logoText}>Re:Mind</Text>
          <Text style={styles.subTitle}>인지 훈련게임</Text>
        </View>

        <View style={styles.levelList}>
          {LEVELS.map((level) => {
            const isSelected = selectedLevel === level.id;

            return (
              <TouchableOpacity
                key={level.id}
                activeOpacity={0.75}
                onPress={() => setSelectedLevel(level.id)}
                style={[
                  styles.levelCard,
                  isSelected
                    ? styles.selectedLevelCard
                    : styles.defaultLevelCard,
                ]}
              >
                <View style={styles.levelTextArea}>
                  <Text style={styles.levelTitle}>{level.title}</Text>
                  <Text style={styles.levelLabel}>{level.label}</Text>
                </View>

                <Text style={styles.stars}>{"★".repeat(level.starCount)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleStartGame}
          style={styles.startButton}
        >
          <Text style={styles.startButtonText}>게임 시작하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#555656",
  },

  scrollView: {
    flex: 1,
    backgroundColor: "#555656",
  },

  scrollContent: {
    paddingHorizontal: 47,
    paddingTop: 24,
    paddingBottom: 80,
    backgroundColor: "#555656",
  },

  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  exitArea: {
    flexDirection: "row",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 42,
    color: "#FFFFFF",
    marginRight: 12,
  },

  exitText: {
    fontSize: 18,
    color: "#FFFFFF",
    marginRight: 12,
  },

  handIcon: {
    fontSize: 27,
  },

  soundIcon: {
    fontSize: 30,
    color: "#FFFFFF",
  },

  logoArea: {
    alignItems: "center",
    marginTop: 95,
    marginBottom: 74,
  },

  logoText: {
    fontSize: 52,
    fontWeight: "800",
    color: "#D9D9D9",
    letterSpacing: 8,
  },

  subTitle: {
    marginTop: 8,
    fontSize: 24,
    color: "#D9D9D9",
    letterSpacing: 8,
  },

  levelList: {
    width: "100%",
  },

  levelCard: {
    width: "100%",
    height: 94,
    borderRadius: 18,
    paddingHorizontal: 32,
    marginBottom: 26,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    overflow: "hidden",
  },

  defaultLevelCard: {
    backgroundColor: "#BDBDBD",
  },

  selectedLevelCard: {
    backgroundColor: "#D9D9D9",
  },

  levelTextArea: {
    flexShrink: 1,
  },

  levelTitle: {
    fontSize: 27,
    fontWeight: "700",
    color: "#3F3F3F",
    marginBottom: 6,
  },

  levelLabel: {
    fontSize: 18,
    color: "#777777",
  },

  stars: {
    fontSize: 36,
    color: "#4A4A4A",
    letterSpacing: -2,
  },

  startButton: {
    width: 290,
    height: 90,
    borderRadius: 24,
    borderWidth: 5,
    borderColor: "#D9D9D9",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 39,
  },

  startButtonText: {
    fontSize: 34,
    fontWeight: "700",
    color: "#D9D9D9",
  },
});
