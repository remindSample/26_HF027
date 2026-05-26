import { Slot } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomBar from "@/components/BottomBar";

export default function TabsLayout() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="flex-1">
        <Slot />
      </View>

      <BottomBar />
    </SafeAreaView>
  );
}
