import type { ChartConfig } from "@/components/ui/chart";
import type { FuelTrendPoint, StatValue } from "@/lib/server/admin/types";

export const fuelChartConfig = {
  petrol: { label: "Petrol", color: "#F5C518" },
  diesel: { label: "Diesel", color: "#4E71E8" },
  cookingGas: { label: "Cooking Gas", color: "#0EA774" },
  other: { label: "Other", color: "#64748B" },
} satisfies ChartConfig;

export const fuelKeys = ["petrol", "diesel", "cookingGas", "other"] as const;
export type FuelFilter = "all" | (typeof fuelKeys)[number];

export function getFuelTrend(
  total: StatValue,
  data: FuelTrendPoint[],
  fuel: FuelFilter,
) {
  if (fuel === "all") {
    return {
      total,
      keys: fuelKeys.filter(
        (key) => key !== "other" || data.some((point) => point.other !== 0),
      ),
    };
  }

  return {
    total: { value: data.reduce((sum, point) => sum + point[fuel], 0) },
    keys: [fuel],
  };
}

