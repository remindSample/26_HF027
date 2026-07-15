const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export type SignupPayload = {
  name: string;
  password: string;
  role: "USER" | "GUARDIAN";
  phone?: string;
  email?: string;
};

export type SignupResponse = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  role: string;
  birth_date: string | null;
  profile_url: string | null;
  created_at: string;
};

export async function signupUser(payload: SignupPayload): Promise<SignupResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail ?? "회원가입에 실패했습니다.");
  }

  return data;
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

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail ?? "로그인에 실패했습니다.");
  }

  return data;
}
