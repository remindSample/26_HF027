import { apiRequest } from "./client";
import { getCurrentUserId } from "./session";

export type GameSessionResponse = {
  id: number;
  user_id: number | null;
  level: number;
  status: string;
  started_at: string;
};

export type GameGesture = "FIST" | "PALM" | "SCISSORS";
export type GameHand = "LEFT" | "RIGHT";

export type GameEventPayload = {
  session_id: number;
  hand_side: GameHand;
  target_gesture: GameGesture;
  user_input: GameGesture | null;
  is_correct: boolean;
};

export type GameEventResponse = GameEventPayload & {
  id: number;
  created_at: string;
};

export type GameSessionResult = {
  id: number;
  level: number;
  total_score: number;
  success_count: number;
  total_count: number;
  accuracy: number;
  started_at: string;
  ended_at: string | null;
};

export type MonthlyGameReport = {
  year: number;
  month: number;
  session_count: number;
  success_count: number;
  total_count: number;
  accuracy: number | null;
  accuracy_diff_pct: number | null;
  total_score: number;
  has_last_month_data: boolean;
};

export async function startGameSession(level: number, userId?: number) {
  const resolvedUserId = userId ?? await getCurrentUserId();

  return apiRequest<GameSessionResponse>("/game/sessions", {
    method: "POST",
    body: JSON.stringify({ user_id: resolvedUserId, level }),
  });
}

export function saveGameEvent(payload: GameEventPayload) {
  return apiRequest<GameEventResponse>("/game/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getGameEvents(sessionId: number) {
  return apiRequest<GameEventResponse[]>(`/game/events/${sessionId}`);
}

export function getGameSessionResult(sessionId: number) {
  return apiRequest<GameSessionResult>(`/game/sessions/${sessionId}/result`);
}

export function finishGameSession(
  sessionId: number,
  successCount: number,
  totalCount: number
) {
  return apiRequest<GameSessionResult>(`/game/sessions/${sessionId}/finish`, {
    method: "POST",
    body: JSON.stringify({
      success_count: successCount,
      total_count: totalCount,
    }),
  });
}

export async function getMonthlyGameReport(
  year: number,
  month: number,
  userId?: number
) {
  const resolvedUserId = userId ?? await getCurrentUserId();

  return apiRequest<MonthlyGameReport>(
    `/game/sessions/report?year=${year}&month=${month}&user_id=${resolvedUserId}`
  );
}
