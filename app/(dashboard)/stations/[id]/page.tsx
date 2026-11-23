import { connection } from "next/server";
import { Suspense } from "react";
import LoadError from "@/components/admin/ui/LoadError";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import StationDetail from "@/components/admin/stations/StationDetail";
import { StationDetailSkeleton } from "@/components/admin/ui/SupplierSkeletons";
import { lagosCalendarDate } from "@/lib/helpers/dashboard-period";
import { getDashboardActualMetrics } from "@/lib/server/admin/dashboard";
import { getManagers } from "@/lib/server/admin/managers";
import { isAdminMockAuth } from "@/lib/server/admin/session";
import { getStation, getStationOrders } from "@/lib/server/admin/stations";
import type {
  DashboardFilters,
  FuelTrendPoint,
  QueryResult,
  StatValue,
  StationDashboardMetrics,
  StationStats,
} from "@/lib/server/admin/types";

export const metadata: Metadata = { title: "Station | FuelTap Supplier" };

type StationPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string | string[]; year?: string | string[] }>;
};

export default function StationDetailPage(props: StationPageProps) {
  return (
    <Suspense fallback={<StationDetailSkeleton />}>
      <StationDetailContent {...props} />
    </Suspense>
  );
}

function dailyStat(points: FuelTrendPoint[] | undefined, day: number): StatValue | null {
  const totalForDay = (date: number) => {
    const point = points?.find((point) => point.day === date);
    if (point) return point.petrol + point.diesel + point.cookingGas + point.other;
  };
  const value = totalForDay(day);
  if (value === undefined) return null;

  const yesterday = day > 1 ? totalForDay(day - 1) : undefined;
  let trend: number | undefined;
  if (yesterday) trend = ((value - yesterday) / Math.abs(yesterday)) * 100;
  else if (yesterday === 0 && value === 0) trend = 0;
  return { value, trend };
}

async function StationDetailContent({
  params,
  searchParams,
}: StationPageProps) {
  // Account data is per request, so it's read at request time, not build time.
  await connection();
  const [{ id }, { month, year }] = await Promise.all([params, searchParams]);
  if (Array.isArray(month) || Array.isArray(year)) {
    return <LoadError message="Choose one month and year." backHref="/stations" />;
  }

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
      metrics={getStationMetrics({
        stationId: id,
        month: month === undefined ? undefined : Number(month),
        year: year === undefined ? undefined : Number(year),
      }, station.data.stats)}
      managers={managers.data
        .filter((m) => m.status !== "inactive")
        .map((m) => ({ id: m.id, name: m.name }))}
    />
  );
}

async function getStationMetrics(
  filters: DashboardFilters,
  stats: StationStats,
): Promise<QueryResult<StationDashboardMetrics>> {
  const result = await getDashboardActualMetrics(filters);
  if (!result.success) return result;

  const dashboard = result.data;
  const { day, month, year } = lagosCalendarDate();
  const currentMetrics =
    dashboard.period.month === month && dashboard.period.year === year
      ? dashboard
      : null;
  const mock = isAdminMockAuth();

  return {
    success: true,
    data: {
      ...dashboard,
      todaySales: mock
        ? { value: stats.todaySales, trend: stats.todaySalesTrend }
        : dailyStat(currentMetrics?.revenueTrend, day),
      todayOrders: mock
        ? { value: stats.todayOrders, trend: stats.todayOrdersTrend }
        : dailyStat(currentMetrics?.ordersTrend, day),
    },
  };
}
