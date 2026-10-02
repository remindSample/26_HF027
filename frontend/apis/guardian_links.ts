import { apiRequest } from "./client";

export type GuardianLinkStatus = "pending" | "accepted" | "rejected";

export type GuardianLinkResponse = {
  id: number;
  guardian_id: number;
  elder_id: number;
  status: GuardianLinkStatus;
  linked_at: string | null;
  created_at: string;
};

export function getGuardianLinksByGuardian(
  guardianId: number
): Promise<GuardianLinkResponse[]> {
  return apiRequest<GuardianLinkResponse[]>(
    `/guardian-links/guardian/${guardianId}`,
    {
      defaultErrorMessage: "연결된 어르신 정보를 불러오지 못했습니다.",
    }
  );
}
