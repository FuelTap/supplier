import { Suspense } from "react";
import Header from "@/components/admin/Header";
import { AuthProvider } from "@/context/AuthProvider";
import { requireAccess } from "@/lib/server/access";
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
        <DashboardContent>{children}</DashboardContent>
      </Suspense>
    </div>
  );
}

async function DashboardContent({ children }: { children: React.ReactNode }) {
  const user = await requireAccess("supplier");
  return (
    <AuthProvider initialUser={user}>
      <Header />
      <main className="container pt-8 pb-16 md:pt-30">{children}</main>
    </AuthProvider>
  );
}
