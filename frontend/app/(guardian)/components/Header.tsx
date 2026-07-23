import { Image } from "expo-image";
import { router } from "expo-router";
import { Keyboard, Pressable, Text, View } from "react-native";

import IcChevronDown from "../../../assets/Icon/Ic_Chevron down.svg";
import IcChevronLeft from "../../../assets/Icon/Ic_Chevron left.svg";
import IcSetting from "../../../assets/Icon/Ic_Settings.svg";

type HeaderProps = {
  title: string;
  titleClassName?: string;

  showBackButton?: boolean;
  onBack?: () => void;

  showDismissKeyboard?: boolean;
  onDismissKeyboard?: () => void;

  showSettingButton?: boolean;
  onPressSetting?: () => void;
};

export default function Header({
  title,
  titleClassName = "text-[24px] font-bold tracking-[-2px] text-black",

  showBackButton = true,
  onBack = router.back,

  showDismissKeyboard = false,
  onDismissKeyboard = Keyboard.dismiss,

  showSettingButton = false,
  onPressSetting,
}: HeaderProps) {
  return (
    <View className="relative h-[48px] w-full flex-row items-center justify-between">
      {/* 왼쪽 버튼 */}
      {showBackButton ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          hitSlop={10}
          onPress={onBack}
          className="z-10 h-[48px] w-[48px] items-center justify-center"
        >
          <Image
            source={IcChevronLeft}
            contentFit="contain"
            style={{ width: 36, height: 36 }}
          />
        </Pressable>
      ) : (
        <View className="h-[48px] w-[48px]" />
      )}

      {/* 화면 전체 기준 중앙 제목 */}
      <View
        pointerEvents="none"
        className="absolute inset-x-0 items-center justify-center"
      >
        <Text className={`text-center ${titleClassName}`}>{title}</Text>
      </View>

      {/* 오른쪽 버튼 */}
      {showSettingButton ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="설정"
          hitSlop={10}
          onPress={onPressSetting}
          className="z-10 h-[48px] w-[48px] items-center justify-center"
        >
          <Image
            source={IcSetting}
            contentFit="contain"
            style={{ width: 36, height: 36 }}
          />
        </Pressable>
      ) : showDismissKeyboard ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="키보드 닫기"
          hitSlop={10}
          onPress={onDismissKeyboard}
          className="z-10 h-[48px] w-[48px] items-center justify-center"
        >
          <Image
            source={IcChevronDown}
            contentFit="contain"
            style={{ width: 36, height: 36 }}
          />
        </Pressable>
      ) : (
        <View className="h-[48px] w-[48px]" />
      )}
    </View>
  );
}