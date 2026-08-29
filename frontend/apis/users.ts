import { apiRequest } from "./client";

export type UserRole = "USER" | "GUARDIAN";

export type CreateUserPayload = {
  name: string;
  phone?: string;
  email?: string;
  password: string;
  role: UserRole;
  birth_date?: string;
  profile_url?: string;
};

export type UserResponse = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  role: string;
  birth_date: string | null;
  profile_url: string | null;
  created_at: string;
};

export function createUser(payload: CreateUserPayload): Promise<UserResponse> {
  return apiRequest<UserResponse>("/auth/register", {
    method: "POST",
    defaultErrorMessage: "회원가입에 실패했습니다.",
    body: JSON.stringify(payload),
  });
}
