// [임시용] 스마트 장갑 연동 전 임시 피드백 UI - 추후 교체 예정
import { Text, View } from 'react-native'

export type FeedbackType = 'great' | 'close' | 'miss'

type Props = {
  visible: boolean
  type: FeedbackType | null
}

const CONFIG: Record<
FeedbackType, 
{ label: string; bgColor: string; borderColor: string}
> = {
  great: {
    label: '잘했어요 !',
    bgColor: 'rgba(118,134,156,0.44)',
    borderColor: 'rgba(91,106,137,0.55)'
  },
  close: {
    label: '아쉬워요 !',
    bgColor: 'rgba(125,156,118,0.44)',
    borderColor: 'rgba(109,137,91,0.55)'
  },
  miss: {
    label: '실수예요 !',
    bgColor: 'rgba(156,118,118,0.44)',
    borderColor: 'rgba(137,91,91,0.55)'
  },
 
}

export default function FeedbackModal({ visible, type }: Props) {
  if (!visible || !type) return null

  const { label, bgColor, borderColor } = CONFIG[type]

  return (
    <View
      style={{ pointerEvents: 'none' }}
      className="absolute inset-0 items-center justify-start pt-[140px] z-10"
    >
      <View 
        className={`px-12 py-3 rounded-[12px] border-2`}
        style={{backgroundColor: bgColor, borderColor, }}
      >
        <Text className="text-white text-xl font-bold">{label}</Text>
      </View>
   
    </View>
  )
}  
