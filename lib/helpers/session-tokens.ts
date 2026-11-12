import setCookieParser from "set-cookie-parser";
import { apiRequest } from "./fetch/typedFetchWrapper";

// Session token handling shared by proxy.ts and server code. Kept free of
// next/headers so the proxy can import it.

export const ACCESS_COOKIE = "x-access-token";
export const REFRESH_COOKIE = "x-refresh-token";

export type SessionCookie = {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    path: "/";
    sameSite: "lax";
    secure: boolean;
    maxAge?: number;
    expires?: Date;
  };
};

// The backend sets both tokens as cookies on its own domain; these are copied
// onto this app's domain (httpOnly) so the browser never sees the raw tokens.
export function sessionCookiesFrom(response: Response): SessionCookie[] {
  const raw = response.headers.getSetCookie();
  if (!raw.length) return [];
  return setCookieParser
    .parse(raw)
    .filter((c) => c.name === ACCESS_COOKIE || c.name === REFRESH_COOKIE)
    .map((c) => ({
      name: c.name,
      value: c.value,
      options: {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: c.maxAge,
        expires: c.expires,
      },
    }));
}

// True when a JWT expires within `withinSeconds`. Tokens that aren't JWTs (the
// mock session) never count as expiring.
export function isTokenExpiring(token: string, withinSeconds = 30) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (typeof payload.exp !== "number") return false;
    return payload.exp * 1000 - Date.now() < withinSeconds * 1000;
  } catch {
    return false;
  }
}

export type RefreshResult =
  | { ok: true; accessToken: string; cookies: SessionCookie[] }
  // expired: the refresh token was rejected, so the user must log in again.
  // Otherwise the backend couldn't be reached and the session may still be fine.
  | { ok: false; expired: boolean; message: string };

const globalForRefresh = globalThis as typeof globalThis & {
  __fueltapRefreshes?: Map<string, Promise<RefreshResult>>;
};
const inFlight = (globalForRefresh.__fueltapRefreshes ??= new Map());

// The backend rotates refresh tokens, so a page that loads several things at
// once must not refresh once per request: the second refresh would present an
// already-used token and end the session. Callers holding the same refresh
// token share one refresh, and its result is kept briefly for stragglers.
export function refreshSession(refreshToken: string): Promise<RefreshResult> {
  const existing = inFlight.get(refreshToken);
  if (existing) return existing;

  const refresh = (async (): Promise<RefreshResult> => {
    const { response, result } = await apiRequest(
      "api/v1/auth/refresh-token",
      "POST",
      undefined,
      {
        headers: { Cookie: `${REFRESH_COOKIE}=${refreshToken}` },
        skipRefresh: true,
      },
    );

    if (!result.success) {
      const expired = [400, 401, 403].includes(result.statusCode);
      return { ok: false, expired, message: result.message };
    }

    const cookies = sessionCookiesFrom(response);
    const accessToken = cookies.find((c) => c.name === ACCESS_COOKIE)?.value;
    if (!accessToken) {
      console.error("Token refresh succeeded but returned no access cookie.");
      return { ok: false, expired: true, message: result.message };
    }
    return { ok: true, accessToken, cookies };
  })();

  inFlight.set(refreshToken, refresh);
  void refresh.finally(() =>
    setTimeout(() => inFlight.delete(refreshToken), 15_000),
  );
  return refresh;
}
