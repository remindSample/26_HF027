import { apiRequest } from "./client";

export type AnswerMarkResponse = {
  answer_id: number;
};

export async function getAnswerFavorites(userId: number) {
  return apiRequest<AnswerMarkResponse[]>(`/answer-favorites/user/${userId}`, {
    defaultErrorMessage: "즐겨찾기를 불러오지 못했습니다.",
  });
}

export async function addAnswerFavorite(answerId: number, userId: number) {
  return apiRequest<AnswerMarkResponse>("/answer-favorites", {
    method: "POST",
    defaultErrorMessage: "즐겨찾기 저장에 실패했습니다.",
    body: JSON.stringify({ answer_id: answerId, user_id: userId }),
  });
}

export async function removeAnswerFavorite(answerId: number, userId: number) {
  return apiRequest<null>(`/answer-favorites/${answerId}/user/${userId}`, {
    method: "DELETE",
    defaultErrorMessage: "즐겨찾기 해제에 실패했습니다.",
  });
}

export async function getAnswerLikes(guardianId: number) {
  return apiRequest<AnswerMarkResponse[]>(`/answer-likes/guardian/${guardianId}`, {
    defaultErrorMessage: "좋아요를 불러오지 못했습니다.",
  });
}

export async function addAnswerLike(answerId: number, guardianId: number) {
  return apiRequest<AnswerMarkResponse>("/answer-likes", {
    method: "POST",
    defaultErrorMessage: "좋아요 저장에 실패했습니다.",
    body: JSON.stringify({ answer_id: answerId, guardian_id: guardianId }),
  });
}

export async function removeAnswerLike(answerId: number, guardianId: number) {
  return apiRequest<null>(`/answer-likes/${answerId}/guardian/${guardianId}`, {
    method: "DELETE",
    defaultErrorMessage: "좋아요 해제에 실패했습니다.",
  });
}
