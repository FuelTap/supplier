"use server";

import { buildDashboardMetrics, getStore, wait } from "./mock";
import type {
  Company,
  DashboardMetrics,
  QueryResult,
  SetupStatus,
} from "./types";

export async function getCompany(): Promise<QueryResult<Company>> {
  return { success: true, data: getStore().company };
}

export async function getSetupStatus(): Promise<QueryResult<SetupStatus>> {
  const store = getStore();
  return {
    success: true,
    data: {
      kybSubmitted: store.kybSubmitted,
      hasManager: store.managers.length > 0,
      hasStation: store.stations.length > 0,
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
  return { success: true, data: buildDashboardMetrics(getStore()) };
}
