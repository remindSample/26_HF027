import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { AppState } from "react-native";
import { Side } from "./gloveInput";
import { getConnectedSmartGloveSides, isSmartGloveConnected, subscribeSmartGloveConnection } from "./smartGloveBle";

export default function SmartGloveStatusIcon({ size }: { size: number }) {
  const [connectedSides, setConnectedSides] = useState<Side[]>(getConnectedSmartGloveSides());

  useFocusEffect(useCallback(() => {
    const unsubscribe = subscribeSmartGloveConnection(setConnectedSides);
    void isSmartGloveConnected();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void isSmartGloveConnected();
    });
    return () => {
      unsubscribe();
      subscription.remove();
    };
  }, []));

  const bothConnected = connectedSides.includes("LEFT") && connectedSides.includes("RIGHT");
  const color = bothConnected ? "#9FE27B" : connectedSides.length > 0 ? "#F5A142" : "#E57474";

  return (
    <Ionicons name="hand-left" size={size} color={color}
      accessibilityLabel={bothConnected ? "장갑 양손 연결" : connectedSides.length > 0 ? "장갑 한 손 연결" : "장갑 미연결"} />
  );
}
