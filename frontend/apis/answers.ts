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
