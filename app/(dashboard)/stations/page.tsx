import { connection } from "next/server";
import { Suspense } from "react";
import PageLoading from "@/components/admin/ui/PageLoading";
import { Metadata } from "next";
import StationsList from "@/components/admin/stations/StationsList";
import { getManagers } from "@/lib/server/admin/managers";
import { getStations } from "@/lib/server/admin/stations";

export const metadata: Metadata = { title: "Stations | FuelTap Supplier" };

export default function StationsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <StationsContent />
    </Suspense>
  );
}

async function StationsContent() {
  // Mock data lives in memory, so read it per request rather than at build time.
  await connection();
  const [stations, managers] = await Promise.all([getStations(), getManagers()]);

  return (
    <StationsList
      stations={stations.success ? stations.data : []}
      managers={
        managers.success
          ? managers.data
              .filter((m) => m.status !== "inactive")
              .map((m) => ({ id: m.id, name: m.name }))
          : []
      }
    />
  );
}
