import { connection } from "next/server";
import { Suspense } from "react";
import LoadError from "@/components/admin/ui/LoadError";
import PageLoading from "@/components/admin/ui/PageLoading";
import { Metadata } from "next";
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import {
  getCompany,
  getDashboardActualMetrics,
  getSetupStatus,
} from "@/lib/server/admin/dashboard";
import { getStations } from "@/lib/server/admin/stations";

export const metadata: Metadata = {
  title: "Dashboard | FuelTap Supplier",
};

type DashboardSearchParams = {
  month?: string | string[];
  year?: string | string[];
  stationId?: string | string[];
};

export default function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  return (
    <Suspense fallback={<PageLoading />}>
      <AdminDashboardContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminDashboardContent({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  // Account data is per request, so it's read at request time, not build time.
  await connection();
  const params = await searchParams;
  if ([params.month, params.year, params.stationId].some(Array.isArray)) {
    return <LoadError message="Choose one month, year and station." />;
  }
  const [company, setup, metrics, stations] = await Promise.all([
    getCompany(),
    getSetupStatus(),
    getDashboardActualMetrics({
      month: params.month === undefined ? undefined : Number(params.month),
      year: params.year === undefined ? undefined : Number(params.year),
      stationId: params.stationId as string | undefined,
    }),
    getStations(),
  ]);

  // Without these the dashboard would show a misleading setup checklist.
  if (!setup.success) return <LoadError message={setup.message} />;
  if (!stations.success) return <LoadError message={stations.message} />;

  return (
    <AdminDashboard
      companyName={company.success ? company.data.name : "Your company"}
      setup={setup.data}
      metrics={metrics.success ? metrics.data : null}
      metricsError={metrics.success ? null : metrics.message}
      stations={stations.data.filter((s) => !s.deactivated).map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
