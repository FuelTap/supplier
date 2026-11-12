"use server";

import { fetchStationInventory } from "./api";
import { isAdminMockAuth } from "./session";
import { getStations } from "./stations";
import type { InventoryItem, QueryResult } from "./types";

const fuelTypeByProduct: Record<string, InventoryItem["fuelType"]> = {
  "Petrol PMS": "Petrol",
  "Diesel AGO": "Diesel",
  "Cooking Gas": "Cooking Gas",
};

// Inventory is one row per station product. A product is only sellable while
// its station is active.
export async function getInventory(): Promise<QueryResult<InventoryItem[]>> {
  const stations = await getStations();
  if (!stations.success) return stations;

  if (isAdminMockAuth()) {
    const items = stations.data.flatMap((station) =>
      station.products.map((product) => ({
        id: `${station.id}-${product.name}`,
        stationId: station.id,
        branchName: station.name.replace(/^TotalEnergies - /, ""),
        managerName: station.manager?.name ?? null,
        state: station.state,
        fuelType: fuelTypeByProduct[product.name] ?? "Petrol",
        pricePerUnit: product.price,
        enabled: station.displayStatus === "active",
        lastUpdated: station.createdAt,
      })),
    );
    return { success: true, data: items };
  }

  // Products belong to each station's account, so they're fetched per station.
  const results = await Promise.all(
    stations.data.map((station) =>
      fetchStationInventory(station.accountId ?? station.id),
    ),
  );
  const failed = results.find((r) => !r.success);
  if (failed && !failed.success) return failed;

  const items = stations.data.flatMap((station, i) => {
    const result = results[i];
    if (!result.success) return [];
    return result.data.map((item) => ({
      id: item.id,
      stationId: station.id,
      branchName: station.name,
      managerName: station.manager?.name ?? null,
      state: station.state,
      fuelType: item.fuelType,
      pricePerUnit: item.product.price,
      enabled: station.displayStatus === "active",
      lastUpdated: item.lastUpdated,
    }));
  });
  return { success: true, data: items };
}
