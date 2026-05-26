import { Slot } from "expo-router";
import { View } from "react-native";
import BottomBar from "@/components/BottomBar";

export default function TabsLayout() {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1">
        <Slot />
      </View>

      <BottomBar />
    </View>
  );
}
