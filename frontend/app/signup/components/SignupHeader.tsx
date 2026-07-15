import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import IcChevronDown from "../../../assets/Icon/Ic_Chevron down.svg";
import IcChevronLeft from "../../../assets/Icon/Ic_Chevron left.svg";

type Props = {
  title: string;
  titleClassName: string;
  onBack: () => void;
  showDismissKeyboard?: boolean;
  onDismissKeyboard: () => void;
};

export default function SignupHeader({
  title,
  titleClassName,
  onBack,
  showDismissKeyboard = false,
  onDismissKeyboard,
}: Props) {
  return (
    <View className="w-full flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          hitSlop={10}
          onPress={onBack}
          className="h-[36px] w-[36px] items-center justify-center"
        >
          <Image
            source={IcChevronLeft}
            contentFit="contain"
            style={{ width: 36, height: 36 }}
          />
        </Pressable>

        <Text className={titleClassName}>{title}</Text>
      </View>

      {showDismissKeyboard ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="키보드 닫기"
          hitSlop={10}
          onPress={onDismissKeyboard}
          className="h-[36px] w-[36px] items-center justify-center"
        >
          <Image
            source={IcChevronDown}
            contentFit="contain"
            style={{ width: 36, height: 36 }}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
