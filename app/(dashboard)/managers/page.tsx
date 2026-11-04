import { connection } from "next/server";
import { Suspense } from "react";
import PageLoading from "@/components/admin/ui/PageLoading";
import { Metadata } from "next";
import ManagersList from "@/components/admin/managers/ManagersList";
import { getManagers } from "@/lib/server/admin/managers";

export const metadata: Metadata = { title: "Managers | FuelTap Supplier" };

export default function ManagersPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ManagersContent />
    </Suspense>
  );
}

async function ManagersContent() {
  // Mock data lives in memory, so read it per request rather than at build time.
  await connection();
  const result = await getManagers();
  return (
    <ManagersList
      managers={result.success ? result.data : []}
      // Request time (after connection()), used for "2 hours ago".
      // eslint-disable-next-line react-hooks/purity
      now={Date.now()}
    />
  );
}
