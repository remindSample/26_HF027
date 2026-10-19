import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { cssInterop } from "nativewind";
import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import volumeIcon from "@/assets/Icon/Ic_Volume.png";
import { BACKGROUND_TRACKS, useAudioSettings } from "./audioSettings";

const VolumeSlider = cssInterop(Slider, { className: "style" });

export default function VolumeSettingsButton({ size = 34 }: { size?: number }) {
  const [visible, setVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { settings, updateSettings, ready } = useAudioSettings();
  const close = () => {
    setVisible(false);
    setDropdownOpen(false);
  };

  return (
    <>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="음량 설정 열기"
        className="w-[48px] h-[48px] shrink-0 items-center justify-center" hitSlop={12} activeOpacity={0.6} onPress={() => setVisible(true)}>
        <View pointerEvents="none">
          <Image source={volumeIcon} accessible={false} resizeMode="contain"
            className="w-[34px] h-[34px]" style={{ width: size, height: size }} />
        </View>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <View className="flex-1 bg-[rgba(0,0,0,0.55)] justify-center">
          <Pressable className="absolute inset-0" onPress={close}
            accessibilityRole="button" accessibilityLabel="음량 설정 닫기" />
          <SafeAreaView className="max-h-full px-[24px] items-center" pointerEvents="box-none">
            <View className="w-full max-w-[440px] max-h-full bg-[#D7D7D7] rounded-[24px] p-[24px]" accessibilityViewIsModal>
              <View className="flex-row items-center justify-between mb-[16px]">
                <Text accessibilityRole="header" className="text-[#333333] text-[26px] font-bold shrink">음량 설정</Text>
                <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="닫기" className="min-w-[48px] min-h-[48px] items-center justify-center">
                  <Ionicons name="close" size={28} color="#4A4A4A" />
                </Pressable>
              </View>
              <ScrollView contentContainerClassName="pb-[8px]">
                <Text className="text-[#333333] text-[18px] font-semibold shrink">배경음악</Text>
                <Pressable className="mt-[12px] border-[1px] border-[#707070] bg-[#E5E5E5] rounded-[12px] p-[14px] min-h-[52px] flex-row items-center justify-between gap-[8px]" disabled={!ready}
                  accessibilityRole="button" accessibilityLabel={`배경음악 선택, ${BACKGROUND_TRACKS[settings.backgroundTrack].label}`}
                  accessibilityState={{ expanded: dropdownOpen, disabled: !ready }}
                  onPress={() => setDropdownOpen(!dropdownOpen)}>
                  <Text className="text-[#333333] text-[18px] shrink">{BACKGROUND_TRACKS[settings.backgroundTrack].label}</Text>
                  <Ionicons name={dropdownOpen ? "chevron-up" : "chevron-down"} size={22} color="#55595A" />
                </Pressable>
                {dropdownOpen && (
                  <View className="mt-[6px] border-[1px] border-[#707070] rounded-[12px] overflow-hidden bg-[#E5E5E5]">
                    {(Object.keys(BACKGROUND_TRACKS) as (keyof typeof BACKGROUND_TRACKS)[]).map((track) => (
                      <Pressable key={track} className="min-h-[52px] p-[14px] flex-row items-center justify-between" accessibilityRole="radio"
                        accessibilityState={{ checked: settings.backgroundTrack === track }}
                        onPress={() => {
                          updateSettings({ backgroundTrack: track });
                          setDropdownOpen(false);
                        }}>
                        <Text className="text-[#333333] text-[18px] shrink">{BACKGROUND_TRACKS[track].label}</Text>
                        {settings.backgroundTrack === track && <Ionicons name="checkmark" size={22} color="#55595A" />}
                      </Pressable>
                    ))}
                  </View>
                )}
                <VolumeControl label="효과음" volume={settings.effectsVolume} muted={settings.effectsMuted} disabled={!ready}
                  onMute={() => updateSettings({ effectsMuted: !settings.effectsMuted })}
                  onChange={(effectsVolume) => updateSettings({ effectsVolume, effectsMuted: false })} />
                <VolumeControl label="배경음악" volume={settings.musicVolume} muted={settings.musicMuted} disabled={!ready}
                  onMute={() => updateSettings({ musicMuted: !settings.musicMuted })}
                  onChange={(musicVolume) => updateSettings({ musicVolume, musicMuted: false })} />
              </ScrollView>
              <Pressable className="mt-[24px] min-h-[52px] rounded-[12px] p-[12px] bg-[#55595A] items-center justify-center" onPress={close} accessibilityRole="button">
                <Text className="text-[#FFFFFF] text-[18px] font-semibold">확인</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

function VolumeControl({ label, volume, muted, disabled, onMute, onChange }: {
  label: string;
  volume: number;
  muted: boolean;
  disabled: boolean;
  onMute: () => void;
  onChange: (value: number) => void;
}) {
  const silent = muted || volume === 0;
  return (
    <View className="mt-[28px]">
      <View className="flex-row items-center justify-between gap-[8px]">
        <Text className="text-[#333333] text-[18px] font-semibold shrink">{label} 소리 조절</Text>
        <Text className="text-[#4A4A4A] text-[16px] font-semibold">{silent ? "무음" : `${Math.round(volume * 100)}%`}</Text>
      </View>
      <View className="flex-row items-center gap-[8px] mt-[12px]">
        <Pressable className={`min-h-[64px] min-w-[56px] p-[6px] items-center justify-center rounded-[12px] border-[1px] ${silent ? "bg-[#BDBDBD] border-[#55595A]" : "border-[#707070]"}`} onPress={onMute} disabled={disabled}
          accessibilityRole="button" accessibilityLabel={`${label} ${muted ? "무음 해제" : "무음"}`}
          accessibilityState={{ selected: muted, disabled }}>
          <Ionicons name={silent ? "volume-mute-outline" : "volume-high-outline"} size={23} color="#4A4A4A" />
          <Text className="text-[#4A4A4A] text-[12px] mt-[2px]">{muted ? "해제" : "무음"}</Text>
        </Pressable>
        <View className="flex-1">
          <VolumeSlider className="w-full h-[44px]" minimumValue={0} maximumValue={1} step={0.01}
            value={muted ? 0 : volume} onValueChange={onChange} disabled={disabled}
            minimumTrackTintColor="#55595A" maximumTrackTintColor="#BDBDBD" thumbTintColor="#333333"
            accessibilityLabel={`${label} 음량`} />
          <View className="flex-row justify-between px-[12px]"><Text className="text-[12px] text-[#555555]">0</Text><Text className="text-[12px] text-[#555555]">100</Text></View>
        </View>
      </View>
    </View>
  );
}
