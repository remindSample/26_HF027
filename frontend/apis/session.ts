import type { LoginResponse } from "./auth";

let authSession: LoginResponse | null = null;

export function setAuthSession(session: LoginResponse) {
  authSession = session;
}

export function getAuthSession() {
  return authSession;
}

export function clearAuthSession() {
  authSession = null;
}
