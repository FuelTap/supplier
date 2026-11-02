import { Suspense } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSession from "@/components/admin/AdminSession";
import PageLoading from "@/components/admin/ui/PageLoading";
import SoftGlow from "@/components/admin/ui/SoftGlow";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-dvh bg-[#F8F9FB]">
      <SoftGlow className="opacity-40" />
      <Suspense fallback={<PageLoading />}>
        <AdminSession>
          <AdminHeader />
          <main className="container pt-8 pb-16 md:pt-30">{children}</main>
        </AdminSession>
      </Suspense>
    </div>
  );
}
