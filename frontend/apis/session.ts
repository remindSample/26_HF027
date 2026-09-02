import type { LoginResponse } from "./auth";

const FALLBACK_USER_ID = 1;
const AUTH_SESSION_STORAGE_KEY = "remind_auth_session";

let authSession: LoginResponse | null = null;
let currentUserId: number | null = null;

function getStoredAuthSession(): LoginResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as LoginResponse;
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
}

function getDevAuthSession(): LoginResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const mockRole = new URLSearchParams(window.location.search).get("mockRole");

  if (mockRole !== "USER" && mockRole !== "GUARDIAN") {
    return null;
  }

  return {
    access_token: "dev-token",
    token_type: "bearer",
    user: {
      id: FALLBACK_USER_ID,
      name: "Dev User",
      role: mockRole,
    },
  };
}

export function setAuthSession(session: LoginResponse) {
  authSession = session;
  currentUserId = session.user.id;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  }
}

export function getAuthSession() {
  authSession = authSession ?? getStoredAuthSession();
  return authSession ?? getDevAuthSession();
}

export function clearAuthSession() {
  authSession = null;
  currentUserId = null;

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  }
}

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
}

export function getCurrentUserId() {
  authSession = authSession ?? getStoredAuthSession();
  return currentUserId ?? authSession?.user.id ?? FALLBACK_USER_ID;
}
