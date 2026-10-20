import { apiRequest } from "./client";
import { getAuthSession, getCurrentUserId } from "./session";

export type QuestionResponse = {
  id: number;
  created_by: number | null;
  target_user_id: number | null;
  keyword_id: number | null;
  content: string;
  q_type: string | null;
  source: string;
  model_source: string | null;
  created_at: string;
};

export async function getQuestionsByUser(userId?: number) {
  const resolvedUserId = userId ?? await getCurrentUserId();

  return apiRequest<QuestionResponse[]>(`/questions/user/${resolvedUserId}`);
}

export type QuestionTag =
  | "family"
  | "food"
  | "travel"
  | "season"
  | "hobby"
  | "childhood"
  | "friend";

export async function generateQuestion(tag: QuestionTag, userId?: number) {
  const resolvedUserId = userId ?? await getCurrentUserId();

  return apiRequest<QuestionResponse>("/questions/generate", {
    method: "POST",
    body: JSON.stringify({
      tag,
      target_user_id: resolvedUserId,
    }),
  });
}

export type GuardianQuestionResponse = QuestionResponse & {
  answered: boolean;
  answered_at: string | null;
  guardian_name: string | null;
};

export async function createGuardianQuestion(content: string, targetUserId: number) {
  const session = await getAuthSession();

  return apiRequest<QuestionResponse>("/questions/guardian", {
    method: "POST",
    authToken: session?.access_token,
    defaultErrorMessage: "질문 등록에 실패했습니다.",
    body: JSON.stringify({
      content,
      target_user_id: targetUserId,
    }),
  });
}

export async function getGuardianQuestions(userId?: number) {
  const session = await getAuthSession();
  const resolvedUserId = userId ?? await getCurrentUserId();

  return apiRequest<GuardianQuestionResponse[]>(
    `/questions/user/${resolvedUserId}/guardian`,
    {
      authToken: session?.access_token,
      defaultErrorMessage: "보호자 질문을 불러오지 못했습니다.",
    }
  );
}

export async function getGuardianUnansweredCount(userId?: number) {
  const session = await getAuthSession();
  const resolvedUserId = userId ?? await getCurrentUserId();

  return apiRequest<{ count: number }>(
    `/questions/user/${resolvedUserId}/guardian/unanswered-count`,
    {
      authToken: session?.access_token,
      defaultErrorMessage: "보호자 질문 개수를 불러오지 못했습니다.",
    }
  );
}
