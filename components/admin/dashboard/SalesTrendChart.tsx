"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatNairaCompact } from "@/components/admin/ui/format";
import type { FuelTrendPoint, StatValue } from "@/lib/server/admin/types";
import { fuelChartConfig, getFuelTrend, type FuelFilter } from "./chart-config";
import TrendCard from "./TrendCard";

export default function SalesTrendChart({
  total,
  data,
  monthLabel,
  title = "Sales Trend",
  fuel = "all",
  controls,
}: {
  total: StatValue;
  data: FuelTrendPoint[];
  monthLabel: string;
  title?: string;
  fuel?: FuelFilter;
  controls?: React.ReactNode;
}) {
  const series = getFuelTrend(total, data, fuel);

  return (
    <TrendCard
      title={title}
      value={formatNairaCompact(series.total.value)}
      trend={series.total.trend}
      isEmpty={data.length === 0}
      controls={controls}
    >
      <ChartContainer config={fuelChartConfig} className="h-full w-full aspect-auto">
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 4, right: 8, bottom: 16, left: 0 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={18}
            label={{ value: monthLabel, position: "insideBottom", offset: 0 }}
            height={40}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={58}
            tickFormatter={formatNairaCompact}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="min-w-44"
                labelFormatter={(_, payload) => `Day ${payload[0]?.payload.day}`}
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span>
                      {fuelChartConfig[name as keyof typeof fuelChartConfig]?.label ?? name}
                    </span>
                    <span className="font-medium tabular-nums">{formatNairaCompact(Number(value))}</span>
                  </div>
                )}
              />
            }
          />
          <ChartLegend
            verticalAlign="top"
            content={<ChartLegendContent className="justify-start pb-4 text-[10px] sm:text-xs" />}
          />
          {series.keys.map((fuel) => (
            <Area
              key={fuel}
              dataKey={fuel}
              stackId="fuels"
              fill={`var(--color-${fuel})`}
              stroke={`var(--color-${fuel})`}
              type="monotone"
              fillOpacity={0.14}
              strokeWidth={1.5}
            />
          ))}
        </AreaChart>
      </ChartContainer>
    </TrendCard>
  );
}
