import "server-only";

import { nigerianStateNames, nigerianStates } from "@/lib/data/nigeria";
import { authenticatedApiRequest } from "@/lib/helpers/fetch/authenticatedApiRequest";
import type {
  InventoryItem,
  Manager,
  QueryResult,
  Station,
  StationProduct,
} from "./types";

// Calls to the FuelTap API (see /api/docs) and the mapping from its records to
// the shapes the admin pages use. Only used when mock auth is off.

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function call<T>(
  endpoint: string,
  method: Method = "GET",
  body?: unknown,
): Promise<QueryResult<T>> {
  const result = await authenticatedApiRequest<unknown, T>(endpoint, method, body);
  if (!result.success) return { success: false, message: result.message };
  return { success: true, data: result.data as T };
}

// List endpoints return the array as `data`, but some wrap it in an object.
function listFrom<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[];
  const nested = (data as Record<string, unknown> | undefined)?.[key];
  return Array.isArray(nested) ? (nested as T[]) : [];
}

// Populated references arrive as objects, unpopulated ones as id strings.
function refId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const { _id, id } = value as { _id?: unknown; id?: unknown };
    if (typeof _id === "string") return _id;
    if (typeof id === "string") return id;
  }
  return null;
}

const shortCode = (prefix: string, id: string) =>
  `${prefix}-${id.slice(-4).toUpperCase()}`;

// --- Addresses ---------------------------------------------------------------

function matchState(part: string) {
  const name = part.replace(/\bstate\b/i, "").trim().toLowerCase();
  if (name === "abuja" || name === "federal capital territory") return "FCT";
  return nigerianStateNames.find((s) => s.toLowerCase() === name);
}

// The API stores one address string ("12 Admiralty Way, Lekki, Lagos"); the
// pages show street, city and state separately.
export function splitAddress(address: string) {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  const stateIndex = parts.findLastIndex((p) => matchState(p));
  if (stateIndex < 0) return { street: address, city: "", state: "" };

  const state = matchState(parts[stateIndex])!;
  const before = parts.slice(0, stateIndex);
  const cityIndex = before.findLastIndex((p) =>
    nigerianStates[state].some((c) => c.toLowerCase() === p.toLowerCase()),
  );
  const city =
    cityIndex >= 0 ? before[cityIndex] : before.length > 1 ? before.at(-1)! : "";
  // Empty when the address is only a city and state, e.g. "Ikeja, Lagos".
  const street = before.filter((p) => p !== city).join(", ");
  return { street, city, state };
}

// --- Stations ----------------------------------------------------------------

type ApiStation = {
  _id: string;
  userId?: string;
  branchName?: string;
  stationName?: string;
  stationAddress?: string;
  managerId?: unknown;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
};

const emptyStats: Station["stats"] = {
  todaySales: 0,
  todaySalesTrend: 0,
  todayOrders: 0,
  todayOrdersTrend: 0,
  monthSales: 0,
  monthSalesTrend: 0,
  monthOrders: 0,
  monthOrdersTrend: 0,
};

function toStation(raw: ApiStation): Station {
  const { street, city, state } = splitAddress(raw.stationAddress ?? "");
  return {
    id: raw._id,
    accountId: raw.userId ?? raw._id,
    code: shortCode("STN", raw._id),
    name: raw.branchName || raw.stationName || "Unnamed station",
    address: street,
    city,
    state,
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
    managerId: refId(raw.managerId),
    // The API only lists active stations and has no compliance status yet.
    complianceStatus: "verified",
    deactivated: false,
    // No API reports open orders per station yet.
    outstandingOrders: 0,
    closesAt: null,
    products: [],
    stats: emptyStats,
    createdAt: raw.createdAt ?? new Date(0).toISOString(),
  };
}

export async function fetchStations(): Promise<QueryResult<Station[]>> {
  const result = await call<unknown>("/api/v1/supplier/stations");
  if (!result.success) return result;
  return {
    success: true,
    data: listFrom<ApiStation>(result.data, "stations").map(toStation),
  };
}

export async function createApiStation(input: {
  name: string;
  address: string;
  managerId: string;
}): Promise<QueryResult<Station>> {
  const result = await call<ApiStation>("/api/v1/supplier/stations", "POST", {
    branchName: input.name,
    stationName: input.name,
    stationAddress: input.address,
    managerId: input.managerId,
  });
  if (!result.success) return result;
  if (!result.data?._id) {
    return {
      success: false,
      message:
        "The station was created, but we couldn't read it back. Refresh the stations list to see it.",
    };
  }
  return { success: true, data: toStation(result.data) };
}

type Performance = { orderCount: number; sales: number };

function toPerformance(raw: unknown): Performance {
  const value = (raw ?? {}) as { orderCount?: unknown; sales?: unknown };
  return {
    orderCount: Number(value.orderCount) || 0,
    sales: Number(value.sales) || 0,
  };
}

// Takes the station's account id (Station.accountId), not its id.
export async function fetchStationPerformance(
  accountId: string,
): Promise<QueryResult<Performance>> {
  const result = await call<unknown>(
    `/api/v1/supplier/stations/${encodeURIComponent(accountId)}/performance`,
  );
  if (!result.success) return result;
  const data = result.data as { totals?: unknown } | undefined;
  return { success: true, data: toPerformance(data?.totals ?? data) };
}

