import type { ChartConfig } from "@/components/ui/chart";

export const fuelChartConfig = {
  petrol: { label: "Petrol", color: "#F5C518" },
  diesel: { label: "Diesel", color: "#4E71E8" },
  cookingGas: { label: "Cooking Gas", color: "#0EA774" },
  other: { label: "Other", color: "#64748B" },
} satisfies ChartConfig;

export const fuelKeys = ["petrol", "diesel", "cookingGas", "other"] as const;

