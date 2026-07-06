import { Text, View } from 'react-native'

type Props = {
  score: number
  consecutiveCount: number
  exerciseCount: number
}

export default function GameScoreBar({ score, consecutiveCount, exerciseCount }: Props) {
  return (
    <View className="flex-row justify-evenly items-center py-2.5">
      <StatItem value={score.toLocaleString()} label="점수" />

      <StatItem value={String(consecutiveCount)} label="연속성공횟수" />
  
      <StatItem value={String(exerciseCount)} label="운동량" />
    </View>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-[22px] font-bold text-[#d9d9d9]">{value}</Text>
      <Text className="text-[18px] text-[#d9d9d9] mt-0.5">{label}</Text>
    </View>
  )
}
