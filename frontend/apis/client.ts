export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8001";
const API_TIMEOUT_MS = 10000;
const UPLOAD_TIMEOUT_MS = 45000;

type RequestOptions = RequestInit & {
    authToken?: string;
    defaultErrorMessage?: string;
  };

async function parseResponse(response: Response) {
    const text = await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

export async function apiRequest<T>(
    path: string,
    {
      authToken,
      defaultErrorMessage = "API request failed.",
      headers,
      ...options
    }: RequestOptions = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...headers,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("서버 응답 시간이 초과되었습니다. 백엔드 서버 상태를 확인해주세요.");
      }

      throw new Error("서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await parseResponse(response);

    if (!response.ok) {
      const message =
        data && typeof data === "object" && "detail" in data
          ? String(data.detail)
          : defaultErrorMessage;

      throw new Error(message);
    }

    return data as T;
  }

export async function apiUpload<T>(
    path: string,
    formData: FormData,
    {
      authToken,
      defaultErrorMessage = "API request failed.",
      headers,
      ...options
    }: RequestOptions = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        ...options,
        body: formData,
        signal: controller.signal,
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...headers,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("서버 응답 시간이 초과되었습니다. 백엔드 서버 상태를 확인해주세요.");
      }

      throw new Error("서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await parseResponse(response);

    if (!response.ok) {
      const message =
        data && typeof data === "object" && "detail" in data
          ? String(data.detail)
          : defaultErrorMessage;

      throw new Error(message);
    }

    return data as T;
  }