export type SupplierPerformance = {
  totals: Performance;
  stations: (Performance & { accountId: string; name: string })[];
};

export async function fetchPerformance(): Promise<
  QueryResult<SupplierPerformance>
> {
  const result = await call<{ stations?: unknown[]; totals?: unknown }>(
    "/api/v1/supplier/performance",
  );
  if (!result.success) return result;
  return {
    success: true,
    data: {
      totals: toPerformance(result.data?.totals),
      stations: (result.data?.stations ?? []).map((raw) => {
        const s = raw as { stationId?: string; stationName?: string };
        return {
          ...toPerformance(raw),
          accountId: s.stationId ?? "",
          name: s.stationName ?? "Unnamed station",
        };
      }),
    },
  };
}

// --- Managers ----------------------------------------------------------------

type ApiManager = {
  _id?: string;
  id?: string;
  full_name?: string;
  fullName?: string;
  email?: string;
  phone_number?: string;
  phoneNumber?: string;
  status?: string;
  lastLogin?: string;
  lastLoginAt?: string;
  createdAt?: string;
};

function toManager(raw: ApiManager): Manager | null {
  const id = raw._id ?? raw.id;
  if (!id) return null;
  return {
    id,
    code: shortCode("MGR", id),
    name: raw.full_name ?? raw.fullName ?? raw.email ?? "Unnamed manager",
    email: raw.email ?? "",
    phone: raw.phone_number ?? raw.phoneNumber ?? "",
    // Set from the stations list, which records each station's manager.
    stationId: null,
    previousStationId: null,
    // New managers stay "inactive" in the API until they're given a station,
    // which the pages show as a pending invite.
    status: raw.status === "active" ? "active" : "pending",
    lastLoginAt: raw.lastLoginAt ?? raw.lastLogin ?? null,
    outstandingOrders: 0,
    invitedAt: raw.createdAt ?? new Date(0).toISOString(),
  };
}

export async function fetchManagers(): Promise<QueryResult<Manager[]>> {
  const result = await call<unknown>("/api/v1/supplier/managers");
  if (!result.success) return result;
  return {
    success: true,
    data: listFrom<ApiManager>(result.data, "managers")
      .map(toManager)
      .filter((m): m is Manager => m !== null),
  };
}

// The API only takes local numbers, e.g. 08012345678.
function localPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("234") ? `0${digits.slice(3)}` : digits;
}

export async function createApiManager(input: {
  name: string;
  email: string;
  phone: string;
}): Promise<QueryResult<null>> {
  const result = await call<unknown>("/api/v1/supplier/managers", "POST", {
    full_name: input.name,
    email: input.email,
    phone_number: localPhone(input.phone),
  });
  return result.success ? { success: true, data: null } : result;
}

// --- Inventory ---------------------------------------------------------------

const products: Record<
  string,
  { fuelType: InventoryItem["fuelType"]; label: string; unit: StationProduct["unit"] }
> = {
  pms: { fuelType: "Petrol", label: "Petrol PMS", unit: "L" },
  petrol: { fuelType: "Petrol", label: "Petrol PMS", unit: "L" },
  diesel: { fuelType: "Diesel", label: "Diesel AGO", unit: "L" },
  ago: { fuelType: "Diesel", label: "Diesel AGO", unit: "L" },
  "cooking gas": { fuelType: "Cooking Gas", label: "Cooking Gas", unit: "kg" },
  lpg: { fuelType: "Cooking Gas", label: "Cooking Gas", unit: "kg" },
};

type ApiInventory = {
  _id: string;
  product?: unknown;
  price?: number;
  lastUpdated?: string;
  updatedAt?: string;
};

export type StationInventory = {
  id: string;
  fuelType: InventoryItem["fuelType"];
  product: StationProduct;
  lastUpdated: string;
};

function toInventory(raw: ApiInventory): StationInventory | null {
  const name =
    typeof raw.product === "string"
      ? raw.product
      : (raw.product as { name?: unknown } | undefined)?.name;
  const product =
    typeof name === "string" ? products[name.trim().toLowerCase()] : undefined;
  if (!product) {
    console.warn(`Skipping inventory ${raw._id}: unknown product`, raw.product);
    return null;
  }
  return {
    id: raw._id,
    fuelType: product.fuelType,
    product: {
      name: product.label,
      price: Number(raw.price) || 0,
      unit: product.unit,
    },
    lastUpdated: raw.lastUpdated ?? raw.updatedAt ?? new Date(0).toISOString(),
  };
}

// Takes the station's account id (Station.accountId), which owns its products.
export async function fetchStationInventory(
  accountId: string,
): Promise<QueryResult<StationInventory[]>> {
  const result = await call<unknown>(
    `/api/v1/supplier/inventory?supplierId=${encodeURIComponent(accountId)}`,
  );
  if (!result.success) return result;
  return {
    success: true,
    data: listFrom<ApiInventory>(result.data, "inventory")
      .map(toInventory)
      .filter((i): i is StationInventory => i !== null),
  };
}
