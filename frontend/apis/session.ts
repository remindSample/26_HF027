import AsyncStorage from "@react-native-async-storage/async-storage";

import type { LoginResponse } from "./auth";

const FALLBACK_USER_ID = 1;
const AUTH_SESSION_STORAGE_KEY = "remind_auth_session";

let authSession: LoginResponse | null = null;
let currentUserId: number | null = null;

async function getStoredAuthSession(): Promise<LoginResponse | null> {
  const stored = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as LoginResponse;
  } catch {
    await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
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

export async function setAuthSession(session: LoginResponse) {
  authSession = session;
  currentUserId = session.user.id;

  await AsyncStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function getAuthSession() {
  authSession = authSession ?? await getStoredAuthSession();
  return authSession ?? getDevAuthSession();
}

export async function clearAuthSession() {
  authSession = null;
  currentUserId = null;

  await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
}

export async function getCurrentUserId() {
  authSession = authSession ?? await getStoredAuthSession();
  return currentUserId ?? authSession?.user.id ?? FALLBACK_USER_ID;
}
