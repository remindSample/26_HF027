import { Redirect, Slot } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomBar from "@/components/BottomBar";
import { getAuthSession } from "@/apis";

export default function TabsLayout() {
  const session = getAuthSession();

  if (session?.user.role !== "USER") {
    return <Redirect href="/login" />;
  }

  return (
    /*상단만 safeArea 적용*/
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#FDF2EC]">
      <View className="flex-1">
        <Slot />
      </View>

      <BottomBar />
    </SafeAreaView>
  );
}
