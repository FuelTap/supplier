"use server";

import type { User } from "@/context/AuthProvider";
import {
  clearSessionCookies,
  syncBackendCookies,
} from "@/lib/helpers/auth-cookies";
import { authenticatedApiRequest } from "@/lib/helpers/fetch/authenticatedApiRequest";
import {
  apiRequest,
  type ApiResponse,
} from "@/lib/helpers/fetch/typedFetchWrapper";
import { ACCESS_COOKIE } from "@/lib/helpers/session-tokens";
import {
  loginAccountTypeSchema,
  type LoginAccountType,
  type LoginInput,
} from "@/lib/validators/authSchema";
import { cookies } from "next/headers";

// Signs in against the backend and stores its session cookies (httpOnly) on
// this app's domain.
export async function loginAction(
  credentials: LoginInput,
  accountType: LoginAccountType = "supplier",
): Promise<ApiResponse> {
  const parsedType = loginAccountTypeSchema.safeParse(accountType);
  if (!parsedType.success) {
    return {
      success: false,
      status: "error",
      statusCode: 400,
      message: "Choose supplier or station manager to sign in.",
    };
  }
  const { response, result } = await apiRequest(
    parsedType.data === "manager"
      ? "/api/v1/supplier/station-auth/login"
      : "/api/v1/supplier/auth/login",
    "POST",
    credentials,
    { skipRefresh: true },
  );

  if (!result.success) {
    return result.statusCode === 401
      ? {
          ...result,
          message: "The email or password you entered is incorrect.",
        }
      : result;
  }

  await syncBackendCookies(response);
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return {
      success: false,
      status: "error",
      statusCode: response.status,
      message:
        "Login succeeded, but no session cookie was received. Please try again.",
    };
  }
  return result;
}

// The API has no logout endpoint; signing out drops this app's session cookies.
export async function logoutAction() {
  await clearSessionCookies();
  return { success: true };
}

// GET /auth/user returns the account either wrapped as { user } or bare.
function toUser(data: unknown): User | undefined {
  const raw =
    data && typeof data === "object" && "user" in data
      ? (data as { user: unknown }).user
      : data;
  if (!raw || typeof raw !== "object") return undefined;

  const user = raw as Partial<User> & { _id?: string };
  const id = user.id ?? user._id;
  if (typeof id !== "string") return undefined;
  return { ...(user as User), id };
}

export async function getUserProfile(): Promise<ApiResponse<{ user: User }>> {
  const result = await authenticatedApiRequest<void, unknown>(
    "/api/v1/auth/user",
    "GET",
  );
  if (!result.success) return { ...result, data: undefined };

  const user = toUser(result.data);
  if (!user) {
    console.error("GET /auth/user returned an unexpected shape.");
    return {
      ...result,
      success: false,
      status: "error",
      message: "We couldn't read your account details. Please try again.",
      data: undefined,
    };
  }
  return { ...result, data: { user } };
}
