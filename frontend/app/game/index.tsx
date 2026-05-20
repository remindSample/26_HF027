import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function GameHomeScreen() {
  return (
    <View>
      <Pressable onPress={() => router.push("/game/connect")}>
        <Text>장갑 연결하기</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/game/level")}>
        <Text>게임 시작하기</Text>
      </Pressable>
    </View>
  );
}
