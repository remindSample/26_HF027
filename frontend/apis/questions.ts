import { apiRequest } from "./client";
import { getCurrentUserId } from "./session";

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

export type QuestionTag = "family" | "food" | "travel" | "season" | "hobby";

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
