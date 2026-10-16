import { apiRequest } from "./client";
import { getAuthSession } from "./session";

export type GuardianLinkStatus = "pending" | "accepted" | "rejected";

export type GuardianLinkResponse = {
  id: number;
  guardian_id: number;
  elder_id: number;
  status: GuardianLinkStatus;
  linked_at: string | null;
  created_at: string;
};

export async function getGuardianLinksByGuardian(
  guardianId: number
): Promise<GuardianLinkResponse[]> {
  const session = await getAuthSession();

  return apiRequest<GuardianLinkResponse[]>(
    `/guardian-links/guardian/${guardianId}`,
    {
      authToken: session?.access_token,
      defaultErrorMessage: "연결된 어르신 정보를 불러오지 못했습니다.",
    }
  );
}

export async function getCurrentGuardianAcceptedLink() {
  const session = await getAuthSession();
  if (!session) {
    return null;
  }

  const links = await getGuardianLinksByGuardian(session.user.id);
  return links.find((link) => link.status === "accepted") ?? null;
}

export async function getGuardianLinksByElder(
  elderId: number
): Promise<GuardianLinkResponse[]> {
  const session = await getAuthSession();

  return apiRequest<GuardianLinkResponse[]>(`/guardian-links/elder/${elderId}`, {
    authToken: session?.access_token,
    defaultErrorMessage: "연결된 보호자 정보를 불러오지 못했습니다.",
  });
}

export async function getMyGuardianRequests(): Promise<GuardianLinkResponse[]> {
  const session = await getAuthSession();

  return apiRequest<GuardianLinkResponse[]>("/guardian-links/me/requests", {
    authToken: session?.access_token,
    defaultErrorMessage: "보호자 연결 요청을 불러오지 못했습니다.",
  });
}

export async function createGuardianInvite(
  inviteCode: string
): Promise<GuardianLinkResponse> {
  const session = await getAuthSession();

  return apiRequest<GuardianLinkResponse>("/guardian-links/invite", {
    method: "POST",
    authToken: session?.access_token,
    defaultErrorMessage: "사용자 연결 요청에 실패했습니다.",
    body: JSON.stringify({ invite_code: inviteCode }),
  });
}

export async function updateGuardianLinkStatus(
  linkId: number,
  status: "accepted" | "rejected"
): Promise<GuardianLinkResponse> {
  const session = await getAuthSession();

  return apiRequest<GuardianLinkResponse>(`/guardian-links/${linkId}/status`, {
    method: "PATCH",
    authToken: session?.access_token,
    defaultErrorMessage: "연결 요청 상태 변경에 실패했습니다.",
    body: JSON.stringify({ status }),
  });
}
