import { Redirect, Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomBar from "@/components/BottomBar";
import { getAuthSession } from "@/apis";
import type { LoginResponse } from "@/apis";

export default function TabsLayout() {
  const [session, setSession] = useState<LoginResponse | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getAuthSession()
      .then((nextSession) => {
        if (isMounted) {
          setSession(nextSession);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsSessionLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isSessionLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 items-center justify-center bg-[#FDF2EC]">
        <ActivityIndicator color="#5BA4A4" />
      </SafeAreaView>
    );
  }

  if (session?.user.role !== "USER") {
    return <Redirect href="/login" />;
  }

  return (
    /*상단만 safeArea 적용*/
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#FDF2EC]">
      <View className="flex-1">
        <Slot />
      </View>

      <BottomBar />
    </SafeAreaView>
  );
}
