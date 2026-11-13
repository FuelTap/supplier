import { connection } from "next/server";
import { Suspense } from "react";
import LoadError from "@/components/admin/ui/LoadError";
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
  // Account data is per request, so it's read at request time, not build time.
  await connection();
  const { id } = await params;
  const [station, orders, managers] = await Promise.all([
    getStation(id),
    getStationOrders(id),
    getManagers(),
  ]);

  if (!station.success) {
    return <LoadError message={station.message} backHref="/stations" />;
  }
  if (!station.data) notFound();
  if (!orders.success) {
    return <LoadError message={orders.message} backHref="/stations" />;
  }
  if (!managers.success) {
    return <LoadError message={managers.message} backHref="/stations" />;
  }

  return (
    <StationDetail
      station={station.data}
      orders={orders.data}
      managers={managers.data
        .filter((m) => m.status !== "inactive")
        .map((m) => ({ id: m.id, name: m.name }))}
    />
  );
}
