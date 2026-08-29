import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SmartGloveConnectionState,
  connectSmartGlove,
  disconnectSmartGlove,
  getConnectedSmartGloveName,
  getConnectedSmartGloveSides,
  getConnectedSmartGloveTitle,
  isSmartGloveConnected
} from "../src/smartGloveBle";
import { Side } from "../src/gloveInput";

const CONNECTED_HAND_COLOR = "#F5A142";
const BOTH_CONNECTED_HAND_COLOR = "#9FE27B";

function areBothHandsConnected(sides: Side[]) {
  return sides.includes("LEFT") && sides.includes("RIGHT");
}

export default function ConnectionScreen() {
  const [connectionState, setConnectionState] =
    useState<SmartGloveConnectionState>("disconnected");
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [connectedTitle, setConnectedTitle] = useState(getConnectedSmartGloveTitle());
  const [connectedSides, setConnectedSides] = useState<Side[]>(getConnectedSmartGloveSides());
  const [statusText, setStatusText] = useState("장갑 연결을 시작해주세요.");

  const isConnected = connectionState === "connected";
  const isBusy = connectionState === "scanning" || connectionState === "connecting";

  const palmColor = isConnected
    ? areBothHandsConnected(connectedSides)
      ? BOTH_CONNECTED_HAND_COLOR
      : CONNECTED_HAND_COLOR
    : "#E57474";
  const primaryButtonText = useMemo(() => {
    if (connectionState === "scanning") return "장갑 검색중...";
    if (connectionState === "connecting") return "블루투스 연결중...";
    if (isConnected) return "블루투스 연결완료 !";
    return "블루투스 연결하기";
  }, [connectionState, isConnected]);

  useEffect(() => {
    let isMounted = true;

    isSmartGloveConnected().then((connected) => {
      if (!isMounted || !connected) return;
      setConnectionState("connected");
      setDeviceName(getConnectedSmartGloveName());
      setConnectedTitle(getConnectedSmartGloveTitle());
      setConnectedSides(getConnectedSmartGloveSides());
      setStatusText("스마트 장갑이 성공적으로 연결되었습니다.");
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleConnect = async () => {
    if (isConnected) {
      router.push({
        pathname: "/play",
        params: {
          level: "normal",
          noteSpeedMs: "3400",
          spawnMs: "2400"
        }
      });
      return;
    }

    try {
      setConnectionState("scanning");
      setStatusText("주변 BLE 장갑을 검색하고 있습니다.");
      const connectedDevice = await connectSmartGlove({
        onStateChange: (nextState) => setConnectionState(nextState)
      });

      setConnectionState("connected");
      setDeviceName(connectedDevice.name);
      setConnectedTitle(getConnectedSmartGloveTitle());
      setConnectedSides(getConnectedSmartGloveSides());
      setStatusText("스마트 장갑이 성공적으로 연결되었습니다.");
    } catch (error) {
      setConnectionState("disconnected");
      setStatusText(
        error instanceof Error
          ? error.message
          : "장갑 연결에 실패했습니다. 다시 시도해주세요."
      );
    }
  };

  const handleDisconnect = async () => {
    await disconnectSmartGlove();
    setConnectionState("disconnected");
    setDeviceName(null);
    setConnectedTitle(getConnectedSmartGloveTitle());
    setConnectedSides(getConnectedSmartGloveSides());
    setStatusText("연결이 해제되었습니다.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="나가기"
            style={styles.exitButton}
            onPress={() => router.back()}
          >
            <Ionicons name="exit-outline" size={42} color="#FFFFFF" />
            <Text style={styles.exitText}>나가기</Text>
          </Pressable>
          <Ionicons name="hand-left" size={38} color={palmColor} />
          <Ionicons name="volume-high-outline" size={42} color="#FFFFFF" />
        </View>

        <View style={styles.brandBlock}>
          <Text style={styles.brand}>Re:Mind</Text>
          <Text style={styles.brandSub}>인지 훈련게임</Text>
        </View>

        <Text style={styles.pageTitle}>스마트 장갑 연동하기</Text>

        {isConnected ? (
          <ConnectedPanel title={connectedTitle} deviceName={deviceName} />
        ) : (
          <GuidePanel isBusy={isBusy} />
        )}

        <View style={styles.statusRow}>
          <Ionicons name="hand-left" size={32} color="#E57474" />
          <Ionicons name="arrow-forward" size={34} color="#E0E0E0" />
          <Ionicons name="hand-left" size={32} color="#9FE27B" />
          <Text style={styles.statusGuide}>초록불이 들어오면 연결성공 !</Text>
        </View>

        <Text style={styles.statusText}>{statusText}</Text>

        {isConnected ? (
          <View style={styles.helpBlock}>
            <Text style={styles.helpTitle}>도움말</Text>
            <Text style={styles.helpText}>
              · 장갑이 검색되지 않으면 전원을 껐다 켜보세요.
            </Text>
            <Text style={styles.helpText}>
              · 상단바에 초록색 불이 들어온 후, 게임을 진행해주세요.
            </Text>
          </View>
        ) : null}

        <View style={styles.buttonGroup}>
          <Pressable
            disabled={isBusy}
            style={[
              styles.primaryButton,
              isBusy ? styles.primaryButtonDisabled : null
            ]}
            onPress={handleConnect}
          >
            {isBusy ? <ActivityIndicator color="#4A4A4A" /> : null}
            <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
          </Pressable>

          {isConnected ? (
            <Pressable style={styles.secondaryButton} onPress={handleDisconnect}>
              <Text style={styles.secondaryButtonText}>연결 해제</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GuidePanel({ isBusy }: { isBusy: boolean }) {
  return (
    <View style={styles.guideList}>
      <GuideStep
        number="1"
        icon={
          <View style={styles.stepIcons}>
            <Ionicons name="hand-left-outline" size={56} color="#FFFFFF" />
            <Ionicons name="arrow-back" size={46} color="#FFFFFF" />
            <Ionicons name="power" size={58} color="#FFFFFF" />
          </View>
        }
        text="스마트 장갑의 전원을 켜고 착용하세요"
      />
      <GuideStep
        number="2"
        icon={<Text style={styles.bluetoothSymbol}>♭:)</Text>}
        text="스마트폰 블루투스를 활성화 하세요"
      />
      <GuideStep
        number="3"
        icon={
          <View style={styles.stepIcons}>
            <Ionicons name="search-outline" size={52} color="#FFFFFF" />
            <Ionicons name="desktop-outline" size={60} color="#FFFFFF" />
          </View>
        }
        text="기기 목록에서 장갑을 선택하여 연결하세요"
      />
      <GuideStep
        number="4"
        icon={
          <View style={styles.stepIcons}>
            <Ionicons name="radio-outline" size={58} color="#FFFFFF" />
            <Ionicons name="tablet-landscape-outline" size={60} color="#FFFFFF" />
          </View>
        }
        text="아래 버튼을 눌러 연동을 완료하세요"
      />
      {isBusy ? (
        <View style={styles.scanBanner}>
          <ActivityIndicator color="#FFFFFF" />
          <Text style={styles.scanBannerText}>장갑을 검색하고 있습니다</Text>
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
    <View style={styles.connectedPanel}>
      <Ionicons name="checkmark-circle-outline" size={78} color="#444444" />
      <Text style={styles.connectedTitle}>{title}</Text>
      <Text style={styles.connectedText}>
        스마트 장갑이 성공적으로 연결되었습니다
      </Text>
      {deviceName ? <Text style={styles.deviceName}>{deviceName}</Text> : null}
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
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepBox}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{number}</Text>
        </View>
        {icon}
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#555555"
  },
  scroll: {
    flex: 1
  },
  content: {
    paddingHorizontal: 34,
    paddingTop: 24,
    paddingBottom: 42
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  exitButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  exitText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700"
  },
  brandBlock: {
    marginTop: 70,
    alignItems: "center"
  },
  brand: {
    color: "#DADADA",
    fontSize: 58,
    fontWeight: "900",
    letterSpacing: 0
  },
  brandSub: {
    alignSelf: "flex-end",
    marginTop: 18,
    paddingRight: 18,
    color: "#DADADA",
    fontSize: 27,
    fontWeight: "700",
    letterSpacing: 0
  },
  pageTitle: {
    marginTop: 58,
    color: "#E0E0E0",
    fontSize: 33,
    fontWeight: "900"
  },
  guideList: {
    marginTop: 34,
    gap: 18
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18
  },
  stepBox: {
    width: 168,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 4,
    borderColor: "#D7D7D7"
  },
  stepNumber: {
    position: "absolute",
    top: -16,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    borderWidth: 3,
    borderColor: "#D7D7D7",
    backgroundColor: "#555555"
  },
  stepNumberText: {
    color: "#D7D7D7",
    fontSize: 24,
    fontWeight: "800"
  },
  stepIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  bluetoothSymbol: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "300"
  },
  stepText: {
    flex: 1,
    color: "#E0E0E0",
    fontSize: 24,
    lineHeight: 34,
    fontWeight: "700"
  },
  scanBanner: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderRadius: 8,
    backgroundColor: "#686868"
  },
  scanBannerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700"
  },
  connectedPanel: {
    marginTop: 44,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    borderRadius: 18,
    backgroundColor: "#CFCFCF"
  },
  connectedTitle: {
    marginTop: 20,
    color: "#444444",
    fontSize: 34,
    fontWeight: "900"
  },
  connectedText: {
    marginTop: 18,
    color: "#444444",
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    textAlign: "center"
  },
  deviceName: {
    marginTop: 12,
    color: "#555555",
    fontSize: 16,
    fontWeight: "700"
  },
  statusRow: {
    marginTop: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  statusGuide: {
    color: "#E0E0E0",
    fontSize: 21,
    fontWeight: "700"
  },
  statusText: {
    marginTop: 16,
    color: "#DADADA",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center"
  },
  helpBlock: {
    marginTop: 46
  },
  helpTitle: {
    color: "#E0E0E0",
    fontSize: 33,
    fontWeight: "900"
  },
  helpText: {
    marginTop: 20,
    color: "#E0E0E0",
    fontSize: 24,
    lineHeight: 36,
    fontWeight: "600"
  },
  buttonGroup: {
    marginTop: 42,
    gap: 12
  },
  primaryButton: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderRadius: 24,
    backgroundColor: "#CFCFCF"
  },
  primaryButtonDisabled: {
    opacity: 0.8
  },
  primaryButtonText: {
    color: "#4A4A4A",
    fontSize: 29,
    fontWeight: "900"
  },
  secondaryButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#D7D7D7"
  },
  secondaryButtonText: {
    color: "#E0E0E0",
    fontSize: 20,
    fontWeight: "800"
  }
});
