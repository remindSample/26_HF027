import type { LoginResponse } from "./auth";

const FALLBACK_USER_ID = 1;

let authSession: LoginResponse | null = null;
let currentUserId: number | null = null;

export function setAuthSession(session: LoginResponse) {
  authSession = session;
  currentUserId = session.user.id;
}

export function getAuthSession() {
  return authSession;
}

export function clearAuthSession() {
  authSession = null;
  currentUserId = null;
}

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
}

export function getCurrentUserId() {
  return currentUserId ?? authSession?.user.id ?? FALLBACK_USER_ID;
}
