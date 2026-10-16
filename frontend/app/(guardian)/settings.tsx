import {
  clearAuthSession,
  createGuardianInvite,
  getAuthSession,
  getGuardianLinksByGuardian,
  getUser,
  type GuardianLinkResponse,
  type UserResponse,
} from "@/apis";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function GuardianSettingsScreen() {
  const [guardian, setGuardian] = useState<UserResponse | null>(null);
  const [link, setLink] = useState<GuardianLinkResponse | null>(null);
  const [elderName, setElderName] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const session = await getAuthSession();
      if (!session) {
        return;
      }

      const [profile, links] = await Promise.all([
        getUser(session.user.id),
        getGuardianLinksByGuardian(session.user.id),
      ]);
      const activeLink =
        links.find((item) => item.status === "accepted") ??
        links.find((item) => item.status === "pending") ??
        null;
      const elder = activeLink ? await getUser(activeLink.elder_id) : null;

      setGuardian(profile);
      setLink(activeLink);
      setElderName(elder?.name ?? null);
    } catch (error) {
      Alert.alert(
        "알림",
        error instanceof Error ? error.message : "설정 정보를 불러오지 못했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadSettings, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [loadSettings]);

  const handleInvite = async () => {
    if (!inviteCode.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createGuardianInvite(inviteCode.trim());
      setInviteCode("");
      await loadSettings();
      Alert.alert("알림", "사용자에게 연결 요청을 보냈습니다.");
    } catch (error) {
      Alert.alert(
        "알림",
        error instanceof Error ? error.message : "사용자 연결 요청에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await clearAuthSession();
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-[#FDF2EC]">
      <View className="h-[104px] flex-row items-center justify-between px-[28px] pt-4">
        <Pressable onPress={router.back} className="h-[48px] justify-center px-1">
          <Text className="text-[24px] text-black">‹</Text>
        </Pressable>
        <Text className="text-[32px] font-bold text-black">프로필 설정</Text>
        <View className="w-[32px]" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-[26px] pb-[48px]"
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="mt-20 items-center">
            <ActivityIndicator color="#174C33" />
          </View>
        ) : guardian ? (
          <View className="gap-5">
            <View className="rounded-[14px] border-2 border-black bg-[#F9F7F4] px-6 py-5">
              <Text className="text-[18px] font-medium text-[#A1978B]">내 프로필</Text>
              <Text className="mt-4 text-[28px] font-bold text-[#174C33]">
                {guardian.name}
              </Text>
              <Text className="mt-2 text-[17px] text-black">보호자 계정</Text>
              <Text className="mt-3 text-[16px] text-[#5F5F5F]">
                {guardian.email ?? guardian.phone ?? "연락처 없음"}
              </Text>
            </View>

            <View className="rounded-[14px] border-2 border-black bg-[#F9F7F4] px-6 py-5">
              <Text className="text-[18px] font-medium text-[#A1978B]">
                사용자 연결
              </Text>
              <Text className="mt-4 text-[20px] font-semibold text-black">
                {link
                  ? `${elderName ?? "사용자"} 님 ${
                      link.status === "accepted" ? "연결됨" : "수락 대기 중"
                    }`
                  : "연결된 사용자가 없습니다"}
              </Text>

              {!link ? (
                <View className="mt-5">
                  <TextInput
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    placeholder="초대코드 입력 예: RM-000123"
                    placeholderTextColor="#9B9B9B"
                    autoCapitalize="characters"
                    editable={!isSubmitting}
                    className="h-[58px] rounded-[12px] border-2 border-black bg-white px-4 text-[18px] text-black"
                  />
                  <Pressable
                    disabled={isSubmitting || !inviteCode.trim()}
                    onPress={handleInvite}
                    className="mt-3 h-[58px] items-center justify-center rounded-[12px] bg-[#BFCBC7]"
                  >
                    <Text className="text-[20px] font-semibold text-white">
                      {isSubmitting ? "요청 중..." : "연결 요청 보내기"}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>

            <Pressable
              onPress={handleLogout}
              className="h-[58px] items-center justify-center rounded-[14px] border-2 border-black bg-[#F9F7F4]"
            >
              <Text className="text-[18px] font-semibold text-[#174C33]">로그아웃</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
