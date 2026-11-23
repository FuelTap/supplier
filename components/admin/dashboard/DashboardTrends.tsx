"use client";

import { useState } from "react";
import FilterPill from "@/components/admin/ui/FilterPill";
import type { DashboardMetrics, FuelTrendPoint } from "@/lib/server/admin/types";
import OrdersTrendChart from "./OrdersTrendChart";
import SalesTrendChart from "./SalesTrendChart";
import { fuelChartConfig, fuelKeys, type FuelFilter } from "./chart-config";

const monthFormat = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  timeZone: "UTC",
});

function fuelOptions(data: FuelTrendPoint[], selected: FuelFilter) {
  return [
    { label: "All", value: "all" as const },
    ...fuelKeys
      .filter((fuel) => fuel !== "other" || selected === fuel || data.some((point) => point.other !== 0))
      .map((fuel) => ({ label: fuelChartConfig[fuel].label, value: fuel })),
  ];
}

export default function DashboardTrends({
  metrics,
  stationOverview = false,
}: {
  metrics: DashboardMetrics;
  stationOverview?: boolean;
}) {
  const [salesFuel, setSalesFuel] = useState<FuelFilter>("all");
  const [ordersFuel, setOrdersFuel] = useState<FuelFilter>("all");
  const monthLabel = monthFormat.format(
    new Date(Date.UTC(2000, metrics.period.month - 1, 1)),
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <SalesTrendChart
        title={stationOverview ? "Sales Overview" : undefined}
        total={metrics.revenueTotal}
        monthLabel={monthLabel}
        data={metrics.revenueTrend}
        fuel={metrics.revenueTrend.length ? salesFuel : "all"}
        controls={stationOverview && metrics.revenueTrend.length > 0 && (
          <FilterPill
            label="Fuel Type"
            options={fuelOptions(metrics.revenueTrend, salesFuel)}
            value={salesFuel}
            onChange={setSalesFuel}
          />
        )}
      />
      <OrdersTrendChart
        title={stationOverview ? "Orders Overview" : undefined}
        total={metrics.ordersTotal}
        monthLabel={monthLabel}
        data={metrics.ordersTrend}
        fuel={metrics.ordersTrend.length ? ordersFuel : "all"}
        controls={stationOverview && metrics.ordersTrend.length > 0 && (
          <FilterPill
            label="Fuel Type"
            options={fuelOptions(metrics.ordersTrend, ordersFuel)}
            value={ordersFuel}
            onChange={setOrdersFuel}
          />
        )}
      />
    </div>
  );
}
