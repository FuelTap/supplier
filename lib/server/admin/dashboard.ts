"use server";

import { requireAccess } from "@/lib/server/access";
import { getStations } from "./stations";
import { getUserProfile } from "@/lib/server/auth";
import { loadAccount } from "./account";
import { call } from "./api";
import { buildDashboardMetrics, getStore, wait } from "./mock";
import { isAdminMockAuth } from "./session";
import type {
  Company,
  DashboardMetrics,
  DashboardFilters,
  FuelTrendPoint,
  QueryResult,
  SetupStatus,
  StationView,
} from "./types";

export async function getCompany(): Promise<QueryResult<Company>> {
  if (isAdminMockAuth()) return { success: true, data: getStore().company };

  // A supplier account is registered under the company's name.
  const profile = await getUserProfile();
  if (!profile.success || !profile.data) {
    return { success: false, message: profile.message };
  }
  return { success: true, data: { name: profile.data.user.profile.fullName } };
}

export async function getSetupStatus(): Promise<QueryResult<SetupStatus>> {
  const account = await loadAccount();
  if (!account.success) return account;

  const store = getStore();
  return {
    success: true,
    data: {
      // KYB isn't connected to the API yet, so its status comes from the mock.
      kybSubmitted: store.kybSubmitted,
      hasManager: account.data.managers.length > 0,
      hasStation: account.data.stations.length > 0,
      completionShown: store.completionShown,
    },
  };
}

// Called once the "Processing…" hand-off to the full dashboard has played.
export async function markSetupCompletionShown(): Promise<void> {
  await wait();
  getStore().completionShown = true;
}

type SupplierDashboardStation = {
  stationId: string;
  stationName: string;
  sales: number;
  orders: number;
};

type SupplierDashboard = {
  period: { start: string; end: string; month: number; year: number };
  summary: {
    salesThisMonth: number;
    ordersThisMonth: number;
    pendingOrders: number;
    activeStations: number;
    salesChangePercent: number;
    ordersChangePercent: number;
  };
  trends: {
    sales: (FuelTrendPoint | null)[] | null;
    orders: (FuelTrendPoint | null)[] | null;
    currency: string;
  };
  stations?: {
    topPerforming: SupplierDashboardStation[];
    lowestPerforming: SupplierDashboardStation[];
  };
};

export async function getDashboardActualMetrics(
  filters: DashboardFilters = {},
): Promise<QueryResult<DashboardMetrics>> {
  await requireAccess("supplier");

  if (
    (filters.month !== undefined &&
      (!Number.isInteger(filters.month) || filters.month < 1 || filters.month > 12)) ||
    (filters.year !== undefined &&
      (!Number.isInteger(filters.year) || filters.year < 1 || filters.year > 9999)) ||
    (filters.stationId !== undefined &&
      (typeof filters.stationId !== "string" || !filters.stationId.trim()))
  ) {
    return { success: false, message: "Choose a valid month, year and station." };
  }

  let station: StationView | undefined;
  if (filters.stationId) {
    const stations = await getStations();
    if (!stations.success) return stations;
    station = stations.data.find((station) => station.id === filters.stationId);
    if (!station) {
      return { success: false, message: "This station is unavailable." };
    }
  }

  if (isAdminMockAuth()) {
    return { success: true, data: buildDashboardMetrics(getStore(), filters, station) };
  }

  const query = new URLSearchParams();
  if (filters.month !== undefined) query.set("month", String(filters.month));
  if (filters.year !== undefined) query.set("year", String(filters.year));
  if (filters.stationId) query.set("stationId", filters.stationId);
  const suffix = query.size ? `?${query}` : "";
  const result = await call<SupplierDashboard>(`/api/v1/supplier/dashboard${suffix}`);
  if (!result.success) return result;

  const { period, summary, trends, stations } = result.data;
  const sales = {
    value: summary.salesThisMonth,
    trend: summary.salesChangePercent,
  };
  const orders = {
    value: summary.ordersThisMonth,
    trend: summary.ordersChangePercent,
  };

  return {
    success: true,
    data: {
      period: { month: period.month, year: period.year },
      salesThisMonth: sales,
      ordersThisMonth: orders,
      pendingOrders: {
        value: summary.pendingOrders,
      },
      activeStations: {
        value: summary.activeStations,
      },
      revenueTotal: sales,
      revenueTrend: (trends.sales ?? []).filter((point): point is FuelTrendPoint => point !== null),
      ordersTotal: orders,
      ordersTrend: (trends.orders ?? []).filter((point): point is FuelTrendPoint => point !== null),
      topStations: (stations?.topPerforming ?? []).map((station) => ({
        name: station.stationName,
        revenue: station.sales,
      })),
      lowestStations: (stations?.lowestPerforming ?? []).map((station) => ({
        name: station.stationName,
        revenue: station.sales,
      })),
    },
  };
}

export async function getDashboardMetrics(): Promise<
  QueryResult<DashboardMetrics>
> {
  return getDashboardActualMetrics();
}
