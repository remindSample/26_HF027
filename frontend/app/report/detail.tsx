import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// 데모용 mock 데이터
const WORD_USAGE = [
  { label: "5월", value: 0.82, isUser: true },
  { label: "4월", value: 0.65, isUser: false },
  { label: "3월", value: 0.70, isUser: false },
  { label: "2월", value: 0.58, isUser: false },
  { label: "평균", value: 0.68, isUser: false },
];

const COMPLEXITY = [
  { label: "5월", value: 8.2, isUser: true },
  { label: "4월", value: 6.5, isUser: false },
  { label: "3월", value: 7.0, isUser: false },
  { label: "2월", value: 5.8, isUser: false },
  { label: "평균", value: 6.9, isUser: false },
];

const SENTIMENT = [
  { label: "긍정", value: 70, color: "#5BA4A4" },
  { label: "중립", value: 20, color: "#BBBBBB" },
  { label: "부정", value: 10, color: "#E57373" },
];

function HorizontalBar({
  label, value, maxValue, isUser, unit,
}: {
  label: string; value: number; maxValue: number; isUser: boolean; unit: string;
}) {
  const pct = Math.min((value / maxValue) * 100, 100);
  return (
    <View style={bar.row}>
      <Text style={bar.label}>{label}</Text>
      <View style={bar.track}>
        <View
          style={[
            bar.fill,
            { width: `${pct}%` as any },
            isUser ? bar.fillUser : bar.fillAvg,
          ]}
        />
      </View>
      <Text style={bar.value}>{value}{unit}</Text>
    </View>
  );
}

function SentimentBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={sent.row}>
      <Text style={sent.label}>{label}</Text>
      <View style={sent.track}>
        <View style={[sent.fill, { width: `${value}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={sent.value}>{value}</Text>
    </View>
  );
}

export default function DetailScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>상세 지표</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 단어 사용률 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>단어 사용률 ❓</Text>
            <View style={styles.legend}>
              <View style={[styles.dot, { backgroundColor: "#BBBBBB" }]} />
              <Text style={styles.legendText}>평균치</Text>
              <View style={[styles.dot, { backgroundColor: "#5BA4A4" }]} />
              <Text style={styles.legendText}>사용자</Text>
            </View>
          </View>
          {WORD_USAGE.map((d) => (
            <HorizontalBar
              key={d.label}
              label={d.label}
              value={d.value}
              maxValue={1}
              isUser={d.isUser}
              unit=""
            />
          ))}
        </View>

        {/* 언어 복잡도 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>언어 복잡도 ❓</Text>
            <View style={styles.legend}>
              <View style={[styles.dot, { backgroundColor: "#BBBBBB" }]} />
              <Text style={styles.legendText}>평균치</Text>
              <View style={[styles.dot, { backgroundColor: "#5BA4A4" }]} />
              <Text style={styles.legendText}>사용자</Text>
            </View>
          </View>
          {COMPLEXITY.map((d) => (
            <HorizontalBar
              key={d.label}
              label={d.label}
              value={d.value}
              maxValue={10}
              isUser={d.isUser}
              unit=""
            />
          ))}
        </View>

        {/* 손바닥 게임 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>손바닥 게임 ❓</Text>
          <View style={styles.gameResult}>
            <Text style={styles.gameScore}>정확도 87%</Text>
            <Text style={styles.gameDetail}>성공 26회 / 총 30회</Text>
            <Text style={styles.gameDiff}>↑ 지난달 대비 +5%</Text>
          </View>
        </View>

        {/* 감정 분석 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>♡ 감정 분석 (최근 한달 기록)</Text>
          <View style={{ marginTop: 12, gap: 10 }}>
            {SENTIMENT.map((d) => (
              <SentimentBar key={d.label} label={d.label} value={d.value} color={d.color} />
            ))}
          </View>
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
  card: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, gap: 10, elevation: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#333" },
  legend: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: "#777", marginRight: 4 },
  gameResult: { alignItems: "center", paddingVertical: 8, gap: 6 },
  gameScore: { fontSize: 28, fontWeight: "800", color: "#5BA4A4" },
  gameDetail: { fontSize: 14, color: "#555" },
  gameDiff: { fontSize: 14, color: "#5BA4A4", fontWeight: "600" },
  bottomNav: {
    height: 70, flexDirection: "row", justifyContent: "space-around",
    alignItems: "center", backgroundColor: "#FFFFFF",
    borderTopWidth: 1, borderTopColor: "#E0E0E0",
  },
  navText: { fontSize: 15, fontWeight: "500", color: "#AAAAAA" },
});

const bar = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 4 },
  label: { width: 36, fontSize: 12, color: "#666", textAlign: "right" },
  track: {
    flex: 1, height: 18, backgroundColor: "#EEEEEE",
    borderRadius: 9, overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 9 },
  fillUser: { backgroundColor: "#5BA4A4" },
  fillAvg: { backgroundColor: "#AAAAAA" },
  value: { width: 36, fontSize: 12, color: "#444" },
});

const sent = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { width: 30, fontSize: 13, color: "#555" },
  track: { flex: 1, height: 22, backgroundColor: "#EEEEEE", borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
  value: { width: 28, fontSize: 13, fontWeight: "700", color: "#444", textAlign: "right" },
});
