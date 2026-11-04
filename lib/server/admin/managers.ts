"use server";

import { getStore, wait } from "./mock";
import { getStation } from "./stations";
import type {
  ActionResult,
  Manager,
  ManagerView,
  QueryResult,
} from "./types";

async function toView(manager: Manager): Promise<ManagerView> {
  if (!manager.stationId) return { ...manager, station: null };
  const result = await getStation(manager.stationId);
  if (!result.success) return { ...manager, station: null };
  const station = result.data;
  return {
    ...manager,
    station: {
      id: station.id,
      name: station.name,
      state: station.state,
      displayStatus: station.displayStatus,
    },
  };
}

export async function getManagers(): Promise<QueryResult<ManagerView[]>> {
  const views = await Promise.all(getStore().managers.map(toView));
  return { success: true, data: views };
}

export type InviteManagerInput = {
  name: string;
  email: string;
  phone: string;
};

export async function inviteManager(
  input: InviteManagerInput,
): Promise<ActionResult> {
  await wait();
  const store = getStore();
  const email = input.email.trim().toLowerCase();

  if (store.managers.some((m) => m.email.toLowerCase() === email)) {
    return {
      success: false,
      message: "A manager with this email address already exists.",
    };
  }

  const nextNumber =
    store.managers.reduce(
      (max, m) => Math.max(max, Number(m.code.replace("MGR-", ""))),
      1270,
    ) + 1;

  store.managers.unshift({
    id: `mgr-${nextNumber}`,
    code: `MGR-${nextNumber}`,
    name: input.name.trim(),
    email,
    phone: input.phone,
    stationId: null,
    previousStationId: null,
    status: "pending",
    lastLoginAt: null,
    outstandingOrders: 0,
    invitedAt: new Date().toISOString(),
  });

  return { success: true, message: email };
}

function findManager(id: string) {
  return getStore().managers.find((m) => m.id === id);
}

export async function resendManagerInvite(id: string): Promise<ActionResult> {
  await wait();
  const manager = findManager(id);
  if (!manager) return { success: false, message: "Manager not found." };
  manager.invitedAt = new Date().toISOString();
  return {
    success: true,
    message: `A new invitation has been sent to ${manager.email}.`,
  };
}

export async function cancelManagerInvite(id: string): Promise<ActionResult> {
  await wait();
  const store = getStore();
  const manager = findManager(id);
  if (!manager) return { success: false, message: "Manager not found." };

  const station = store.stations.find((s) => s.id === manager.stationId);
  if (station) station.managerId = null;
  store.managers = store.managers.filter((m) => m.id !== id);

  return {
    success: true,
    message: `The invitation to ${manager.name} has been cancelled.`,
  };
}

export async function suspendManager(id: string): Promise<ActionResult> {
  await wait();
  const store = getStore();
  const manager = findManager(id);
  if (!manager) return { success: false, message: "Manager not found." };

  if (manager.outstandingOrders > 0) {
    return {
      success: false,
      blocked: true,
      message: `${manager.name} has pending orders that need attention. Please complete these orders or reassign them to another manager before suspending the account.`,
    };
  }

  const station = store.stations.find((s) => s.id === manager.stationId);
  if (station) station.managerId = null;
  manager.previousStationId = manager.stationId;
  manager.stationId = null;
  manager.status = "inactive";

  return {
    success: true,
    message: `${manager.name} has been suspended and can no longer access their FuelTap account.`,
  };
}

export async function reactivateManager(id: string): Promise<ActionResult> {
  await wait();
  const store = getStore();
  const manager = findManager(id);
  if (!manager) return { success: false, message: "Manager not found." };

  manager.status = "active";
  const previous = store.stations.find(
    (s) => s.id === manager.previousStationId,
  );
  manager.previousStationId = null;

  if (previous && !previous.managerId) {
    previous.managerId = manager.id;
    manager.stationId = previous.id;
    return {
      success: true,
      message: `${manager.name} has been reactivated and can now access their assigned station. They'll be notified of this change.`,
    };
  }

  return {
    success: true,
    message: `${manager.name}'s account has been reactivated, but they haven't been assigned to a station yet. Assign a station to restore their access to station operations.`,
  };
}

export async function deleteManager(id: string): Promise<ActionResult> {
  await wait();
  const store = getStore();
  const manager = findManager(id);
  if (!manager) return { success: false, message: "Manager not found." };

  if (manager.outstandingOrders > 0) {
    return {
      success: false,
      blocked: true,
      message: `${manager.name}'s station has outstanding orders that need attention. Please complete these orders or reassign them to another manager before deleting this manager.`,
    };
  }

  const station = store.stations.find((s) => s.id === manager.stationId);
  if (station) station.managerId = null;
  store.managers = store.managers.filter((m) => m.id !== id);

  return {
    success: true,
    message: `${manager.name} has been deleted and no longer has access to FuelTap.`,
  };
}
