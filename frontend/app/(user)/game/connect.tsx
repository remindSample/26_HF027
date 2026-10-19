import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GameHeader from "./components/GameHeader";
import {
  SmartGloveConnectionState,
  connectSmartGlove,
  disconnectSmartGlove,
  getConnectedSmartGloveName,
  getConnectedSmartGloveSides,
  getConnectedSmartGloveTitle,
  isSmartGloveConnected,
  subscribeSmartGloveConnection
} from "@/features/game/smartGloveBle";

export default function ConnectionScreen() {
  const { width } = useWindowDimensions();
  const [connectionState, setConnectionState] =
    useState<SmartGloveConnectionState>("disconnected");
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [connectedTitle, setConnectedTitle] = useState(getConnectedSmartGloveTitle());
  const [statusText, setStatusText] = useState("장갑 연결을 시작해주세요.");
  const [connectedCount, setConnectedCount] = useState(0);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const mountedRef = useRef(false);
  const connectionControllerRef = useRef<AbortController | null>(null);

  const isConnected = connectionState === "connected";
  const isBusy = isDisconnecting || connectionState === "scanning" || connectionState === "connecting";

  const primaryButtonText = useMemo(() => {
    if (connectionState === "scanning") return "장갑 검색중...";
    if (connectionState === "connecting") return "블루투스 연결중...";
    if (connectedCount === 2) return "난이도 선택하기";
    if (isConnected) return "나머지 장갑 연결하기";
    return "블루투스 연결하기";
  }, [connectionState, isConnected, connectedCount]);

  useEffect(() => {
    mountedRef.current = true;
    const unsubscribe = subscribeSmartGloveConnection((sides) => {
      if (!mountedRef.current) return;
      setConnectedCount(sides.length);
      setConnectionState((current) => current === "scanning" || current === "connecting"
        ? current : sides.length > 0 ? "connected" : "disconnected");
      setDeviceName(getConnectedSmartGloveName());
      setConnectedTitle(getConnectedSmartGloveTitle());
      if (sides.length === 0) setStatusText("장갑 연결을 시작해주세요.");
    });

    isSmartGloveConnected().then((connected) => {
      if (!mountedRef.current || !connected) return;
      setConnectionState("connected");
      setDeviceName(getConnectedSmartGloveName());
      setConnectedTitle(getConnectedSmartGloveTitle());
      setStatusText("스마트 장갑이 성공적으로 연결되었습니다.");
    });

    return () => {
      mountedRef.current = false;
      connectionControllerRef.current?.abort();
      unsubscribe();
    };
  }, []);

  const handleConnect = async () => {
    if (isBusy) return;
    if (connectedCount === 2) {
      router.push("/(user)/game/level");
      return;
    }

    const controller = new AbortController();
    connectionControllerRef.current = controller;
    try {
      setConnectionState("scanning");
      setStatusText("주변 BLE 장갑을 검색하고 있습니다.");
      const connectedDevice = await connectSmartGlove({
        signal: controller.signal,
        onStateChange: (nextState) => { if (mountedRef.current) setConnectionState(nextState); }
      });

      if (!mountedRef.current) return;
      setConnectionState("connected");
      setDeviceName(connectedDevice.name);
      setConnectedTitle(getConnectedSmartGloveTitle());
      setStatusText("스마트 장갑이 성공적으로 연결되었습니다.");
    } catch (error) {
      if (!mountedRef.current || controller.signal.aborted) return;
      setConnectionState(getConnectedSmartGloveSides().length > 0 ? "connected" : "disconnected");
      setStatusText(
        error instanceof Error
          ? error.message
          : "장갑 연결에 실패했습니다. 다시 시도해주세요."
      );
    }
  };

  const handleDisconnect = async () => {
    if (isBusy) return;
    setIsDisconnecting(true);
    try {
      await disconnectSmartGlove();
      if (!mountedRef.current) return;
      setConnectionState("disconnected");
      setDeviceName(null);
      setConnectedTitle(getConnectedSmartGloveTitle());
      setStatusText("연결이 해제되었습니다.");
    } catch (error) {
      if (mountedRef.current) setStatusText(error instanceof Error ? error.message : "연결 해제에 실패했습니다.");
    } finally {
      if (mountedRef.current) setIsDisconnecting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#555555]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-[34px] pt-[24px] pb-[42px]"
        showsVerticalScrollIndicator={false}
      >
        <GameHeader />

        <View className="mt-[70px] items-center">
          <Text className="text-[#DADADA] text-[58px] font-black tracking-[0px]">Re:Mind</Text>
          <Text className="self-end mt-[18px] pr-[18px] text-[#DADADA] text-[27px] font-bold tracking-[0px]">인지 훈련게임</Text>
        </View>

        <Text style={{ fontSize: Math.min(33, (width - 68) / 10) }} className="mt-[58px] text-[#E0E0E0] font-black">스마트 장갑 연동하기</Text>

        {isConnected ? (
          <ConnectedPanel title={connectedTitle} deviceName={deviceName} />
        ) : (
          <GuidePanel isBusy={isBusy} />
        )}

        <View className="mt-[34px] flex-row items-center justify-center gap-[12px]">
          <Ionicons name="hand-left" size={32} color="#E57474" />
          <Ionicons name="arrow-forward" size={34} color="#E0E0E0" />
          <Ionicons name="hand-left" size={32} color="#9FE27B" />
          <Text className="flex-1 text-[#E0E0E0] text-[21px] font-bold">초록불이 들어오면 연결성공 !</Text>
        </View>

        <Text className="mt-[16px] text-[#DADADA] text-[16px] leading-[24px] text-center">{statusText}</Text>

        {isConnected ? (
          <View className="mt-[46px]">
            <Text className="text-[#E0E0E0] text-[33px] font-black">도움말</Text>
            <Text className="mt-[20px] text-[#E0E0E0] text-[24px] leading-[36px] font-semibold">
              · 장갑이 검색되지 않으면 전원을 껐다 켜보세요.
            </Text>
            <Text className="mt-[20px] text-[#E0E0E0] text-[24px] leading-[36px] font-semibold">
              · 상단바에 초록색 불이 들어온 후, 게임을 진행해주세요.
            </Text>
          </View>
        ) : null}

        <View className="mt-[42px] gap-[12px]">
          <Pressable
            disabled={isBusy}
            className={`min-h-[82px] flex-row items-center justify-center gap-[12px] rounded-[24px] bg-[#CFCFCF] ${isBusy ? "opacity-[0.8]" : ""}`}
            onPress={handleConnect}
          >
            {isBusy ? <ActivityIndicator color="#4A4A4A" /> : null}
            <Text className="text-[#4A4A4A] text-[29px] font-black">{primaryButtonText}</Text>
          </Pressable>

          {isConnected ? (
            <Pressable disabled={isBusy} className="min-h-[54px] items-center justify-center rounded-[14px] border-[2px] border-[#D7D7D7]" onPress={handleDisconnect}>
              <Text className="text-[#E0E0E0] text-[20px] font-extrabold">연결 해제</Text>
            </Pressable>
          ) : null}
          {isConnected && connectedCount < 2 ? (
            <Pressable disabled={isBusy} className="min-h-[54px] items-center justify-center rounded-[14px] bg-[#D7D7D7]"
              onPress={() => router.push("/(user)/game/level")}>
              <Text className="text-[#4A4A4A] text-[20px] font-extrabold">게임 시작하기</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GuidePanel({ isBusy }: { isBusy: boolean }) {
  return (
    <View className="mt-[34px] gap-[18px]">
      <GuideStep
        number="1"
        icon={
          <View className="flex-row items-center justify-center gap-[8px]">
            <Ionicons name="hand-left-outline" size={56} color="#FFFFFF" />
            <Ionicons name="arrow-back" size={46} color="#FFFFFF" />
            <Ionicons name="power" size={58} color="#FFFFFF" />
          </View>
        }
        text="스마트 장갑의 전원을 켜고 착용하세요"
      />
      <GuideStep
        number="2"
        icon={<Text className="text-[#FFFFFF] text-[48px] font-light">♭:)</Text>}
        text="스마트폰 블루투스를 활성화 하세요"
      />
      <GuideStep
        number="3"
        icon={
          <View className="flex-row items-center justify-center gap-[8px]">
            <Ionicons name="search-outline" size={52} color="#FFFFFF" />
            <Ionicons name="desktop-outline" size={60} color="#FFFFFF" />
          </View>
        }
        text="기기 목록에서 장갑을 선택하여 연결하세요"
      />
      <GuideStep
        number="4"
        icon={
          <View className="flex-row items-center justify-center gap-[8px]">
            <Ionicons name="radio-outline" size={58} color="#FFFFFF" />
            <Ionicons name="tablet-landscape-outline" size={60} color="#FFFFFF" />
          </View>
        }
        text="아래 버튼을 눌러 연동을 완료하세요"
      />
      {isBusy ? (
        <View className="min-h-[46px] flex-row items-center justify-center gap-[12px] rounded-[8px] bg-[#686868]">
          <ActivityIndicator color="#FFFFFF" />
          <Text className="text-[#FFFFFF] text-[16px] font-bold">장갑을 검색하고 있습니다</Text>
        </View>
      ) : null}
    </View>
  );
}

function ConnectedPanel({
  title,
  deviceName
}: {
  title: string;
  deviceName: string | null;
}) {
  return (
    <View className="mt-[44px] min-h-[200px] items-center justify-center p-[22px] rounded-[18px] bg-[#CFCFCF]">
      <Ionicons name="checkmark-circle-outline" size={78} color="#444444" />
      <Text className="mt-[20px] text-[#444444] text-[34px] font-black">{title}</Text>
      <Text className="mt-[18px] text-[#444444] text-[20px] leading-[28px] font-bold text-center">
        스마트 장갑이 성공적으로 연결되었습니다
      </Text>
      {deviceName ? <Text className="mt-[12px] text-[#555555] text-[16px] font-bold">{deviceName}</Text> : null}
    </View>
  );
}

function GuideStep({
  number,
  icon,
  text
}: {
  number: string;
  icon: React.ReactNode;
  text: string;
}) {
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(168, (width - 86) * 0.48);
  return (
    <View className="flex-row items-center gap-[18px]">
      <View style={{ width: panelWidth }} className="h-[112px] items-center justify-center rounded-[18px] border-[4px] border-[#D7D7D7]">
        <View className="absolute -top-[16px] w-[34px] h-[34px] items-center justify-center rounded-[17px] border-[3px] border-[#D7D7D7] bg-[#555555]">
          <Text className="text-[#D7D7D7] text-[24px] font-extrabold">{number}</Text>
        </View>
        <View style={{ transform: [{ scale: panelWidth / 168 }] }}>{icon}</View>
      </View>
      <Text style={{ fontSize: Math.min(24, (width - 68) * 0.075) }} className="flex-1 text-[#E0E0E0] leading-[34px] font-bold">{text}</Text>
    </View>
  );
}
