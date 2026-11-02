import "server-only";

import type { User } from "@/context/AuthProvider";
import { getUserProfile } from "@/lib/server/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_ROLES = ["super-admin", "supplier"];

export function hasAdminRole(user: User) {
  return (user.account?.role ?? []).some((role) => ADMIN_ROLES.includes(role));
}

export const SESSION_COOKIE = "x-access-token";
export const MOCK_SESSION_TOKEN = "mock-super-admin";

// Local development without a backend: set ADMIN_MOCK_AUTH=true in .env.local
// and run `pnpm dev`. Admin login then accepts any email and password and signs
// in as the demo super admin below. Never active in production builds.
export function isAdminMockAuth() {
  return (
    process.env.ADMIN_MOCK_AUTH === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

const MOCK_ADMIN_USER: User = {
  id: "mock-super-admin",
  profile: {
    fullName: "Ada Dennis",
    email: "ada.dennis@totalenergies.com",
    phoneNumber: "08012345678",
  },
  account: { role: ["super-admin"] },
  documents: { bvn: null, nin: null },
  kyc: {
    overallKycStatus: "verified",
    verification: {
      idverification: "approved",
      addressVerification: "approved",
      livenessVerisfication: "approved",
    },
  },
  wallet: { walletExists: false },
  bank: { bankExists: false },
};

// Signs the browser in as the demo super admin (mock auth only).
export async function startMockSession() {
  (await cookies()).set(SESSION_COOKIE, MOCK_SESSION_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

// Returns the signed-in super admin, or redirects to /login when there's no
// session or the account isn't a supplier.
export async function requireAdmin(): Promise<User> {
  if (isAdminMockAuth()) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token !== MOCK_SESSION_TOKEN) redirect("/login");
    return MOCK_ADMIN_USER;
  }

  const result = await getUserProfile();
  const user = result.success ? result.data?.user : undefined;

  if (!user) redirect("/login");

  if (!hasAdminRole(user)) redirect("/login");

  return user;
}
