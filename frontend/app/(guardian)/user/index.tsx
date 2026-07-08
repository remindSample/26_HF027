import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GuardianUserScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <View className="items-center gap-3">
        <Text className="text-[20px] font-bold text-[#333]">사용자 관리</Text>
        <Text className="text-[14px] text-[#888]">구현 예정</Text>
      </View>
    </SafeAreaView>
  );
}
