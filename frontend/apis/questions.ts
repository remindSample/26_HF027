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

export function getQuestionsByUser(userId = getCurrentUserId()) {
  return apiRequest<QuestionResponse[]>(`/questions/user/${userId}`);
}
