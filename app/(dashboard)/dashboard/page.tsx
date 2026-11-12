import { connection } from "next/server";
import { Suspense } from "react";
import LoadError from "@/components/admin/ui/LoadError";
import PageLoading from "@/components/admin/ui/PageLoading";
import { Metadata } from "next";
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import {
  getCompany,
  getDashboardMetrics,
  getSetupStatus,
} from "@/lib/server/admin/dashboard";
import { getStations } from "@/lib/server/admin/stations";

export const metadata: Metadata = {
  title: "Dashboard | FuelTap Supplier",
};

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AdminDashboardContent />
    </Suspense>
  );
}

async function AdminDashboardContent() {
  // Account data is per request, so it's read at request time, not build time.
  await connection();
  const [company, setup, metrics, stations] = await Promise.all([
    getCompany(),
    getSetupStatus(),
    getDashboardMetrics(),
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
      stations={stations.data.map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
