import { apiRequest } from "./client";
import { getCurrentUserId } from "./session";

export type GameSessionResponse = {
  id: number;
  user_id: number | null;
  level: number;
  status: string;
  started_at: string;
};

export type GameGesture = "FIST" | "PALM";
export type GameHand = "LEFT" | "RIGHT";

export async function startGameSession(level: number, userId?: number) {
  const resolvedUserId = userId ?? await getCurrentUserId();

  return apiRequest<GameSessionResponse>("/game/sessions", {
    method: "POST",
    body: JSON.stringify({ user_id: resolvedUserId, level }),
  });
}

export function saveGameEvent(payload: {
  session_id: number;
  hand_side: GameHand;
  target_gesture: GameGesture;
  user_input: GameGesture | null;
  is_correct: boolean;
}) {
  return apiRequest("/game/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function finishGameSession(
  sessionId: number,
  successCount: number,
  totalCount: number
) {
  return apiRequest(`/game/sessions/${sessionId}/finish`, {
    method: "POST",
    body: JSON.stringify({
      success_count: successCount,
      total_count: totalCount,
    }),
  });
}
