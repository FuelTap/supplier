"use server";

import { cookies } from "next/headers";
import type { User } from "@/context/AuthProvider";
import { syncBackendCookies } from "@/lib/helpers/auth-cookies";
import { authenticatedApiRequest } from "@/lib/helpers/fetch/authenticatedApiRequest";
import { apiRequest } from "@/lib/helpers/fetch/typedFetchWrapper";
import type { LoginInput } from "@/lib/validators/authSchema";

// Signs in against the backend and stores its session cookies (httpOnly) on
// this app's domain.
export async function loginAction(credentials: LoginInput) {
  const { response, result } = await apiRequest(
    "/api/v1/auth/login",
    "POST",
    credentials,
    { skipRefresh: true },
  );

  if (!result.success) return result;

  await syncBackendCookies(response);
  const accessToken = (await cookies()).get("x-access-token")?.value;
  if (!accessToken) {
    return {
      success: false,
      status: "error",
      message:
        "Login succeeded, but no session cookie was received. Please try again.",
    };
  }
  return result;
}

export async function logoutAction(userId: string) {
  try {
    await authenticatedApiRequest(
      "api/v1/auth/logout",
      "POST",
      { userId },
      // Logout must finish clearing cookies even when the session has expired.
      { skipAuthRedirect: true },
    );
  } catch {
    return { success: false, error: "Backend request failed" };
  }

  const cookieStore = await cookies();
  cookieStore.delete("x-access-token");
  cookieStore.delete("x-refresh-token");
  return { success: true };
}

export async function getUserProfile() {
  return await authenticatedApiRequest<void, { user: User }>(
    "/api/v1/auth/user",
    "GET",
  );
}

export async function refreshTokens(): Promise<boolean> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("x-refresh-token")?.value;

  if (!refreshToken) {
    return false;
  }

  const { response, result } = await apiRequest(
    "api/v1/auth/refresh-token",
    "POST",
    undefined,
    {
      headers: {
        Cookie: `x-refresh-token=${refreshToken}`,
      },
      skipRefresh: true,
    },
  );

  if (response.ok && result.success) {
    await syncBackendCookies(response);
    return true;
  }

  return false;
}
