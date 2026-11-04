import StatCard from "@/components/admin/ui/StatCard";
import { formatCount, formatNaira } from "@/components/admin/ui/format";
import type { DashboardMetrics } from "@/lib/server/admin/types";

export default function AdminStatsRow({
  metrics,
}: {
  metrics: DashboardMetrics;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
      <StatCard
        label="Sales this month"
        value={formatNaira(metrics.salesThisMonth.value)}
        trend={metrics.salesThisMonth.trend}
      />
      <StatCard
        label="Orders this month"
        value={formatCount(metrics.ordersThisMonth.value)}
        trend={metrics.ordersThisMonth.trend}
      />
      <StatCard
        label="Pending Orders"
        value={formatCount(metrics.pendingOrders.value)}
        trend={metrics.pendingOrders.trend}
      />
      <StatCard
        label="Active Stations"
        value={formatCount(metrics.activeStations.value)}
        trend={metrics.activeStations.trend}
      />
    </div>
  );
}
