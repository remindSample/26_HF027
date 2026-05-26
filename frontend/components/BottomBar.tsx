import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function BottomBar() {
  return (
    <View className="h-[94px] flex-row items-center border-t border-[#DCDCDC] bg-white pb-3">
      <Link href="/report" asChild>
        <Pressable className="h-full flex-1 items-center justify-center">
          <Text className="text-center text-[28px] font-bold text-[#000000]">
            리포트
          </Text>
        </Pressable>
      </Link>

      <Link href="/" asChild>
        <Pressable className="h-full flex-1 items-center justify-center">
          <Text className="text-center text-[28px] font-bold text-[#000000]">
            홈
          </Text>
        </Pressable>
      </Link>

      <Pressable className="h-full flex-1 items-center justify-center">
        <Text className="text-center text-[28px] font-bold text-[#CFCFCF]">
          앨범
        </Text>
      </Pressable>
    </View>
  );
}
