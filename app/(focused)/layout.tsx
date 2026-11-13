import { Suspense } from "react";
import { AuthProvider } from "@/context/AuthProvider";
import { requireAccess } from "@/lib/server/access";
import PageLoading from "@/components/admin/ui/PageLoading";
import SoftGlow from "@/components/admin/ui/SoftGlow";

// Single-task pages (KYB, invite manager, add station). Each page renders its
// own FocusedHeader because the header's actions and progress differ per page.
export default function AdminFocusedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col bg-[#F8F9FB]">
      <SoftGlow className="opacity-40" />
      <Suspense fallback={<PageLoading />}>
        <FocusedContent>{children}</FocusedContent>
      </Suspense>
    </div>
  );
}

async function FocusedContent({ children }: { children: React.ReactNode }) {
  const user = await requireAccess("supplier");
  return <AuthProvider initialUser={user}>{children}</AuthProvider>;
}
