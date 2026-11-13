import { connection } from "next/server";
import { Suspense } from "react";
import LoadError from "@/components/admin/ui/LoadError";
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
  // Account data is per request, so it's read at request time, not build time.
  await connection();
  const result = await getManagers();
  if (!result.success) return <LoadError message={result.message} />;
  return (
    <ManagersList
      managers={result.data}
      // Request time (after connection()), used for "2 hours ago".
      // eslint-disable-next-line react-hooks/purity
      now={Date.now()}
    />
  );
}
