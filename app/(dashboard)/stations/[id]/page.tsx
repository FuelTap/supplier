import { connection } from "next/server";
import { Suspense } from "react";
import PageLoading from "@/components/admin/ui/PageLoading";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import StationDetail from "@/components/admin/stations/StationDetail";
import { getManagers } from "@/lib/server/admin/managers";
import { getStation, getStationOrders } from "@/lib/server/admin/stations";

export const metadata: Metadata = { title: "Station | FuelTap Supplier" };

export default function StationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<PageLoading />}>
      <StationDetailContent params={params} />
    </Suspense>
  );
}

async function StationDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Mock data lives in memory, so read it per request rather than at build time.
  await connection();
  const { id } = await params;
  const [station, orders, managers] = await Promise.all([
    getStation(id),
    getStationOrders(id),
    getManagers(),
  ]);

  if (!station.success) notFound();

  return (
    <StationDetail
      station={station.data}
      orders={orders.success ? orders.data : []}
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
