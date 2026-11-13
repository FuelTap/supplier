import "server-only";

import type { User } from "@/context/AuthProvider";
import { isAdminMockAuth, requireSession } from "@/lib/server/admin/session";
import { redirect } from "next/navigation";

type Access =
  | { role: "supplier"; redirectTo: "/dashboard" }
  | { role: "manager"; redirectTo: "/sub" };

export type AccessRole = Access["role"];

function configuredRoles(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);
}

// Resolve access from the verified backend profile, never the login selector.
export function checkAccess(user: User): Access | null {
  const roles: unknown[] = [user.account?.role ?? []].flat();
  const supplierRoles = configuredRoles(process.env.SUPPLIER_ACCESS_ROLES);
  const managerRoles = configuredRoles(process.env.MANAGER_ACCESS_ROLES);
  const supplier = roles.some(
    (role) => typeof role === "string" && supplierRoles.includes(role),
  );
  const manager = roles.some(
    (role) => typeof role === "string" && managerRoles.includes(role),
  );

  // Unknown and ambiguous accounts must not gain access through role ordering.
  if (supplier === manager) return null;
  return supplier
    ? { role: "supplier", redirectTo: "/dashboard" }
    : { role: "manager", redirectTo: "/sub" };
}

// Enforce the area's role separately from loading the authenticated session.
export async function requireAccess(requiredRole: AccessRole): Promise<User> {
  const user = await requireSession();
  const access: Access | null = isAdminMockAuth()
    ? { role: "supplier", redirectTo: "/dashboard" }
    : checkAccess(user);

  if (!access) redirect("/login");
  if (access.role !== requiredRole) redirect(access.redirectTo);
  return user;
}
