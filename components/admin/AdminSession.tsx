import { AuthProvider } from "@/context/AuthProvider";
import { requireAdmin } from "@/lib/server/admin/session";

// Reads the session (a request-time read, so it must render inside a
// <Suspense> boundary) and only renders its children for a signed-in supplier.
export default async function AdminSession({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  return <AuthProvider initialUser={user}>{children}</AuthProvider>;
}
