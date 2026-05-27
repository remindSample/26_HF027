import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomBar() {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: bottom }}
      className="flex-row items-center border-t border-[#DCDCDC] bg-white"
    >
      <Link href="/report" asChild>
        <Pressable className="h-[70px] flex-1 items-center justify-center">
          <Text className="text-center text-[28px] font-bold text-[#000000]">
            리포트
          </Text>
        </Pressable>
      </Link>

      <Link href="/" asChild>
        <Pressable className="h-[70px] flex-1 items-center justify-center">
          <Text className="text-center text-[28px] font-bold text-[#000000]">
            홈
          </Text>
        </Pressable>
      </Link>

      <Pressable className="h-[70px] flex-1 items-center justify-center">
        <Text className="text-center text-[28px] font-bold text-[#CFCFCF]">
          앨범
        </Text>
      </Pressable>
    </View>
  );
}
