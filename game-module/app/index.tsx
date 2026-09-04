import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Side } from "../src/gloveInput";
import { getConnectedSmartGloveSides, isSmartGloveConnected } from "../src/smartGloveBle";

const CONNECTED_HAND_COLOR = "#F5A142";
const BOTH_CONNECTED_HAND_COLOR = "#9FE27B";

function areBothHandsConnected(sides: Side[]) {
  return sides.includes("LEFT") && sides.includes("RIGHT");
}

export default function HomeScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.headerWrap}>
            <GameHeader />
          </View>

          <View style={styles.inner}>
            <View style={styles.logoArea}>
              <Text style={styles.logoText}>Re:Mind</Text>
              <Text style={styles.logoSubText}>인지 훈련게임</Text>
            </View>

            <View style={styles.buttonArea}>
              <Pressable
                style={styles.menuButton}
                onPress={() => router.push("/connection")}
              >
                <Text style={styles.menuButtonText}>스마트 장갑 연동</Text>
              </Pressable>

              <Pressable
                style={styles.menuButton}
                onPress={() => router.push("/level" as never)}
              >
                <Text style={styles.menuButtonText}>게임 시작하기</Text>
              </Pressable>
            </View>

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

              <Text style={styles.guideText}>
                연속 성공시 보너스 점수가 있어요
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GameHeader() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedSides, setConnectedSides] = useState<Side[]>(getConnectedSmartGloveSides());

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      isSmartGloveConnected().then((connected) => {
        if (isActive) {
          setIsConnected(connected);
          setConnectedSides(getConnectedSmartGloveSides());
        }
      });

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <View style={styles.gameHeader}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="나가기"
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="exit-outline" size={34} color="#FFFFFF" />
        <Text style={styles.backText}>나가기</Text>
        <View style={styles.deviceIconWrap}>
          <Ionicons
            name="hand-left"
            size={28}
            color={
              isConnected
                ? areBothHandsConnected(connectedSides)
                  ? BOTH_CONNECTED_HAND_COLOR
                  : CONNECTED_HAND_COLOR
                : "#E57474"
            }
          />
        </View>
      </Pressable>

      <Ionicons name="volume-high-outline" size={34} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#55595A"
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#55595A"
  },
  container: {
    flex: 1,
    minHeight: "100%",
    paddingTop: 24,
    paddingBottom: 48,
    backgroundColor: "#55595A"
  },
  headerWrap: {
    paddingHorizontal: 16
  },
  gameHeader: {
    width: "100%",
    paddingTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  backButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16
  },
  backText: {
    marginLeft: 12,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "500"
  },
  deviceIconWrap: {
    marginLeft: 12
  },
  inner: {
    paddingHorizontal: 40
  },
  logoArea: {
    marginTop: 60,
    alignItems: "center"
  },
  logoText: {
    alignSelf: "flex-start",
    marginLeft: 30,
    color: "#D7D7D7",
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: 8
  },
  logoSubText: {
    marginTop: 24,
    color: "#D7D7D7",
    fontSize: 24,
    letterSpacing: 8
  },
  buttonArea: {
    marginTop: 50,
    gap: 28
  },
  menuButton: {
    height: 85,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    borderColor: "#D7D7D7",
    borderRadius: 20,
    backgroundColor: "#D7D7D7"
  },
  menuButtonText: {
    color: "#4A4A4A",
    fontSize: 34,
    fontWeight: "600",
    letterSpacing: 2
  },
  guideArea: {
    marginTop: 86
  },
  guideTitle: {
    marginBottom: 30,
    color: "#E5E5E5",
    fontSize: 32,
    fontWeight: "900"
  },
  guideText: {
    marginBottom: 28,
    color: "#E5E5E5",
    fontSize: 18,
    lineHeight: 38,
    fontWeight: "500"
  }
});
