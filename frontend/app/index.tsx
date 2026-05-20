import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View>
      <Link href="/game" asChild>
        <Pressable>
          <Text>손동작 게임 시작</Text>
        </Pressable>
      </Link>

      <Link href="/test" asChild>
        <Pressable>
          <Text>테스트</Text>
        </Pressable>
      </Link>
    </View>
  );
}
