import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    level?: string;
    score?: string;
    hits?: string;
    misses?: string;
    accuracy?: string;
    maxCombo?: string;
  }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.summary}>
          <View style={styles.checkIcon}>
            <Ionicons name="checkmark" size={32} color="#172018" />
          </View>
          <Text style={styles.title}>Test complete</Text>
          <Text style={styles.subtitle}>Level: {params.level ?? "normal"}</Text>
        </View>

        <View style={styles.stats}>
          <Stat label="Score" value={params.score ?? "0"} />
          <Stat label="Accuracy" value={`${params.accuracy ?? "0"}%`} />
          <Stat label="Hits" value={params.hits ?? "0"} />
          <Stat label="Misses" value={params.misses ?? "0"} />
          <Stat label="Max combo" value={params.maxCombo ?? "0"} />
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              router.replace({
                pathname: "/play",
                params: { level: params.level ?? "normal" }
              })
            }
          >
            <Text style={styles.primaryButtonText}>Retry</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.replace("/")}>
            <Text style={styles.secondaryButtonText}>Back to module</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#202427"
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28
  },
  summary: {
    alignItems: "center",
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderColor: "#3B454D"
  },
  checkIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#8FD0A8"
  },
  title: {
    marginTop: 20,
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 8,
    color: "#B8C4CB",
    fontSize: 15
  },
  stats: {
    marginTop: 28,
    gap: 12
  },
  stat: {
    height: 62,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    backgroundColor: "#2B3338"
  },
  statLabel: {
    color: "#AAB6BD",
    fontSize: 15,
    fontWeight: "700"
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900"
  },
  actions: {
    marginTop: "auto",
    gap: 12
  },
  primaryButton: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#8FD0A8"
  },
  primaryButtonText: {
    color: "#172018",
    fontSize: 17,
    fontWeight: "900"
  },
  secondaryButton: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#77838B"
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800"
  }
});
