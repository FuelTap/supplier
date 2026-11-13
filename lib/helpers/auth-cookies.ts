import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  type SessionCookie,
  sessionCookiesFrom,
} from "./session-tokens";

/**
 * Parses Set-Cookie headers from a backend response and applies them to Next.js cookie store.
 * MUST be called within a Server Action or Route Handler context.
 */
export async function syncBackendCookies(
  backendResponse: Response,
): Promise<void> {
  await storeSessionCookies(sessionCookiesFrom(backendResponse));
}

export async function storeSessionCookies(sessionCookies: SessionCookie[]) {
  const cookieStore = await cookies();
  for (const cookie of sessionCookies) {
    cookieStore.set(cookie.name, cookie.value, cookie.options);
  }
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}
