"use server";

import { cookies } from "next/headers";
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

  // Customers share the same backend login; keep them out of the supplier app.
  const profile = await getUserProfile();
  const user = profile.success ? profile.data?.user : undefined;
  if (!user || !hasAdminRole(user)) {
    if (user) await logoutAction(user.id);
    return {
      success: false,
      message: "This account doesn't have supplier access.",
    };
  }
  return { success: true, message: result.message };
}

export async function adminLogout(userId: string): Promise<ActionResult> {
  if (isAdminMockAuth()) {
    (await cookies()).delete(SESSION_COOKIE);
    return { success: true, message: "Logged out." };
  }

  const result = await logoutAction(userId);
  return result?.success
    ? { success: true, message: "Logged out." }
    : { success: false, message: "Could not log out." };
}

// Super admin accounts are created from an invitation, not self sign-up.
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

export async function requestPasswordResetOtp(
  email: string,
): Promise<ActionResult> {
  await wait();
  return {
    success: true,
    message: `We've sent a one-time code to ${email}.`,
  };
}

export async function verifyPasswordResetOtp(input: {
  email: string;
  otp: string;
}): Promise<ActionResult> {
  await wait();
  if (!/^\d{6}$/.test(input.otp) || input.otp === "000000") {
    return { success: false, message: "That code is incorrect or has expired." };
  }
  return { success: true, message: "Code verified." };
}

export async function resetPasswordWithOtp(input: {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  await wait();
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }
  return { success: true, message: "Your password has been set successfully." };
}
