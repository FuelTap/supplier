import "server-only";

import { cache } from "react";
import { fetchManagers, fetchStations } from "./api";
import { getStore } from "./mock";
import { isAdminMockAuth } from "./session";
import type { Manager, ManagerStatus, QueryResult, Station } from "./types";

// The API can list and create stations and managers, but can't yet suspend,
// reactivate or delete a manager, reassign a station's manager, or deactivate
// a station. Until it can, those changes are kept here, in this server
// process's memory, and laid over whatever the API (or the mock store)
// returns. They're lost when the server restarts.
type LocalChanges = {
  managerStatus: Map<
    string,
    { status: ManagerStatus; previousStationId: string | null }
  >;
  removedManagers: Set<string>;
  // Station id -> manager id (null for unassigned).
  stationManagers: Map<string, string | null>;
  stationDeactivated: Map<string, boolean>;
};

const globalForLocal = globalThis as typeof globalThis & {
  __fueltapAdminLocal?: LocalChanges;
};

export const localChanges = (globalForLocal.__fueltapAdminLocal ??= {
  managerStatus: new Map(),
  removedManagers: new Set(),
  stationManagers: new Map(),
  stationDeactivated: new Map(),
});

export type Account = { stations: Station[]; managers: Manager[] };

function applyLocalChanges(base: Account): Account {
  const managers = base.managers
    .filter((m) => !localChanges.removedManagers.has(m.id))
    .map((m) => ({ ...m, ...localChanges.managerStatus.get(m.id) }));
  const byId = new Map(managers.map((m) => [m.id, m]));

  const stations = base.stations.map((station) => {
    const assigned = localChanges.stationManagers.has(station.id)
      ? localChanges.stationManagers.get(station.id)!
      : station.managerId;
    // Suspended and deleted managers no longer hold their station.
    const manager = assigned ? byId.get(assigned) : undefined;
    return {
      ...station,
      managerId: manager && manager.status !== "inactive" ? manager.id : null,
      deactivated:
        localChanges.stationDeactivated.get(station.id) ?? station.deactivated,
    };
  });

  for (const manager of managers) {
    manager.stationId =
      stations.find((s) => s.managerId === manager.id)?.id ?? null;
  }
  return { stations, managers };
}

// Stations and managers for the signed-in supplier. Cached per request, since
// most pages need both lists more than once.
export const loadAccount = cache(async (): Promise<QueryResult<Account>> => {
  if (isAdminMockAuth()) {
    const store = getStore();
    return {
      success: true,
      data: applyLocalChanges({
        stations: store.stations,
        managers: store.managers,
      }),
    };
  }

  const [stations, managers] = await Promise.all([
    fetchStations(),
    fetchManagers(),
  ]);
  if (!stations.success) return stations;
  if (!managers.success) return managers;
  return {
    success: true,
    data: applyLocalChanges({
      stations: stations.data,
      managers: managers.data,
    }),
  };
});

// Gives a station to a manager, freeing the manager's previous station.
export function assignLocally(account: Account, stationId: string, managerId: string) {
  const previous = account.stations.find(
    (s) => s.managerId === managerId && s.id !== stationId,
  );
  if (previous) localChanges.stationManagers.set(previous.id, null);
  localChanges.stationManagers.set(stationId, managerId);
}
