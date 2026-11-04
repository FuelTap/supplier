import { Suspense } from "react";
import AdminSession from "@/components/admin/AdminSession";
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
        <AdminSession>{children}</AdminSession>
      </Suspense>
    </div>
  );
}
