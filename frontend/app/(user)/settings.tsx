import {
  clearAuthSession,
  getAuthSession,
  getGuardianLinksByElder,
  getMyGuardianRequests,
  getUser,
  updateGuardianLinkStatus,
  type GuardianLinkResponse,
  type UserResponse,
} from "@/apis";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";

function getInviteCode(userId: number) {
  return `RM-${String(userId).padStart(6, "0")}`;
}

export default function UserSettingsScreen() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [guardianName, setGuardianName] = useState<string | null>(null);
  const [pendingRequest, setPendingRequest] = useState<GuardianLinkResponse | null>(null);
  const [pendingGuardianName, setPendingGuardianName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const session = await getAuthSession();
      if (!session) {
        return;
      }

      const [profile, links, requests] = await Promise.all([
        getUser(session.user.id),
        getGuardianLinksByElder(session.user.id),
        getMyGuardianRequests(),
      ]);
      const acceptedLink = links.find((link) => link.status === "accepted");
      const request = requests[0] ?? null;
      const [acceptedGuardian, pendingGuardian] = await Promise.all([
        acceptedLink ? getUser(acceptedLink.guardian_id) : Promise.resolve(null),
        request ? getUser(request.guardian_id) : Promise.resolve(null),
      ]);

      setUser(profile);
      setGuardianName(acceptedGuardian?.name ?? null);
      setPendingRequest(request);
      setPendingGuardianName(pendingGuardian?.name ?? null);
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

  const handleUpdateRequest = async (status: "accepted" | "rejected") => {
    if (!pendingRequest || isUpdating) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateGuardianLinkStatus(pendingRequest.id, status);
      await loadSettings();
    } catch (error) {
      Alert.alert(
        "알림",
        error instanceof Error ? error.message : "연결 요청 처리에 실패했습니다."
      );
    } finally {
      setIsUpdating(false);
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
        ) : user ? (
          <View className="gap-5">
            <View className="rounded-[14px] border-2 border-black bg-[#F9F7F4] px-6 py-5">
              <Text className="text-[18px] font-medium text-[#A1978B]">내 프로필</Text>
              <Text className="mt-4 text-[28px] font-bold text-[#174C33]">
                {user.name}
              </Text>
              <Text className="mt-2 text-[17px] text-black">사용자 계정</Text>
              <Text className="mt-3 text-[16px] text-[#5F5F5F]">
                {user.email ?? user.phone ?? "연락처 없음"}
              </Text>
            </View>

            <View className="rounded-[14px] border-2 border-black bg-[#F9F7F4] px-6 py-5">
              <Text className="text-[18px] font-medium text-[#A1978B]">
                내 초대코드
              </Text>
              <Text className="mt-4 text-[32px] font-bold text-[#174C33]">
                {getInviteCode(user.id)}
              </Text>
              <Text className="mt-3 text-[16px] leading-[24px] text-[#5F5F5F]">
                보호자에게 이 코드를 알려주면 연결 요청을 받을 수 있습니다.
              </Text>
            </View>

            <View className="rounded-[14px] border-2 border-black bg-[#F9F7F4] px-6 py-5">
              <Text className="text-[18px] font-medium text-[#A1978B]">
                보호자 연결
              </Text>
              <Text className="mt-4 text-[20px] font-semibold text-black">
                {guardianName ? `${guardianName} 님과 연결됨` : "연결된 보호자가 없습니다"}
              </Text>

              {pendingRequest ? (
                <View className="mt-5 rounded-[12px] bg-[#FAEDE0] px-4 py-4">
                  <Text className="text-[17px] font-medium text-black">
                    {pendingGuardianName ?? "보호자"} 님의 연결 요청
                  </Text>
                  <View className="mt-4 flex-row gap-3">
                    <Pressable
                      disabled={isUpdating}
                      onPress={() => handleUpdateRequest("accepted")}
                      className="h-[48px] flex-1 items-center justify-center rounded-[12px] bg-[#BFCBC7]"
                    >
                      <Text className="text-[17px] font-semibold text-white">수락</Text>
                    </Pressable>
                    <Pressable
                      disabled={isUpdating}
                      onPress={() => handleUpdateRequest("rejected")}
                      className="h-[48px] flex-1 items-center justify-center rounded-[12px] border border-black bg-white"
                    >
                      <Text className="text-[17px] font-semibold text-black">거절</Text>
                    </Pressable>
                  </View>
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
