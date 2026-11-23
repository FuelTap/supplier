import { connection } from "next/server";
import { Suspense } from "react";
import LoadError from "@/components/admin/ui/LoadError";
import { Metadata } from "next";
import StationsList from "@/components/admin/stations/StationsList";
import PageHeading from "@/components/admin/ui/PageHeading";
import { StationsListSkeleton } from "@/components/admin/ui/SupplierSkeletons";
import { getManagers } from "@/lib/server/admin/managers";
import { getStations } from "@/lib/server/admin/stations";

export const metadata: Metadata = { title: "Stations | FuelTap Supplier" };

export default function StationsPage() {
  return (
    <>
      <PageHeading
        title="Stations"
        subtitle="Manage and scale your retail outlets. Track managers, view live statuses, and open new branches."
      />
      <Suspense fallback={<StationsListSkeleton />}>
        <StationsContent />
      </Suspense>
    </>
  );
}

async function StationsContent() {
  // Account data is per request, so it's read at request time, not build time.
  // await connection();
  const [stations, managers] = await Promise.all([
    getStations(),
    getManagers(),
  ]);
  if (!stations.success) return <LoadError message={stations.message} />;
  if (!managers.success) return <LoadError message={managers.message} />;

  return (
    <StationsList
      stations={stations.data}
      managers={managers.data
        .filter((m) => m.status !== "inactive")
        .map((m) => ({ id: m.id, name: m.name }))}
    />
  );
}
