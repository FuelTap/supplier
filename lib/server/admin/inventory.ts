"use server";

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
