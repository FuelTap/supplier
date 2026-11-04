import { connection } from "next/server";
import { Suspense } from "react";
import PageLoading from "@/components/admin/ui/PageLoading";
import { Metadata } from "next";
import AddStationForm from "@/components/admin/stations/AddStationForm";
import { getManagers } from "@/lib/server/admin/managers";

export const metadata: Metadata = { title: "Add Station | FuelTap Supplier" };

export default function NewStationPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewStationContent />
    </Suspense>
  );
}

async function NewStationContent() {
  // Mock data lives in memory, so read it per request rather than at build time.
  await connection();
  const result = await getManagers();
  // Suspended managers can't be assigned to a station.
  const managers = result.success
    ? result.data
        .filter((m) => m.status !== "inactive")
        .map((m) => ({ id: m.id, name: m.name }))
    : [];

  return <AddStationForm managers={managers} />;
}
