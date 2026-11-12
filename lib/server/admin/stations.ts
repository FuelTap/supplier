"use server";

import { stationSchema } from "@/lib/validators/adminSchemas";
import { assignLocally, loadAccount, localChanges } from "./account";
import {
  createApiStation,
  fetchStationInventory,
  fetchStationPerformance,
} from "./api";
import { getStore, wait } from "./mock";
import { isAdminMockAuth } from "./session";
import type {
  ActionResult,
  Manager,
  QueryResult,
  Station,
  StationOrder,
  StationView,
} from "./types";

function toView(station: Station, managers: Manager[]): StationView {
  const manager = managers.find((m) => m.id === station.managerId);

  let displayStatus: StationView["displayStatus"];
  if (!manager) displayStatus = "unassigned";
  else if (
    station.deactivated ||
    manager.status !== "active" ||
    station.complianceStatus !== "verified"
  )
    displayStatus = "inactive";
  else displayStatus = "active";

  return {
    ...station,
    manager: manager
      ? {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          phone: manager.phone,
          status: manager.status,
        }
      : null,
    displayStatus,
  };
}

export async function getStations(): Promise<QueryResult<StationView[]>> {
  const account = await loadAccount();
  if (!account.success) return account;
  const { stations, managers } = account.data;
  return { success: true, data: stations.map((s) => toView(s, managers)) };
}

// Resolves to null when the station doesn't exist (or isn't this supplier's).
export async function getStation(
  id: string,
): Promise<QueryResult<StationView | null>> {
  const account = await loadAccount();
  if (!account.success) return account;
  const station = account.data.stations.find((s) => s.id === id);
  if (!station) return { success: true, data: null };

  const view = toView(station, account.data.managers);
  if (isAdminMockAuth()) return { success: true, data: view };

  const accountId = station.accountId ?? station.id;
  const [inventory, performance] = await Promise.all([
    fetchStationInventory(accountId),
    fetchStationPerformance(accountId),
  ]);
  if (!inventory.success) return inventory;
  if (!performance.success) return performance;

  return {
    success: true,
    data: {
      ...view,
      products: inventory.data.map((i) => i.product),
      // The API reports running totals, with no daily figures or trends yet.
      stats: {
        ...view.stats,
        monthSales: performance.data.sales,
        monthOrders: performance.data.orderCount,
      },
    },
  };
}

// The API only lets a station's own account read its orders, so the supplier
// sees orders for mock stations only.
export async function getStationOrders(
  id: string,
): Promise<QueryResult<StationOrder[]>> {
  if (!isAdminMockAuth()) return { success: true, data: [] };
  return { success: true, data: getStore().orders[id] ?? [] };
}

export type CreateStationInput = {
  name: string;
  address: string;
  state: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  managerId: string | null;
};

// Adds the city and state to the street address unless it already names them;
// the API geocodes this one string.
function fullAddress({ address, city, state }: CreateStationInput) {
  const lower = address.toLowerCase();
  const parts = [address.trim()];
  if (city && !lower.includes(city.toLowerCase())) parts.push(city);
  if (state && !lower.includes(state.toLowerCase())) parts.push(state);
  return parts.join(", ");
}

export async function createStation(
  input: CreateStationInput,
): Promise<QueryResult<StationView>> {
  const parsed = stationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }
  const values = parsed.data;

  if (!isAdminMockAuth()) {
    if (!values.managerId) {
      return {
        success: false,
        message: "Choose a manager for this station. Every station needs one.",
      };
    }
    const created = await createApiStation({
      name: values.name,
      address: fullAddress(values),
      managerId: values.managerId,
    });
    if (!created.success) return created;

    const account = await loadAccount();
    const managers = account.success ? account.data.managers : [];
    return { success: true, data: toView(created.data, managers) };
  }

  await wait();
  const store = getStore();

  const nextNumber =
    store.stations.reduce(
      (max, s) => Math.max(max, Number(s.code.replace("STN-", ""))),
      1270,
    ) + 1;

  const station: Station = {
    id: `stn-${nextNumber}`,
    code: `STN-${nextNumber}`,
    name: values.name,
    address: values.address,
    city: values.city,
    state: values.state,
    latitude: values.latitude,
    longitude: values.longitude,
    managerId: null,
    complianceStatus: "pending",
    deactivated: false,
    outstandingOrders: 0,
    closesAt: "6:00 PM",
    products: [
      { name: "Petrol PMS", price: 980, unit: "L" },
      { name: "Diesel AGO", price: 1150, unit: "L" },
      { name: "Cooking Gas", price: 2000, unit: "kg" },
    ],
    stats: {
      todaySales: 0,
      todaySalesTrend: 0,
      todayOrders: 0,
      todayOrdersTrend: 0,
      monthSales: 0,
      monthSalesTrend: 0,
      monthOrders: 0,
      monthOrdersTrend: 0,
    },
    createdAt: new Date().toISOString(),
  };
  store.stations.unshift(station);

  const account = await loadAccount();
  if (!account.success) return account;
  if (values.managerId) {
    assignLocally(account.data, station.id, values.managerId);
  }
  return {
    success: true,
    data: toView(
      { ...station, managerId: values.managerId },
      account.data.managers,
    ),
  };
}

async function findStation(id: string) {
  const account = await loadAccount();
  if (!account.success) return account;
  const station = account.data.stations.find((s) => s.id === id);
  if (!station) return { success: false as const, message: "Station not found." };
  return { success: true as const, data: { account: account.data, station } };
}

export async function assignStationManager(
  stationId: string,
  managerId: string,
): Promise<ActionResult> {
  if (isAdminMockAuth()) await wait();
  const found = await findStation(stationId);
  if (!found.success) return found;
  const { account, station } = found.data;

  const manager = account.managers.find((m) => m.id === managerId);
  if (!manager) return { success: false, message: "Manager not found." };
  if (manager.status === "inactive") {
    return {
      success: false,
      message: `${manager.name} is suspended. Reactivate them before assigning a station.`,
    };
  }

  assignLocally(account, station.id, manager.id);
  return {
    success: true,
    message: `${manager.name} is now managing ${station.name}.`,
  };
}

export async function deactivateStation(
  stationId: string,
): Promise<ActionResult> {
  if (isAdminMockAuth()) await wait();
  const found = await findStation(stationId);
  if (!found.success) return found;
  const { station } = found.data;

  if (station.outstandingOrders > 0) {
    return {
      success: false,
      blocked: true,
      message:
        "This station has outstanding orders that need attention. Please complete these orders or reassign them to another manager before deactivating the station.",
    };
  }

  localChanges.stationDeactivated.set(station.id, true);
  return {
    success: true,
    message: `${station.name} has been deactivated and is no longer visible to customers.`,
  };
}

export async function reactivateStation(
  stationId: string,
): Promise<ActionResult> {
  if (isAdminMockAuth()) await wait();
  const found = await findStation(stationId);
  if (!found.success) return found;
  const { station } = found.data;

  localChanges.stationDeactivated.set(station.id, false);
  return {
    success: true,
    message: `${station.name} is active again and visible to customers.`,
  };
}
