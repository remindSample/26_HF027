import { apiRequest } from "./client";
import { getCurrentUserId } from "./session";

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
  word_count: number | null;
  sentence_count: number | null;
  avg_sentence_length: number | null;
  unique_word_ratio: number | null;
  repeated_word_count: number | null;
  positive_score: number | null;
  negative_score: number | null;
  answered_at: string;
};

export type MonthlyAnswerReport = {
  year: number;
  month: number;
  answer_count: number;
  answers: AnswerResponse[];
  avg_word_count: number;
  avg_sentence_count: number;
  avg_complexity_score: number;
  sentiment_summary: Record<string, number>;
  ai_comment: string;
};

export function submitAnswer(payload: AnswerPayload) {
  return apiRequest<AnswerResponse>("/answers", {
    method: "POST",
    body: JSON.stringify({
      user_id: payload.user_id ?? getCurrentUserId(),
      input_type: "text",
      is_private: false,
      ...payload,
    }),
  });
}

export function getMonthlyAnswerReport(
  year: number,
  month: number,
  userId = getCurrentUserId()
) {
  return apiRequest<MonthlyAnswerReport>(
    `/answers/report?year=${year}&month=${month}&user_id=${userId}`
  );
}
