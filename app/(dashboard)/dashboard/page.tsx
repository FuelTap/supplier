import { connection } from "next/server";
import { Suspense } from "react";
import LoadError from "@/components/admin/ui/LoadError";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import { DashboardSkeleton } from "@/components/admin/ui/SupplierSkeletons";
import { dashboardPeriodHref } from "@/lib/helpers/dashboard-period";
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
    <Suspense fallback={<DashboardSkeleton />}>
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
  const { month, year, stationId } = await searchParams;
  if (Array.isArray(month) || Array.isArray(year) || Array.isArray(stationId)) {
    return <LoadError message="Choose one month, year and station." />;
  }
  // Keep existing station-filtered dashboard links working.
  if (stationId && stationId !== "all") {
    redirect(dashboardPeriodHref(`/stations/${encodeURIComponent(stationId)}`, { month, year }));
  }
  const [company, setup, stations] = await Promise.all([
    getCompany(),
    getSetupStatus(),
    getStations(),
  ]);

  // Without these the dashboard would show a misleading setup checklist.
  if (!setup.success) return <LoadError message={setup.message} />;
  if (!stations.success) return <LoadError message={stations.message} />;

  return (
    <AdminDashboard
      companyName={company.success ? company.data.name : "Your company"}
      setup={setup.data}
      metrics={getDashboardActualMetrics({
        month: month === undefined ? undefined : Number(month),
        year: year === undefined ? undefined : Number(year),
      })}
      stations={stations.data.filter((s) => !s.deactivated).map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
