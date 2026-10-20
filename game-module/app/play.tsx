import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VolumeSettingsButton from "../src/VolumeSettingsButton";
import SmartGloveStatusIcon from "../src/SmartGloveStatusIcon";
import { Gesture, Side } from "../src/gloveInput";
import { useAudioSettings } from "../src/audioSettings";
import { subscribeSmartGloveInput } from "../src/smartGloveBle";

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
const LEVEL_SETTINGS: Record<string, { fallDuration: number; scissorsEnabled: boolean }> = {
  "1": { fallDuration: 5000, scissorsEnabled: false },
  "2": { fallDuration: 4250, scissorsEnabled: false },
  "3": { fallDuration: 3500, scissorsEnabled: true },
  "4": { fallDuration: 2750, scissorsEnabled: true },
  "5": { fallDuration: 2250, scissorsEnabled: true }
};
const SPAWN_INTERVAL = 2600;
const FEEDBACK_DURATION = 750;
const RESULT_DELAY = 1500;
const HIT_ZONE_PX = 90;
const TOTAL_PAIRS = 10;

const GESTURE_EMOJI: Record<GestureType, string> = {
  PALM: "🖐️",
  SCISSORS: "✌️",
  FIST: "✊"
};

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function GamePlayScreen() {
  const { level } = useLocalSearchParams<{ level?: string }>();
  const { fallDuration, scissorsEnabled } = LEVEL_SETTINGS[level ?? "1"] ?? LEVEL_SETTINGS["1"];
  const { settings, ready: audioReady } = useAudioSettings();
  const greatPlayer = useAudioPlayer(require("../assets/sounds/great.mp3"));
  const closePlayer = useAudioPlayer(require("../assets/sounds/close.mp3"));
  const missPlayer = useAudioPlayer(require("../assets/sounds/miss.mp3"));
  const feedbackSoundIdRef = useRef(0);

  useEffect(() => {
    for (const player of [greatPlayer, closePlayer, missPlayer]) {
      player.volume = settings.effectsVolume;
      player.muted = !audioReady || settings.effectsMuted;
    }
  }, [greatPlayer, closePlayer, missPlayer, audioReady, settings.effectsVolume, settings.effectsMuted]);

  const playFeedbackSound = useCallback(async (type: FeedbackType) => {
    const soundId = ++feedbackSoundIdRef.current;
    try {
      greatPlayer.pause();
      closePlayer.pause();
      missPlayer.pause();
      const player = { great: greatPlayer, close: closePlayer, miss: missPlayer }[type];
      await player.seekTo(0);
      if (soundId === feedbackSoundIdRef.current) player.play();
    } catch (error) {
      console.warn("Feedback sound playback failed:", error);
    }
  }, [greatPlayer, closePlayer, missPlayer]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [score, setScore] = useState(0);
  const [consecutiveCount, setConsecutiveCount] = useState(0);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [columnHeight, setColumnHeight] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bleStatus, setBleStatus] = useState("대기중");
  const [receivedGestures, setReceivedGestures] = useState<Partial<Record<Side, Gesture>>>({});

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
      const resultTimer = setTimeout(() => {
        if (isUnmountedRef.current || navigatedRef.current) return;
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
      }, RESULT_DELAY);
      return () => clearTimeout(resultTimer);
    }
  }, [gameOver, notes.length, level]);

  const triggerFeedback = useCallback((type: FeedbackType) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedback(type);
    setFeedbackVisible(true);
    void playFeedbackSound(type);
    feedbackTimerRef.current = setTimeout(() => {
      if (!isUnmountedRef.current) setFeedbackVisible(false);
    }, FEEDBACK_DURATION);
  }, [playFeedbackSound]);

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

      const gestureRoll = Math.random();
      const note: Note = {
        id: genId(),
        pairId,
        // 1~2레벨: PALM/FIST 각 50%, 3~5레벨: SCISSORS 25%, PALM/FIST 각 37.5% (양손 각각 독립 생성).
        type: scissorsEnabled
          ? gestureRoll < 0.25 ? "SCISSORS" : gestureRoll < 0.625 ? "PALM" : "FIST"
          : gestureRoll < 0.5 ? "PALM" : "FIST",
        lane,
        startTime: Date.now(),
        yAnim: new Animated.Value(-NOTE_SIZE)
      };

      const next = [...notesRef.current, note];
      notesRef.current = next;
      if (!isUnmountedRef.current) setNotes([...next]);

      Animated.timing(note.yAnim, {
        toValue: colH,
        duration: fallDuration,
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
    [resolveLane, fallDuration, scissorsEnabled]
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
      feedbackSoundIdRef.current += 1;
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleGesture = useCallback(
    (lane: Lane, gesture: GestureType) => {
      latestGestureRef.current[lane] = gesture;

      // SCISSORS도 동일한 자세 비교를 사용한다. SCISSORS 노트와 일치하면 정답이다.

      const colH = columnHeightRef.current;
      const laneNotes = notesRef.current.filter((item) => item.lane === lane);
      if (laneNotes.length === 0) return;

      const now = Date.now();
      const totalFall = colH + NOTE_SIZE;

      let bottommost: Note | null = null;
      let highestY = -Infinity;

      for (const note of laneNotes) {
        const elapsed = now - note.startTime;
        const progress = Math.min(elapsed / fallDuration, 1);
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
    [resolveLane, fallDuration]
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

    subscribeSmartGloveInput({
      onInput: (input) => {
        if (!isMounted) return;
        setReceivedGestures((current) => ({ ...current, [input.side]: input.gesture }));
        handleInput(input.side, input.gesture);
      },
      onError: (error) => {
        if (isMounted) {
          setBleStatus(error.message);
        }
      }
    })
      .then((unsubscribe) => {
        cleanup = unsubscribe;
        if (isMounted) {
          setBleStatus("대기중");
        }
      })
      .catch((error) => {
        if (isMounted) {
          setBleStatus(error instanceof Error ? error.message : "BLE 입력 연결 실패");
        }
      });

    return () => {
      isMounted = false;
      cleanup?.();
    };
  }, [handleInput]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#535353]">
      <View className="px-[16px]">
        <GameHeader />
      </View>

      <GameScoreBar
        score={score}
        consecutiveCount={consecutiveCount}
        exerciseCount={exerciseCount}
      />

      <View className="mx-[16px] mb-[2px] h-[24px] flex-row items-center gap-[10px]">
        <View className="min-w-0 flex-1 flex-row items-center justify-center gap-[6px]">
          <Ionicons name="bluetooth" size={15} color="#8FD0A8" />
          <Text numberOfLines={1} className="min-w-0 shrink text-[#D9D9D9] text-[11px] font-semibold">
            왼손: {receivedGestures.LEFT ?? bleStatus}
          </Text>
        </View>
        <View className="min-w-0 flex-1 flex-row items-center justify-center gap-[6px]">
          <Ionicons name="bluetooth" size={15} color="#8FD0A8" />
          <Text numberOfLines={1} className="min-w-0 shrink text-[#D9D9D9] text-[11px] font-semibold">
            오른손: {receivedGestures.RIGHT ?? bleStatus}
          </Text>
        </View>
      </View>

      <View className="px-[16px] mt-[2px] mb-[4px] flex-row">
        <Text className="flex-1 text-[#D9D9D9] text-center text-[15px] font-semibold">왼손</Text>
        <View className="w-[10px]" />
        <Text className="flex-1 text-[#D9D9D9] text-center text-[15px] font-semibold">오른손</Text>
      </View>

      <View className="flex-1 px-[16px] mb-[8px] flex-row">
        <View
          className="flex-1 overflow-hidden rounded-[14px] bg-[#DCDCDC]"
          onLayout={(event) => {
            const h = event.nativeEvent.layout.height;
            columnHeightRef.current = h;
            setColumnHeight(h);
          }}
        >
          {notes
            .filter((item) => item.lane === "left")
            .map((note) => (
              <View
                key={note.id}
                className="absolute top-[0px] left-[0px] right-[0px] h-[56px] items-center justify-center"
              >
                <Animated.View style={{ transform: [{ translateY: note.yAnim }] }}>
                  <View className="w-[56px] h-[56px] items-center justify-center rounded-[10px] bg-[rgba(255,255,255,0.8)]">
                    <Text className="text-[36px]">{GESTURE_EMOJI[note.type]}</Text>
                  </View>
                </Animated.View>
              </View>
            ))}
          <DashedHitLine />
        </View>

        <View className="w-[10px]" />

        <View className="flex-1 overflow-hidden rounded-[14px] bg-[#DCDCDC]">
          {notes
            .filter((item) => item.lane === "right")
            .map((note) => (
              <View
                key={note.id}
                className="absolute top-[0px] left-[0px] right-[0px] h-[56px] items-center justify-center"
              >
                <Animated.View style={{ transform: [{ translateY: note.yAnim }] }}>
                  <View className="w-[56px] h-[56px] items-center justify-center rounded-[10px] bg-[rgba(255,255,255,0.8)]">
                    <Text className="text-[36px]">{GESTURE_EMOJI[note.type]}</Text>
                  </View>
                </Animated.View>
              </View>
            ))}
          <DashedHitLine />
        </View>

        <FeedbackModal visible={feedbackVisible} type={feedback} />
      </View>

      <View className="px-[16px] pb-[12px]">
        <Text className="mb-[6px] text-[#D9D9D9] text-center text-[11px]">[임시용] 제스처 입력</Text>
        <View className="flex-row">
          <View className="flex-1 flex-row gap-[8px]">
            <TouchableOpacity
              className="flex-1 h-[56px] items-center justify-center rounded-[12px] bg-[#7A8894]"
              onPress={() => handleInput("LEFT", "FIST")}
            >
              <Text className="text-[28px]">✊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 h-[56px] items-center justify-center rounded-[12px] bg-[#7A8894]"
              onPress={() => handleInput("LEFT", "PALM")}
            >
              <Text className="text-[28px]">🖐️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="왼손 SCISSORS 입력"
              className="flex-1 h-[56px] items-center justify-center rounded-[12px] bg-[#7A8894]"
              onPress={() => handleInput("LEFT", "SCISSORS")}
            >
              <Text className="text-[28px]">{GESTURE_EMOJI.SCISSORS}</Text>
            </TouchableOpacity>
          </View>
          <View className="w-[10px]" />
          <View className="flex-1 flex-row gap-[8px]">
            <TouchableOpacity
              className="flex-1 h-[56px] items-center justify-center rounded-[12px] bg-[#7A8894]"
              onPress={() => handleInput("RIGHT", "FIST")}
            >
              <Text className="text-[28px]">✊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 h-[56px] items-center justify-center rounded-[12px] bg-[#7A8894]"
              onPress={() => handleInput("RIGHT", "PALM")}
            >
              <Text className="text-[28px]">🖐️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="오른손 SCISSORS 입력"
              className="flex-1 h-[56px] items-center justify-center rounded-[12px] bg-[#7A8894]"
              onPress={() => handleInput("RIGHT", "SCISSORS")}
            >
              <Text className="text-[28px]">{GESTURE_EMOJI.SCISSORS}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function GameHeader() {
  return (
    <View className="w-full pt-[20px] flex-row items-center justify-between">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="나가기"
        className="min-h-[48px] flex-row items-center pr-[16px]"
        onPress={() => router.back()}
      >
        <Ionicons name="exit-outline" size={34} color="#FFFFFF" />
        <Text className="ml-[12px] text-[#FFFFFF] text-[20px] font-medium">나가기</Text>
        <View className="ml-[12px]">
          <SmartGloveStatusIcon size={28} />
        </View>
      </Pressable>

      <VolumeSettingsButton />
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
    <View className="py-[10px] flex-row items-center justify-evenly">
      <StatItem value={score.toLocaleString()} label="점수" />
      <StatItem value={String(consecutiveCount)} label="연속성공횟수" />
      <StatItem value={String(exerciseCount)} label="운동량" />
    </View>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-[#D9D9D9] text-[22px] font-bold">{value}</Text>
      <Text className="mt-[2px] text-[#D9D9D9] text-[18px]">{label}</Text>
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
      className: "bg-[rgba(118,134,156,0.44)] border-[rgba(91,106,137,0.55)]"
    },
    close: {
      label: "아쉬워요 !",
      className: "bg-[rgba(125,156,118,0.44)] border-[rgba(109,137,91,0.55)]"
    },
    miss: {
      label: "실수예요 !",
      className: "bg-[rgba(156,118,118,0.44)] border-[rgba(137,91,91,0.55)]"
    }
  }[type];

  return (
    <View pointerEvents="none" className="absolute top-[0px] right-[0px] bottom-[0px] left-[0px] z-[10] items-center justify-start pt-[140px]">
      <View
        className={`px-[48px] py-[12px] rounded-[12px] border-[2px] ${config.className}`}
      >
        <Text className="text-[#FFFFFF] text-[20px] font-bold">{config.label}</Text>
      </View>
    </View>
  );
}

function DashedHitLine() {
  return (
    <View className="absolute left-[8px] right-[8px] bottom-[68px] flex-row items-center overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <View key={i} className="w-[6px] h-[2px] mr-[5px] bg-[#999999]" />
      ))}
    </View>
  );
}
