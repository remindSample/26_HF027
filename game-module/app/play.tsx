import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, Side } from "../src/gloveInput";
import {
  getConnectedSmartGloveSides,
  isSmartGloveConnected,
  subscribeSmartGloveInput
} from "../src/smartGloveBle";

type GestureType = Gesture;
type Lane = "left" | "right";
type LaneResult = "correct" | "wrong" | "pending";
type FeedbackType = "great" | "close" | "miss";

interface Note {
  id: string;
  pairId: string;
  type: GestureType;
  lane: Lane;
  startTime: number;
  yAnim: Animated.Value;
}

const NOTE_SIZE = 56;
const FALL_DURATION = 3500;
const SPAWN_INTERVAL = 2600;
const FEEDBACK_DURATION = 750;
const HIT_ZONE_PX = 90;
const TOTAL_PAIRS = 10;
const CONNECTED_HAND_COLOR = "#F5A142";
const BOTH_CONNECTED_HAND_COLOR = "#9FE27B";

function areBothHandsConnected(sides: Side[]) {
  return sides.includes("LEFT") && sides.includes("RIGHT");
}

const GESTURE_EMOJI: Record<GestureType, string> = {
  PALM: "🖐️",
  FIST: "✊"
};

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function GamePlayScreen() {
  const { level } = useLocalSearchParams<{ level?: string }>();

  const [notes, setNotes] = useState<Note[]>([]);
  const [score, setScore] = useState(0);
  const [consecutiveCount, setConsecutiveCount] = useState(0);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [columnHeight, setColumnHeight] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bleStatus, setBleStatus] = useState("BLE 대기중");
  const [isBleConnected, setIsBleConnected] = useState(false);
  const [connectedSides, setConnectedSides] = useState<Side[]>(getConnectedSmartGloveSides());

  const notesRef = useRef<Note[]>([]);
  const columnHeightRef = useRef(0);
  const consecutiveRef = useRef(0);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUnmountedRef = useRef(false);
  const latestGestureRef = useRef<Partial<Record<Lane, GestureType>>>({});
  const pairStateRef = useRef<Map<string, { left: LaneResult; right: LaneResult }>>(
    new Map()
  );

  const gameOverRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalPairsSpawnedRef = useRef(0);
  const navigatedRef = useRef(false);
  const hasStartedRef = useRef(false);

  const scoreRef = useRef(0);
  const exerciseCountRef = useRef(0);
  const maxComboRef = useRef(0);
  const totalPairsRef = useRef(0);
  const correctPairsRef = useRef(0);

  useEffect(() => {
    if (gameOver && notes.length === 0 && !navigatedRef.current) {
      navigatedRef.current = true;
      const accuracy =
        totalPairsRef.current > 0
          ? Math.round((correctPairsRef.current / totalPairsRef.current) * 100)
          : 0;

      router.replace({
        pathname: "/result",
        params: {
          score: String(scoreRef.current),
          level: level ?? "1",
          accuracy: String(accuracy),
          maxCombo: String(maxComboRef.current),
          exerciseCount: String(exerciseCountRef.current)
        }
      });
    }
  }, [gameOver, notes.length, level]);

  const triggerFeedback = useCallback((type: FeedbackType) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedback(type);
    setFeedbackVisible(true);
    feedbackTimerRef.current = setTimeout(() => {
      if (!isUnmountedRef.current) setFeedbackVisible(false);
    }, FEEDBACK_DURATION);
  }, []);

  const resolveLane = useCallback(
    (pairId: string, lane: Lane, result: "correct" | "wrong") => {
      const state = pairStateRef.current.get(pairId);
      if (!state) return;

      state[lane] = result;
      if (state.left === "pending" || state.right === "pending") return;

      pairStateRef.current.delete(pairId);
      totalPairsRef.current += 1;

      if (state.left === "correct" && state.right === "correct") {
        correctPairsRef.current += 1;
        if (!isUnmountedRef.current) triggerFeedback("great");
        scoreRef.current += 100;
        setScore(scoreRef.current);
        consecutiveRef.current += 1;
        maxComboRef.current = Math.max(maxComboRef.current, consecutiveRef.current);
        if (!isUnmountedRef.current) setConsecutiveCount(consecutiveRef.current);
      } else if (state.left === "correct" || state.right === "correct") {
        if (!isUnmountedRef.current) triggerFeedback("close");
        consecutiveRef.current = 0;
        if (!isUnmountedRef.current) setConsecutiveCount(0);
      } else {
        if (!isUnmountedRef.current) triggerFeedback("miss");
        consecutiveRef.current = 0;
        if (!isUnmountedRef.current) setConsecutiveCount(0);
      }
    },
    [triggerFeedback]
  );

  const spawnNote = useCallback(
    (lane: Lane, pairId: string) => {
      const colH = columnHeightRef.current;
      if (colH === 0) return;

      const note: Note = {
        id: genId(),
        pairId,
        type: Math.random() > 0.5 ? "PALM" : "FIST",
        lane,
        startTime: Date.now(),
        yAnim: new Animated.Value(-NOTE_SIZE)
      };

      const next = [...notesRef.current, note];
      notesRef.current = next;
      if (!isUnmountedRef.current) setNotes([...next]);

      Animated.timing(note.yAnim, {
        toValue: colH,
        duration: FALL_DURATION,
        useNativeDriver: true
      }).start(({ finished }) => {
        if (!finished) return;
        const stillExists = notesRef.current.some((item) => item.id === note.id);
        if (stillExists) {
          const after = notesRef.current.filter((item) => item.id !== note.id);
          notesRef.current = after;
          if (!isUnmountedRef.current) setNotes([...after]);
          resolveLane(
            note.pairId,
            note.lane,
            latestGestureRef.current[note.lane] === note.type ? "correct" : "wrong"
          );
        }
      });
    },
    [resolveLane]
  );

  const spawnPair = useCallback(() => {
    const colH = columnHeightRef.current;
    if (colH === 0 || gameOverRef.current) return;
    const leftCount = notesRef.current.filter((item) => item.lane === "left").length;
    const rightCount = notesRef.current.filter((item) => item.lane === "right").length;
    if (leftCount >= 2 || rightCount >= 2) return;

    const pairId = genId();
    pairStateRef.current.set(pairId, { left: "pending", right: "pending" });
    spawnNote("left", pairId);
    spawnNote("right", pairId);

    totalPairsSpawnedRef.current += 1;
    if (totalPairsSpawnedRef.current >= TOTAL_PAIRS) {
      gameOverRef.current = true;
      setGameOver(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [spawnNote]);

  useEffect(() => {
    if (columnHeight === 0) return;

    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      spawnPair();
    }

    intervalRef.current = setInterval(() => {
      if (!isUnmountedRef.current) spawnPair();
    }, SPAWN_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [columnHeight, spawnPair]);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleGesture = useCallback(
    (lane: Lane, gesture: GestureType) => {
      latestGestureRef.current[lane] = gesture;

      const colH = columnHeightRef.current;
      const laneNotes = notesRef.current.filter((item) => item.lane === lane);
      if (laneNotes.length === 0) return;

      const now = Date.now();
      const totalFall = colH + NOTE_SIZE;

      let bottommost: Note | null = null;
      let highestY = -Infinity;

      for (const note of laneNotes) {
        const elapsed = now - note.startTime;
        const progress = Math.min(elapsed / FALL_DURATION, 1);
        const y = -NOTE_SIZE + progress * totalFall;
        if (y > highestY) {
          highestY = y;
          bottommost = note;
        }
      }

      if (!bottommost) return;

      const hitZoneStart = colH - NOTE_SIZE - HIT_ZONE_PX;
      if (highestY < hitZoneStart) return;

      bottommost.yAnim.stopAnimation();
      const next = notesRef.current.filter((item) => item.id !== bottommost?.id);
      notesRef.current = next;
      if (!isUnmountedRef.current) setNotes([...next]);

      exerciseCountRef.current += 1;
      setExerciseCount(exerciseCountRef.current);
      resolveLane(
        bottommost.pairId,
        lane,
        bottommost.type === gesture ? "correct" : "wrong"
      );
    },
    [resolveLane]
  );

  const handleInput = useCallback(
    (side: Side, gesture: Gesture) => {
      handleGesture(side === "LEFT" ? "left" : "right", gesture);
    },
    [handleGesture]
  );

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let isMounted = true;

    isSmartGloveConnected().then((connected) => {
      if (isMounted) {
        setIsBleConnected(connected);
        setConnectedSides(getConnectedSmartGloveSides());
      }
    });

    subscribeSmartGloveInput({
      onInput: (input) => handleInput(input.side, input.gesture),
      onMessage: (message) => {
        if (isMounted) {
          setIsBleConnected(true);
          setConnectedSides(getConnectedSmartGloveSides());
          setBleStatus(`BLE 수신: ${message}`);
        }
      },
      onError: (error) => {
        if (isMounted) {
          setIsBleConnected(false);
          setBleStatus(error.message);
        }
      }
    })
      .then((unsubscribe) => {
        cleanup = unsubscribe;
        if (isMounted) {
          setIsBleConnected(true);
          setConnectedSides(getConnectedSmartGloveSides());
          setBleStatus("BLE 입력 수신중");
        }
      })
      .catch((error) => {
        if (isMounted) {
          setIsBleConnected(false);
          setBleStatus(error instanceof Error ? error.message : "BLE 입력 연결 실패");
        }
      });

    return () => {
      isMounted = false;
      cleanup?.();
    };
  }, [handleInput]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.headerWrap}>
        <GameHeader isConnected={isBleConnected} connectedSides={connectedSides} />
      </View>

      <GameScoreBar
        score={score}
        consecutiveCount={consecutiveCount}
        exerciseCount={exerciseCount}
      />

      <View style={styles.bleStatusBar}>
        <Ionicons name="bluetooth" size={15} color="#8FD0A8" />
        <Text style={styles.bleStatusText}>{bleStatus}</Text>
      </View>

      <View style={styles.laneLabels}>
        <Text style={styles.laneLabelText}>왼손</Text>
        <View style={styles.columnGap} />
        <Text style={styles.laneLabelText}>오른손</Text>
      </View>

      <View style={styles.gameArea}>
        <View
          style={styles.column}
          onLayout={(event) => {
            const h = event.nativeEvent.layout.height;
            columnHeightRef.current = h;
            setColumnHeight(h);
          }}
        >
          {notes
            .filter((item) => item.lane === "left")
            .map((note) => (
              <Animated.View
                key={note.id}
                style={[styles.noteWrap, { transform: [{ translateY: note.yAnim }] }]}
              >
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>{GESTURE_EMOJI[note.type]}</Text>
                </View>
              </Animated.View>
            ))}
          <DashedHitLine />
        </View>

        <View style={styles.columnGap} />

        <View style={styles.column}>
          {notes
            .filter((item) => item.lane === "right")
            .map((note) => (
              <Animated.View
                key={note.id}
                style={[styles.noteWrap, { transform: [{ translateY: note.yAnim }] }]}
              >
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>{GESTURE_EMOJI[note.type]}</Text>
                </View>
              </Animated.View>
            ))}
          <DashedHitLine />
        </View>

        <FeedbackModal visible={feedbackVisible} type={feedback} />
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputTitle}>[임시용] 제스처 입력</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => handleInput("LEFT", "FIST")}
            >
              <Text style={styles.inputEmoji}>✊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => handleInput("LEFT", "PALM")}
            >
              <Text style={styles.inputEmoji}>🖐️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.columnGap} />
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => handleInput("RIGHT", "FIST")}
            >
              <Text style={styles.inputEmoji}>✊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => handleInput("RIGHT", "PALM")}
            >
              <Text style={styles.inputEmoji}>🖐️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function GameHeader({
  isConnected,
  connectedSides
}: {
  isConnected: boolean;
  connectedSides: Side[];
}) {
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

function GameScoreBar({
  score,
  consecutiveCount,
  exerciseCount
}: {
  score: number;
  consecutiveCount: number;
  exerciseCount: number;
}) {
  return (
    <View style={styles.scoreBar}>
      <StatItem value={score.toLocaleString()} label="점수" />
      <StatItem value={String(consecutiveCount)} label="연속성공횟수" />
      <StatItem value={String(exerciseCount)} label="운동량" />
    </View>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FeedbackModal({
  visible,
  type
}: {
  visible: boolean;
  type: FeedbackType | null;
}) {
  if (!visible || !type) return null;

  const config = {
    great: {
      label: "잘했어요 !",
      bgColor: "rgba(118,134,156,0.44)",
      borderColor: "rgba(91,106,137,0.55)"
    },
    close: {
      label: "아쉬워요 !",
      bgColor: "rgba(125,156,118,0.44)",
      borderColor: "rgba(109,137,91,0.55)"
    },
    miss: {
      label: "실수예요 !",
      bgColor: "rgba(156,118,118,0.44)",
      borderColor: "rgba(137,91,91,0.55)"
    }
  }[type];

  return (
    <View pointerEvents="none" style={styles.feedbackOverlay}>
      <View
        style={[
          styles.feedbackBox,
          { backgroundColor: config.bgColor, borderColor: config.borderColor }
        ]}
      >
        <Text style={styles.feedbackText}>{config.label}</Text>
      </View>
    </View>
  );
}

function DashedHitLine() {
  return (
    <View style={styles.hitLine}>
      {Array.from({ length: 30 }).map((_, i) => (
        <View key={i} style={styles.hitDash} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#535353"
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
  scoreBar: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  statItem: {
    alignItems: "center"
  },
  statValue: {
    color: "#D9D9D9",
    fontSize: 22,
    fontWeight: "700"
  },
  statLabel: {
    marginTop: 2,
    color: "#D9D9D9",
    fontSize: 18
  },
  bleStatusBar: {
    marginHorizontal: 16,
    marginBottom: 2,
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  bleStatusText: {
    color: "#D9D9D9",
    fontSize: 11,
    fontWeight: "600"
  },
  laneLabels: {
    paddingHorizontal: 16,
    marginTop: 2,
    marginBottom: 4,
    flexDirection: "row"
  },
  laneLabelText: {
    flex: 1,
    color: "#D9D9D9",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600"
  },
  columnGap: {
    width: 10
  },
  gameArea: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row"
  },
  column: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#DCDCDC"
  },
  noteWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 56,
    alignItems: "center",
    justifyContent: "center"
  },
  noteBox: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.8)"
  },
  noteText: {
    fontSize: 36
  },
  hitLine: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 68,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden"
  },
  hitDash: {
    width: 6,
    height: 2,
    marginRight: 5,
    backgroundColor: "#999999"
  },
  feedbackOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 140
  },
  feedbackBox: {
    paddingHorizontal: 48,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2
  },
  feedbackText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700"
  },
  inputSection: {
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  inputTitle: {
    marginBottom: 6,
    color: "#D9D9D9",
    textAlign: "center",
    fontSize: 11
  },
  inputRow: {
    flexDirection: "row"
  },
  inputGroup: {
    flex: 1,
    flexDirection: "row",
    gap: 8
  },
  inputButton: {
    flex: 1,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#7A8894"
  },
  inputEmoji: {
    fontSize: 28
  }
});
