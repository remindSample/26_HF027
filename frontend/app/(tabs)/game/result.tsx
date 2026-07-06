import { router, useLocalSearchParams } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import GameHeader from './components/GameHeader'

const LEVEL_LABELS: Record<string, string> = {
  '1': '매우 쉬움',
  '2': '쉬움',
  '3': '보통',
  '4': '어려움',
  '5': '매우 어려움',
}

const MESSAGES = ['다시 해봐요!', '괜찮아요!', '잘했어요!', '훌륭해요!', '완벽해요!']
const SUBTITLES = ['포기하지 마세요', '조금만 더 노력해요', '잘 하셨어요', '수고하셨습니다', '정말 대단해요!']

function getStarCount(accuracy: number): number {
  if (accuracy >= 90) return 5
  if (accuracy >= 75) return 4
  if (accuracy >= 60) return 3
  if (accuracy >= 40) return 2
  return 1
}

export default function ResultScreen() {
  const { score, level, accuracy, maxCombo, exerciseCount } = useLocalSearchParams<{
    score: string
    level: string
    accuracy: string
    maxCombo: string
    exerciseCount: string
  }>()

  const accuracyNum = Number(accuracy ?? 0)
  const starCount = getStarCount(accuracyNum)
  const levelLabel = LEVEL_LABELS[level ?? '1'] ?? '매우 쉬움'
  const scoreFormatted = Number(score ?? 0).toLocaleString()

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#535353]">
      <View className="flex-1 px-4">
        <GameHeader />

        {/* 상단 결과 */}
        <View className="items-center mt-2">
          <Text className="text-[16px] text-[#d9d9d9]">게임 완료</Text>
          <View className="flex-row mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Text
                key={i}
                style={{ fontSize: 34, color: i < starCount ? '#E0C040' : '#888888' }}
              >
                {i < starCount ? '★' : '☆'}
              </Text>
            ))}
          </View>
          <Text className="text-[30px] font-bold text-white mt-1">{MESSAGES[starCount - 1]}</Text>
          <Text className="text-[14px] text-[#d9d9d9] mt-0.5">{SUBTITLES[starCount - 1]}</Text>
        </View>

        {/* 점수 카드 */}
        <View className="mt-5 bg-[#d9d9d9] rounded-2xl px-6 py-5 items-center">
          <Text className="text-[15px] text-[#555555]">최종 점수</Text>
          <Text className="text-[44px] font-bold text-[#1a1a1a] mt-1">{scoreFormatted}</Text>
          <Text className="text-[14px] text-[#666666] mt-1">난이도: {levelLabel}</Text>
        </View>

        {/* 통계 카드 */}
        <View className="mt-4 bg-[#d9d9d9] rounded-2xl px-5 py-4">
          <Text className="text-[17px] font-semibold text-[#333333]">게임 통계</Text>
          <View className="border-b border-[#aaaaaa] mt-2 mb-3" />
          <StatRow label="정확도" value={`${accuracyNum} %`} />
          <StatRow label="최고 콤보" value={`${maxCombo ?? 0} 회`} />
          <StatRow label="손가락 운동량" value={`${exerciseCount ?? 0} 회`} />
        </View>

        {/* 버튼 */}
        <View className="mt-auto -mx-4 bg-white px-8 pt-8 pb-8 gap-3">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 h-14 bg-[#3C3C3C] rounded-2xl items-center justify-center"
              onPress={() =>
                router.replace({ pathname: '/game/play', params: { level: level ?? '1' } })
              }
            >
              <Text className="text-[17px] font-semibold text-white">다시 하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 h-14 rounded-2xl border-2 border-[#3C3C3C] items-center justify-center"
              onPress={() => router.replace('/game/level')}
            >
              <Text className="text-[17px] font-semibold text-[#3C3C3C]">난이도 변경</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="h-14 bg-[#C8C8C8] rounded-2xl items-center justify-center"
            onPress={() => router.replace('/(tabs)')}
          >
            <Text className="text-[17px] font-semibold text-[#3C3C3C]">홈으로</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-1.5">
      <Text className="text-[15px] text-[#444444]">{label}</Text>
      <Text className="text-[15px] font-semibold text-[#333333]">{value}</Text>
    </View>
  )
}
