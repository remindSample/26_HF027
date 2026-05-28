import { router } from "expo-router";
import type { ReactNode } from "react";
import { Image, Pressable, Text, View } from "react-native";

import Ic_Volume from "../../assets/Icon/Ic_Volume.png";
import Ic_DeviceOn from "../../assets/Icon/Ic_DeviceOn.png";
import Ic_Game_Exit from "../../assets/Icon/Ic_Game_Exit.png";

type GameHeaderProps = {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: ReactNode;
};

export default function GameHeader({
  title = "나가기",
  showBackButton = true,
  onBackPress,
  rightElement,
}: GameHeaderProps) {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    router.back();
  };

  return (
    <View className="pt-5 w-full flex-row items-center justify-between">
      {showBackButton ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          className="min-h-12 flex-row items-center pr-4"
          onPress={handleBackPress}
        >
          <Image source={Ic_Game_Exit} style={{width: 30, height: 30}} />
          <Text className="ml-3 text-[20px] font-medium text-white">{title}</Text>
          <View className="ml-3">
            <Image source={Ic_DeviceOn} style={{width: 26, height: 26}} />
          </View>
        </Pressable>
      ) : (
        <View className="min-h-12 min-w-[120px]" />
      )}

      <View>
        <Image source={Ic_Volume} style={{width: 30, height: 30}} resizeMode="contain" />
      </View>
    </View>
  );
}
