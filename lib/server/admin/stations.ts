"use server";

import { getStore, wait } from "./mock";
import type {
  ActionResult,
  QueryResult,
  Station,
  StationOrder,
  StationView,
} from "./types";

function toView(station: Station): StationView {
  const store = getStore();
  const manager = store.managers.find((m) => m.id === station.managerId);

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
  return { success: true, data: getStore().stations.map(toView) };
}

export async function getStation(
  id: string,
): Promise<QueryResult<StationView>> {
  const station = getStore().stations.find((s) => s.id === id);
  if (!station) return { success: false, message: "Station not found." };
  return { success: true, data: toView(station) };
}

export async function getStationOrders(
  id: string,
): Promise<QueryResult<StationOrder[]>> {
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

export async function createStation(
  input: CreateStationInput,
): Promise<QueryResult<StationView>> {
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
    name: input.name.trim(),
    address: input.address.trim(),
    city: input.city,
    state: input.state,
    latitude: input.latitude,
    longitude: input.longitude,
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

  if (input.managerId) assign(station.id, input.managerId);

  return { success: true, data: toView(station) };
}

// Assigns a manager to a station, freeing whichever station the manager or the
// station was previously linked to.
function assign(stationId: string, managerId: string) {
  const store = getStore();
  const station = store.stations.find((s) => s.id === stationId);
  const manager = store.managers.find((m) => m.id === managerId);
  if (!station || !manager) return;

  const previousManager = store.managers.find(
    (m) => m.id === station.managerId,
  );
  if (previousManager && previousManager.id !== manager.id) {
    previousManager.stationId = null;
  }
  const previousStation = store.stations.find(
    (s) => s.id === manager.stationId,
  );
  if (previousStation && previousStation.id !== station.id) {
    previousStation.managerId = null;
  }

  station.managerId = manager.id;
  manager.stationId = station.id;
  manager.previousStationId = null;
}

export async function assignStationManager(
  stationId: string,
  managerId: string,
): Promise<ActionResult> {
  await wait();
  const store = getStore();
  const station = store.stations.find((s) => s.id === stationId);
  const manager = store.managers.find((m) => m.id === managerId);
  if (!station || !manager) {
    return { success: false, message: "Station or manager not found." };
  }
  assign(stationId, managerId);
  return {
    success: true,
    message: `${manager.name} is now managing ${station.name}.`,
  };
}

export async function deactivateStation(
  stationId: string,
): Promise<ActionResult> {
  await wait();
  const station = getStore().stations.find((s) => s.id === stationId);
  if (!station) return { success: false, message: "Station not found." };

  if (station.outstandingOrders > 0) {
    return {
      success: false,
      blocked: true,
      message:
        "This station has outstanding orders that need attention. Please complete these orders or reassign them to another manager before deactivating the station.",
    };
  }

  station.deactivated = true;
  return {
    success: true,
    message: `${station.name} has been deactivated and is no longer visible to customers.`,
  };
}

export async function reactivateStation(
  stationId: string,
): Promise<ActionResult> {
  await wait();
  const station = getStore().stations.find((s) => s.id === stationId);
  if (!station) return { success: false, message: "Station not found." };

  station.deactivated = false;
  return {
    success: true,
    message: `${station.name} is active again and visible to customers.`,
  };
}
