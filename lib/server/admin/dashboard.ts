"use server";

import { getUserProfile } from "@/lib/server/auth";
import { loadAccount } from "./account";
import { fetchPerformance } from "./api";
import { buildDashboardMetrics, getStore, wait } from "./mock";
import { isAdminMockAuth } from "./session";
import { getStations } from "./stations";
import type {
  Company,
  DashboardMetrics,
  QueryResult,
  SetupStatus,
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

export async function getDashboardMetrics(): Promise<
  QueryResult<DashboardMetrics>
> {
  if (isAdminMockAuth()) {
    return { success: true, data: buildDashboardMetrics(getStore()) };
  }

  const [performance, stations] = await Promise.all([
    fetchPerformance(),
    getStations(),
  ]);
  if (!performance.success) return performance;
  if (!stations.success) return stations;

  const { totals } = performance.data;
  const ranked = performance.data.stations
    .map((p) => ({
      name:
        stations.data.find((s) => (s.accountId ?? s.id) === p.accountId)
          ?.name ?? p.name,
      revenue: p.sales,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // The API has no pending-order count, period comparisons or monthly series
  // yet, so those still come from the mock data.
  const mock = buildDashboardMetrics(getStore());

  return {
    success: true,
    data: {
      salesThisMonth: { value: totals.sales, trend: mock.salesThisMonth.trend },
      ordersThisMonth: {
        value: totals.orderCount,
        trend: mock.ordersThisMonth.trend,
      },
      pendingOrders: mock.pendingOrders,
      activeStations: {
        value: stations.data.filter((s) => s.displayStatus === "active").length,
        trend: mock.activeStations.trend,
      },
      revenueTotal: { value: totals.sales, trend: mock.revenueTotal.trend },
      revenueTrend: mock.revenueTrend,
      ordersTotal: { value: totals.orderCount, trend: mock.ordersTotal.trend },
      ordersTrend: mock.ordersTrend,
      topStations: ranked.slice(0, 5),
      lowestStations: ranked.slice(-5).reverse(),
    },
  };
}
