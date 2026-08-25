const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";
const FALLBACK_USER_ID = 1;

let currentUserId: number | null = null;

async function requestJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail ?? "API 요청에 실패했습니다.");
  }

  return data;
}

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
}

export function getCurrentUserId() {
  return currentUserId ?? FALLBACK_USER_ID;
}

export type SignupPayload = {
  name: string;
  password: string;
  role: "USER" | "GUARDIAN";
  phone?: string;
  email?: string;
};

export type SignupResponse = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  role: string;
  birth_date: string | null;
  profile_url: string | null;
  created_at: string;
};

export async function signupUser(payload: SignupPayload): Promise<SignupResponse> {
  return requestJson<SignupResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
};

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return requestJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type QuestionResponse = {
  id: number;
  created_by: number | null;
  target_user_id: number | null;
  welfare_center_id: number | null;
  keyword_id: number | null;
  content: string;
  q_type: string | null;
  source: string;
  model_source: string | null;
  created_at: string;
};

export async function getQuestionsByUser(userId = getCurrentUserId()) {
  return requestJson<QuestionResponse[]>(`/questions/user/${userId}`);
}

export type AnswerPayload = {
  user_id?: number;
  question_id: number;
  input_type?: "text" | "handwriting";
  content_text?: string | null;
  image_url?: string | null;
  ocr_text?: string | null;
  is_private?: boolean;
};

export type AnswerResponse = {
  id: number;
  user_id: number;
  question_id: number;
  input_type: string;
  content_text: string | null;
  image_url: string | null;
  ocr_text: string | null;
  is_private: boolean;
  answered_at: string;
};

export async function submitAnswer(payload: AnswerPayload) {
  return requestJson<AnswerResponse>("/answers", {
    method: "POST",
    body: JSON.stringify({
      user_id: payload.user_id ?? getCurrentUserId(),
      input_type: "text",
      is_private: false,
      ...payload,
    }),
  });
}

export type GameSessionResponse = {
  id: number;
  user_id: number | null;
  level: number;
  status: string;
  started_at: string;
};

export async function startGameSession(level: number, userId = getCurrentUserId()) {
  return requestJson<GameSessionResponse>("/game/sessions", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, level }),
  });
}

export type GameGesture = "FIST" | "PALM";
export type GameHand = "LEFT" | "RIGHT";

export async function saveGameEvent(payload: {
  session_id: number;
  hand_side: GameHand;
  target_gesture: GameGesture;
  user_input: GameGesture | null;
  is_correct: boolean;
}) {
  return requestJson("/game/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function finishGameSession(
  sessionId: number,
  successCount: number,
  totalCount: number
) {
  return requestJson(`/game/sessions/${sessionId}/finish`, {
    method: "POST",
    body: JSON.stringify({
      success_count: successCount,
      total_count: totalCount,
    }),
  });
}
