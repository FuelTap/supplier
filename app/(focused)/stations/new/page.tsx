import { connection } from "next/server";
import { Suspense } from "react";
import LoadError from "@/components/admin/ui/LoadError";
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
  // Account data is per request, so it's read at request time, not build time.
  await connection();
  const result = await getManagers();
  if (!result.success) {
    return <LoadError message={result.message} backHref="/stations" />;
  }
  // A new station needs a manager who is neither suspended nor already running
  // another station.
  const managers = result.data
    .filter((m) => m.status !== "inactive" && !m.station)
    .map((m) => ({ id: m.id, name: m.name }));

  return <AddStationForm managers={managers} />;
}
