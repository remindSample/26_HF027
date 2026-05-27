import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FeedbackModal, { FeedbackType } from './FeedbackModal'
import GameHeader from './GameHeader'
import GameScoreBar from './GameScoreBar'

type GestureType = 'paper' | 'rock'
type Lane = 'left' | 'right'
type LaneResult = 'correct' | 'wrong' | 'pending'

interface Note {
  id: string
  pairId: string
  type: GestureType
  lane: Lane
  startTime: number
  yAnim: Animated.Value
}

const NOTE_SIZE = 56
const FALL_DURATION = 3500
const SPAWN_INTERVAL = 2600
const FEEDBACK_DURATION = 750
const HIT_ZONE_PX = 90
const TOTAL_PAIRS = 10 // 10쌍 = 20개 노트

const GESTURE_EMOJI: Record<GestureType, string> = {
  paper: '🖐️',
  rock: '✊',
}

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function GamePlayScreen() {
  const { level } = useLocalSearchParams<{ level: string }>()

  const [notes, setNotes] = useState<Note[]>([])
  const [score, setScore] = useState(0)
  const [consecutiveCount, setConsecutiveCount] = useState(0)
  const [exerciseCount, setExerciseCount] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackType | null>(null)
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [columnHeight, setColumnHeight] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const notesRef = useRef<Note[]>([])
  const columnHeightRef = useRef(0)
  const consecutiveRef = useRef(0)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isUnmountedRef = useRef(false)
  const pairStateRef = useRef<Map<string, { left: LaneResult; right: LaneResult }>>(new Map())

  // 게임 종료 추적
  const gameOverRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalPairsSpawnedRef = useRef(0)
  const navigatedRef = useRef(false)
  const hasStartedRef = useRef(false)

  // 결과 화면 전달용 통계
  const scoreRef = useRef(0)
  const exerciseCountRef = useRef(0)
  const maxComboRef = useRef(0)
  const totalPairsRef = useRef(0)
  const correctPairsRef = useRef(0)

  // 모든 노트 소진 후 결과 화면으로 이동
  useEffect(() => {
    if (gameOver && notes.length === 0 && !navigatedRef.current) {
      navigatedRef.current = true
      const accuracy =
        totalPairsRef.current > 0
          ? Math.round((correctPairsRef.current / totalPairsRef.current) * 100)
          : 0
      router.replace({
        pathname: '/game/result',
        params: {
          score: String(scoreRef.current),
          level: level ?? '1',
          accuracy: String(accuracy),
          maxCombo: String(maxComboRef.current),
          exerciseCount: String(exerciseCountRef.current),
        },
      })
    }
  }, [gameOver, notes.length, level])

  const triggerFeedback = useCallback((type: FeedbackType) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    setFeedback(type)
    setFeedbackVisible(true)
    feedbackTimerRef.current = setTimeout(() => {
      if (!isUnmountedRef.current) setFeedbackVisible(false)
    }, FEEDBACK_DURATION)
  }, [])

  // 한 손 결과 기록 → 양손 모두 판정 완료 시 쌍 평가
  const resolveLane = useCallback((pairId: string, lane: Lane, result: 'correct' | 'wrong') => {
    const state = pairStateRef.current.get(pairId)
    if (!state) return

    state[lane] = result
    if (state.left === 'pending' || state.right === 'pending') return

    pairStateRef.current.delete(pairId)
    totalPairsRef.current += 1

    if (state.left === 'correct' && state.right === 'correct') {
      correctPairsRef.current += 1
      if (!isUnmountedRef.current) triggerFeedback('great')
      scoreRef.current += 100
      setScore(scoreRef.current)
      consecutiveRef.current += 1
      maxComboRef.current = Math.max(maxComboRef.current, consecutiveRef.current)
      if (!isUnmountedRef.current) setConsecutiveCount(consecutiveRef.current)
    } else if (state.left === 'correct' || state.right === 'correct') {
      if (!isUnmountedRef.current) triggerFeedback('close')
      consecutiveRef.current = 0
      if (!isUnmountedRef.current) setConsecutiveCount(0)
    } else {
      if (!isUnmountedRef.current) triggerFeedback('miss')
      consecutiveRef.current = 0
      if (!isUnmountedRef.current) setConsecutiveCount(0)
    }
  }, [triggerFeedback])

  const spawnNote = useCallback((lane: Lane, pairId: string) => {
    const colH = columnHeightRef.current
    if (colH === 0) return

    const note: Note = {
      id: genId(),
      pairId,
      type: Math.random() > 0.5 ? 'paper' : 'rock',
      lane,
      startTime: Date.now(),
      yAnim: new Animated.Value(-NOTE_SIZE),
    }

    const next = [...notesRef.current, note]
    notesRef.current = next
    if (!isUnmountedRef.current) setNotes([...next])

    Animated.timing(note.yAnim, {
      toValue: colH,
      duration: FALL_DURATION,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return
      const stillExists = notesRef.current.some(n => n.id === note.id)
      if (stillExists) {
        const after = notesRef.current.filter(n => n.id !== note.id)
        notesRef.current = after
        if (!isUnmountedRef.current) setNotes([...after])
        resolveLane(note.pairId, note.lane, 'wrong')
      }
    })
  }, [resolveLane])

  const spawnPair = useCallback(() => {
    const colH = columnHeightRef.current
    if (colH === 0 || gameOverRef.current) return
    const leftCount = notesRef.current.filter(n => n.lane === 'left').length
    const rightCount = notesRef.current.filter(n => n.lane === 'right').length
    if (leftCount >= 2 || rightCount >= 2) return

    const pairId = genId()
    pairStateRef.current.set(pairId, { left: 'pending', right: 'pending' })
    spawnNote('left', pairId)
    spawnNote('right', pairId)

    // 양쪽 노트 생성 후 카운트 → 10쌍(20개) 완료 시 게임 종료
    totalPairsSpawnedRef.current += 1
    if (totalPairsSpawnedRef.current >= TOTAL_PAIRS) {
      gameOverRef.current = true
      setGameOver(true)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [spawnNote])

  useEffect(() => {
    if (columnHeight === 0) return

    // 첫 스폰만 1회 실행 (Strict Mode 이중 호출 방지)
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      spawnPair()
    }

    // 인터벌은 cleanup 후 재설정될 수 있으므로 항상 다시 등록
    intervalRef.current = setInterval(() => {
      if (!isUnmountedRef.current) spawnPair()
    }, SPAWN_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [columnHeight, spawnPair])

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [])

  const handleGesture = useCallback((lane: Lane, gesture: GestureType) => {
    const colH = columnHeightRef.current
    const laneNotes = notesRef.current.filter(n => n.lane === lane)
    if (laneNotes.length === 0) return

    const now = Date.now()
    const totalFall = colH + NOTE_SIZE

    let bottommost: Note | null = null
    let highestY = -Infinity

    for (const note of laneNotes) {
      const elapsed = now - note.startTime
      const progress = Math.min(elapsed / FALL_DURATION, 1)
      const y = -NOTE_SIZE + progress * totalFall
      if (y > highestY) {
        highestY = y
        bottommost = note
      }
    }

    if (!bottommost) return

    const hitZoneStart = colH - NOTE_SIZE - HIT_ZONE_PX
    if (highestY < hitZoneStart) return

    bottommost.yAnim.stopAnimation()
    const next = notesRef.current.filter(n => n.id !== bottommost!.id)
    notesRef.current = next
    if (!isUnmountedRef.current) setNotes([...next])

    exerciseCountRef.current += 1
    setExerciseCount(exerciseCountRef.current)
    resolveLane(bottommost.pairId, lane, bottommost.type === gesture ? 'correct' : 'wrong')
  }, [resolveLane])

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#535353]">
      {/* Header */}
      <View className="px-4">
        <GameHeader />
      </View>

      {/* Score Bar */}
      <GameScoreBar
        score={score}
        consecutiveCount={consecutiveCount}
        exerciseCount={exerciseCount}
      />

      {/* Lane Labels */}
      <View className="flex-row px-4 mt-0.5 mb-1">
        <Text className="flex-1 text-center text-[15px] font-semibold text-[#d9d9d9]">왼손</Text>
        <View className="w-[10px]" />
        <Text className="flex-1 text-center text-[15px] font-semibold text-[#d9d9d9]">오른손</Text>
      </View>

      {/* Game Area */}
      <View className="flex-1 flex-row px-4 mb-2">
        {/* Left column */}
        <View
          className="flex-1 bg-[#DCDCDC] rounded-[14px]"
          onLayout={e => {
            const h = e.nativeEvent.layout.height
            columnHeightRef.current = h
            setColumnHeight(h)
          }}
        >
          {notes.filter(n => n.lane === 'left').map(note => (
            <Animated.View
              key={note.id}
              className="absolute inset-x-0 h-14 items-center justify-center"
              style={{ transform: [{ translateY: note.yAnim }] }}
            >
              <View className="w-14 h-14 rounded-[10px] bg-white/80 items-center justify-center">
                <Text className="text-[36px]">{GESTURE_EMOJI[note.type]}</Text>
              </View>
            </Animated.View>
          ))}
          <DashedHitLine />
        </View>

        <View className="w-[10px]" />

        {/* Right column */}
        <View className="flex-1 bg-[#DCDCDC] rounded-[14px]">
          {notes.filter(n => n.lane === 'right').map(note => (
            <Animated.View
              key={note.id}
              className="absolute inset-x-0 h-14 items-center justify-center"
              style={{ transform: [{ translateY: note.yAnim }] }}
            >
              <View className="w-14 h-14 rounded-[10px] bg-white/80 items-center justify-center">
                <Text className="text-[36px]">{GESTURE_EMOJI[note.type]}</Text>
              </View>
            </Animated.View>
          ))}
          <DashedHitLine />
        </View>

        {/* Feedback overlay */}
        <FeedbackModal visible={feedbackVisible} type={feedback} />
      </View>

      {/* [임시용] 제스처 입력 버튼 - 스마트 장갑 연동 전 */}
      <View className="px-4 pb-3">
        <Text className="text-[11px] text-[#d9d9d9] text-center mb-1.5">[임시용] 제스처 입력</Text>
        <View className="flex-row">
          <View className="flex-1 flex-row gap-2">
            <TouchableOpacity
              className="flex-1 h-14 bg-[#7A8894] rounded-xl items-center justify-center"
              onPress={() => handleGesture('left', 'rock')}
            >
              <Text className="text-[28px]">✊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 h-14 bg-[#7A8894] rounded-xl items-center justify-center"
              onPress={() => handleGesture('left', 'paper')}
            >
              <Text className="text-[28px]">🖐️</Text>
            </TouchableOpacity>
          </View>
          <View className="w-[10px]" />
          <View className="flex-1 flex-row gap-2">
            <TouchableOpacity
              className="flex-1 h-14 bg-[#7A8894] rounded-xl items-center justify-center"
              onPress={() => handleGesture('right', 'rock')}
            >
              <Text className="text-[28px]">✊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 h-14 bg-[#7A8894] rounded-xl items-center justify-center"
              onPress={() => handleGesture('right', 'paper')}
            >
              <Text className="text-[28px]">🖐️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

function DashedHitLine() {
  return (
    <View className="absolute inset-x-2 bottom-[68px] flex-row items-center overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <View key={i} className="w-[6px] h-[2px] bg-[#999] mr-[5px]" />
      ))}
    </View>
  )
}
