import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { storeSessionCookies } from "@/lib/helpers/auth-cookies";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  refreshSession,
} from "@/lib/helpers/session-tokens";
import {
  apiRequest,
  ApiRequestOptions,
  ApiResponse,
  fallbackMessage,
} from "./typedFetchWrapper";

function withToken(base: HeadersInit | undefined, token: string | undefined) {
  const headers = new Headers(base);
  if (token) {
    // The API documents bearer auth; the cookie keeps older routes working.
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("Cookie", `${ACCESS_COOKIE}=${token}`);
  }
  return headers;
}

/**
 * Wrapper around apiRequest that handles access token injection and silent 401 refresh retries.
 */
export async function authenticatedApiRequest<
  TRequest = unknown,
  TResponse = unknown,
>(
  endpoint: string,
  method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH" = "GET",
  data?: TRequest,
  options: ApiRequestOptions & { skipAuthRedirect?: boolean } = {},
): Promise<ApiResponse<TResponse>> {
  // Logout must finish clearing cookies even when the session has expired.
  const { skipAuthRedirect = false, ...requestOptions } = options;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  const signedOut: ApiResponse<TResponse> = {
    success: false,
    status: "error",
    statusCode: 401,
    message: fallbackMessage(401),
  };

  if (!accessToken && !refreshToken) {
    if (!skipAuthRedirect) redirect("/login");
    return signedOut;
  }

  const send = (token: string | undefined) =>
    apiRequest<TRequest, TResponse>(endpoint, method, data, {
      ...requestOptions,
      headers: withToken(options.headers, token),
    });

  let { result } = await send(accessToken);

  // proxy.ts refreshes tokens before pages render, so this mainly covers a
  // token that expired mid-request or during a long-open page.
  if (result.statusCode === 401 && !options.skipRefresh && refreshToken) {
    const refreshed = await refreshSession(refreshToken);

    if (refreshed.ok) {
      try {
        await storeSessionCookies(refreshed.cookies);
      } catch {
        // Server Components can't set cookies; the proxy stores them on the
        // next navigation. This request still uses the new token below.
      }
      ({ result } = await send(refreshed.accessToken));
    } else if (!refreshed.expired) {
      // The backend is unreachable. The session may still be valid, so report
      // the outage instead of signing the user out.
      return { ...signedOut, statusCode: 0, message: refreshed.message };
    }
  }

  if (result.statusCode === 401 && !skipAuthRedirect) {
    redirect("/login");
  }
  return result;
}
