"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCount } from "@/components/admin/ui/format";
import type { FuelTrendPoint, StatValue } from "@/lib/server/admin/types";
import { fuelChartConfig, fuelKeys } from "./chart-config";
import TrendCard from "./TrendCard";

export default function OrdersTrendChart({
  total,
  data,
  monthLabel,
}: {
  total: StatValue;
  data: FuelTrendPoint[];
  monthLabel: string;
}) {
  const visibleFuels = fuelKeys.filter(
    (fuel) => fuel !== "other" || data.some((point) => point.other !== 0),
  );

  return (
    <TrendCard
      title="Orders Trend"
      value={formatCount(total.value)}
      trend={total.trend}
      isEmpty={data.length === 0}
      emptyBackdrop={null}
    >
      <ChartContainer
        config={fuelChartConfig}
        className="h-full w-full aspect-auto"
      >
        <BarChart
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
            tickFormatter={formatCount}
            allowDecimals={false}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="min-w-44"
                labelFormatter={(_, payload) =>
                  `Day ${payload[0]?.payload.day}`
                }
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span>
                      {fuelChartConfig[name as keyof typeof fuelChartConfig]
                        ?.label ?? name}
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatCount(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <ChartLegend
            verticalAlign="top"
            content={
              <ChartLegendContent className="justify-start pb-4 text-[10px] sm:text-xs" />
            }
          />
          {visibleFuels.map((fuel) => (
            <Bar
              key={fuel}
              dataKey={fuel}
              stackId="fuels"
              fill={`var(--color-${fuel})`}
              stroke={`var(--color-${fuel})`}
              maxBarSize={18}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </TrendCard>
  );
}
