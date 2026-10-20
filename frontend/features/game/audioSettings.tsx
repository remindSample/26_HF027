import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { usePathname } from "expo-router";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

// Keep filenames ASCII so Android generates a distinct resource name for each track.
export const BACKGROUND_TRACKS = {
  default: { label: "기본 음악", source: require("../../assets/game/sounds/bgm-default.mp3") },
  forest: { label: "숲소리", source: require("../../assets/game/sounds/bgm-forest.mp3") }
};

type AudioSettings = {
  backgroundTrack: keyof typeof BACKGROUND_TRACKS;
  effectsVolume: number;
  musicVolume: number;
  effectsMuted: boolean;
  musicMuted: boolean;
};

const DEFAULT_SETTINGS: AudioSettings = {
  backgroundTrack: "default",
  effectsVolume: 1,
  musicVolume: 0.5,
  effectsMuted: false,
  musicMuted: false
};
const STORAGE_KEY = "game-audio-settings";

const AudioSettingsContext = createContext<{
  settings: AudioSettings;
  ready: boolean;
  updateSettings: (changes: Partial<AudioSettings>) => void;
} | null>(null);

function readVolume(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : fallback;
}

export function AudioSettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const saveQueue = useRef(Promise.resolve());
  const pendingSettings = useRef<AudioSettings | null>(null);
  const saveSettings = useCallback((nextSettings: AudioSettings) => {
    saveQueue.current = saveQueue.current.then(() =>
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings))
    ).catch((error) => {
      console.warn("Audio settings save failed:", error);
    });
  }, []);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (!active || !stored) return;
      const saved = JSON.parse(stored);
      if (!saved || typeof saved !== "object") return;
      setSettings({
        backgroundTrack: saved.backgroundTrack === "forest" ? "forest" : "default",
        effectsVolume: readVolume(saved.effectsVolume, DEFAULT_SETTINGS.effectsVolume),
        musicVolume: readVolume(saved.musicVolume, DEFAULT_SETTINGS.musicVolume),
        effectsMuted: saved.effectsMuted === true,
        musicMuted: saved.musicMuted === true
      });
    }).catch((error) => {
      console.warn("Audio settings load failed:", error);
    }).finally(() => {
      if (active) setReady(true);
    });
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }).catch((error) => {
      console.warn("Audio setup failed:", error);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    pendingSettings.current = settings;
    const timeout = setTimeout(() => {
      saveSettings(settings);
      pendingSettings.current = null;
    }, 150);
    return () => clearTimeout(timeout);
  }, [ready, settings, saveSettings]);

  useEffect(() => () => {
    if (pendingSettings.current) saveSettings(pendingSettings.current);
  }, [saveSettings]);

  return (
    <AudioSettingsContext.Provider value={{
      settings,
      ready,
      updateSettings: (changes) => setSettings((current) => ({ ...current, ...changes }))
    }}>
      {ready && <BackgroundMusic settings={settings} />}
      {children}
    </AudioSettingsContext.Provider>
  );
}

function BackgroundMusic({ settings }: { settings: AudioSettings }) {
  const player = useAudioPlayer(null);
  const pathname = usePathname();
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    player.pause();
    player.replace(BACKGROUND_TRACKS[settings.backgroundTrack].source);
  }, [player, settings.backgroundTrack]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);
    return () => subscription.remove();
  }, []);

  /* eslint-disable react-hooks/immutability -- Expo AudioPlayer settings are mutable native properties. */
  useEffect(() => {
    player.loop = true;
    player.volume = settings.musicVolume;
    player.muted = settings.musicMuted;
    if ((pathname === "/game/play" || pathname === "/game/result") && appState === "active" && !settings.musicMuted && settings.musicVolume > 0) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, pathname, appState, settings.backgroundTrack, settings.musicVolume, settings.musicMuted]);
  /* eslint-enable react-hooks/immutability */

  return null;
}

export function useAudioSettings() {
  const context = useContext(AudioSettingsContext);
  if (!context) throw new Error("AudioSettingsProvider is required");
  return context;
}
