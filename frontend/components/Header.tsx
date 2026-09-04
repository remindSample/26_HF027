import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
};

export default function Header({
  title,
  showBackButton = true,
}: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-[#E0E0E0] bg-[#B9C5C1] px-4 py-5">
      {showBackButton ? (
        <Pressable onPress={() => router.back()} className="w-10 items-center">
          <Text className="text-2xl text-[#333333]">←</Text>
        </Pressable>
      ) : (
        <View className="w-10" />
      )}

      <Text className="text-lg font-bold text-[#111111]">{title}</Text>

      <View className="w-10" />
    </View>
  );
}
