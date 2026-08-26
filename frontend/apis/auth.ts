import { apiRequest } from "./client";
import { createUser } from "./users";
import type { CreateUserPayload, UserResponse } from "./users";

export type SignupPayload = CreateUserPayload;

export type SignupResponse = UserResponse;

export function signupUser(payload: SignupPayload): Promise<SignupResponse> {
  return createUser(payload);
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

export function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    defaultErrorMessage: "로그인에 실패했습니다.",
    body: JSON.stringify(payload),
  });
}
