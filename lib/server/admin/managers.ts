"use server";

import { managerSchema } from "@/lib/validators/adminSchemas";
import { type Account, loadAccount, localChanges } from "./account";
import { createApiManager } from "./api";
import { getStore, wait } from "./mock";
import { isAdminMockAuth } from "./session";
import type {
  ActionResult,
  Manager,
  ManagerView,
  QueryResult,
  StationView,
} from "./types";

function toView(manager: Manager, account: Account): ManagerView {
  const station = account.stations.find((s) => s.id === manager.stationId);
  if (!station) return { ...manager, station: null };

  let displayStatus: StationView["displayStatus"] = "active";
  if (
    station.deactivated ||
    manager.status !== "active" ||
    station.complianceStatus !== "verified"
  )
    displayStatus = "inactive";

  return {
    ...manager,
    station: {
      id: station.id,
      name: station.name,
      state: station.state,
      displayStatus,
    },
  };
}

export async function getManagers(): Promise<QueryResult<ManagerView[]>> {
  const account = await loadAccount();
  if (!account.success) return account;
  return {
    success: true,
    data: account.data.managers.map((m) => toView(m, account.data)),
  };
}

export type InviteManagerInput = {
  name: string;
  email: string;
  phone: string;
};

// On success, `message` is the invited email address.
export async function inviteManager(
  input: InviteManagerInput,
): Promise<ActionResult> {
  const parsed = managerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }
  const email = parsed.data.email.toLowerCase();

  if (!isAdminMockAuth()) {
    const created = await createApiManager({ ...parsed.data, email });
    return created.success ? { success: true, message: email } : created;
  }

  await wait();
  const store = getStore();

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
    name: parsed.data.name,
    email,
    phone: parsed.data.phone,
    stationId: null,
    previousStationId: null,
    status: "pending",
    lastLoginAt: null,
    outstandingOrders: 0,
    invitedAt: new Date().toISOString(),
  });

  return { success: true, message: email };
}

async function findManager(id: string) {
  if (isAdminMockAuth()) await wait();
  const account = await loadAccount();
  if (!account.success) return account;
  const manager = account.data.managers.find((m) => m.id === id);
  if (!manager) return { success: false as const, message: "Manager not found." };
  return { success: true as const, data: { account: account.data, manager } };
}

// Not supported by the API yet: nothing is re-sent.
export async function resendManagerInvite(id: string): Promise<ActionResult> {
  const found = await findManager(id);
  if (!found.success) return found;
  const { manager } = found.data;
  return {
    success: true,
    message: `A new invitation has been sent to ${manager.email}.`,
  };
}

export async function cancelManagerInvite(id: string): Promise<ActionResult> {
  const found = await findManager(id);
  if (!found.success) return found;
  const { manager } = found.data;

  localChanges.removedManagers.add(manager.id);
  return {
    success: true,
    message: `The invitation to ${manager.name} has been cancelled.`,
  };
}

export async function suspendManager(id: string): Promise<ActionResult> {
  const found = await findManager(id);
  if (!found.success) return found;
  const { manager } = found.data;

  if (manager.outstandingOrders > 0) {
    return {
      success: false,
      blocked: true,
      message: `${manager.name} has pending orders that need attention. Please complete these orders or reassign them to another manager before suspending the account.`,
    };
  }

  localChanges.managerStatus.set(manager.id, {
    status: "inactive",
    previousStationId: manager.stationId,
  });
  return {
    success: true,
    message: `${manager.name} has been suspended and can no longer access their FuelTap account.`,
  };
}

export async function reactivateManager(id: string): Promise<ActionResult> {
  const found = await findManager(id);
  if (!found.success) return found;
  const { account, manager } = found.data;

  localChanges.managerStatus.set(manager.id, {
    status: "active",
    previousStationId: null,
  });

  const previous = account.stations.find(
    (s) => s.id === manager.previousStationId,
  );
  if (previous && !previous.managerId) {
    localChanges.stationManagers.set(previous.id, manager.id);
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
  const found = await findManager(id);
  if (!found.success) return found;
  const { manager } = found.data;

  if (manager.outstandingOrders > 0) {
    return {
      success: false,
      blocked: true,
      message: `${manager.name}'s station has outstanding orders that need attention. Please complete these orders or reassign them to another manager before deleting this manager.`,
    };
  }

  localChanges.removedManagers.add(manager.id);
  return {
    success: true,
    message: `${manager.name} has been deleted and no longer has access to FuelTap.`,
  };
}
