const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const SESSION_KEY = "detech_crm_session";

type ApiOptions = RequestInit & {
  authenticated?: boolean;
};

export type AuthSession = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: Record<string, unknown> | null;
};

export function saveSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    saveSession(null);
    return null;
  }
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { authenticated = false, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Content-Type", "application/json");

  if (authenticated) {
    const session = getSession();
    if (session?.access_token) {
      requestHeaders.set("Authorization", `Bearer ${session.access_token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      headers: requestHeaders,
    });
  } catch (error) {
    throw new Error(
      `Unable to reach the backend at ${API_URL}. Make sure FastAPI is running on port 8000.`,
      { cause: error },
    );
  }
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = body && typeof body.detail === "string" ? body.detail : "Request failed.";
    throw new Error(detail);
  }

  return body as T;
}
