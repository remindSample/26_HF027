export type Side = "LEFT" | "RIGHT";
export type Gesture = "FIST" | "PALM";

export type GloveInput = {
  side: Side;
  gesture: Gesture;
};

export function parseGloveMessage(message: string): GloveInput | null {
  const normalized = message.trim();

  if (normalized.startsWith("{")) {
    return parseJsonMessage(normalized);
  }

  const [sideRaw, gestureRaw] = normalized.split(/[,:]/);
  return normalizeInput(sideRaw, gestureRaw);
}

export function parseGestureMessage(message: string): Gesture | null {
  const gesture = message.trim().toUpperCase();
  if (gesture !== "FIST" && gesture !== "PALM") return null;

  return gesture;
}

function parseJsonMessage(message: string): GloveInput | null {
  try {
    const parsed = JSON.parse(message) as {
      side?: string;
      hand?: string;
      gesture?: string;
    };

    return normalizeInput(parsed.side ?? parsed.hand, parsed.gesture);
  } catch {
    return null;
  }
}

function normalizeInput(sideRaw?: string, gestureRaw?: string): GloveInput | null {
  const side = sideRaw?.trim().toUpperCase();
  const gesture = gestureRaw?.trim().toUpperCase();

  if (side !== "LEFT" && side !== "RIGHT") return null;
  if (gesture !== "FIST" && gesture !== "PALM") return null;

  return { side, gesture };
}
