"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { apiRequest } from "@/lib/helpers/fetch/typedFetchWrapper";
import { getUserProfile, loginAction, logoutAction } from "@/lib/server/auth";
import {
  loginSchema,
  passwordSchema,
  type LoginInput,
} from "@/lib/validators/authSchema";
import { getStore, wait } from "./mock";
import {
  hasAdminRole,
  isAdminMockAuth,
  SESSION_COOKIE,
  startMockSession,
} from "./session";
import type { ActionResult, Invite, QueryResult } from "./types";

export async function adminLogin(credentials: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  if (isAdminMockAuth()) {
    await wait();
    await startMockSession();
    return { success: true, message: "Signed in." };
  }

  const result = await loginAction(parsed.data);
  if (!result.success) return { success: false, message: result.message };

  // Only parent suppliers may use this app; station managers have their own.
  const profile = await getUserProfile();
  if (!profile.success || !profile.data) {
    await logoutAction();
    return { success: false, message: profile.message };
  }
  if (!hasAdminRole(profile.data.user)) {
    await logoutAction();
    return {
      success: false,
      message: "This account doesn't have supplier access.",
    };
  }
  return { success: true, message: result.message };
}

export async function adminLogout(): Promise<ActionResult> {
  if (isAdminMockAuth()) {
    (await cookies()).delete(SESSION_COOKIE);
    return { success: true, message: "Logged out." };
  }

  await logoutAction();
  return { success: true, message: "Logged out." };
}

// Super admin accounts are created from an invitation, not self sign-up. The
// API has no invitations yet, so these still use the mock store.
export async function getInvite(
  token: string | null,
): Promise<QueryResult<Invite>> {
  const invite = getStore().invites.find((i) => i.token === token);
  if (!invite || new Date(invite.expiresAt).getTime() < Date.now()) {
    return {
      success: false,
      message: "This invitation link is invalid or has expired.",
    };
  }
  return { success: true, data: invite };
}

export async function acceptInvite(input: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  await wait();
  const invite = await getInvite(input.token);
  if (!invite.success) return { success: false, message: invite.message };

  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  // A real backend would create the account and start a session here.
  if (isAdminMockAuth()) await startMockSession();
  return { success: true, message: invite.data.organisation };
}

const emailSchema = z.string().trim().email("Please enter a valid email address.");

// Emails a password reset link that opens /reset-password.
export async function requestPasswordReset(
  email: string,
): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  if (isAdminMockAuth()) {
    await wait();
    return {
      success: true,
      message: `We've sent a reset link to ${parsed.data}.`,
    };
  }

  const { result } = await apiRequest("/api/v1/auth/forgot-password", "POST", {
    email: parsed.data,
    // The same email can belong to a customer account too.
    accountType: "supplier",
  });
  if (!result.success) {
    return {
      success: false,
      message:
        result.statusCode === 404
          ? "We couldn't find a supplier account with that email address."
          : result.message,
    };
  }
  return {
    success: true,
    message: `We've sent a reset link to ${parsed.data}.`,
  };
}

export async function resetPassword(input: {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }
  if (!input.email || !input.token) {
    return {
      success: false,
      message: "This reset link is incomplete. Please request a new one.",
    };
  }

  if (isAdminMockAuth()) {
    await wait();
    return { success: true, message: "Your password has been set successfully." };
  }

  const { result } = await apiRequest("/api/v1/auth/reset-password", "POST", {
    email: input.email,
    token: input.token,
    new_password: parsed.data.password,
    confirm_password: parsed.data.confirmPassword,
  });
  if (!result.success) return { success: false, message: result.message };
  return { success: true, message: "Your password has been set successfully." };
}
