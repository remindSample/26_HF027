export const API_BASE_URL = "http://65.0.99.246:8000";

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
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    });

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
