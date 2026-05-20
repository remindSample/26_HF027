import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function GamePlayScreen() {
  const { level } = useLocalSearchParams<{ level: string }>();

  return (
    <View>
      <Text>선택한 레벨: {level}</Text>
    </View>
  );
}
