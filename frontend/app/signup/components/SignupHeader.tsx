import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import IcChevronLeft from "../../../assets/Icon/Ic_Chevron left.svg";

type Props = {
  title: string;
  titleClassName: string;
  onBack: () => void;
};

export default function SignupHeader({
  title,
  titleClassName,
  onBack,
}: Props) {
  return (
    <View className="self-start flex-row items-center">
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
  );
}
