"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatNaira, formatNairaCompact } from "@/components/admin/ui/format";
import type { StatValue, TrendPoint } from "@/lib/server/admin/types";
import TrendCard from "./TrendCard";

export default function RevenueTrendChart({
  total,
  data,
}: {
  total: StatValue;
  data: TrendPoint[];
}) {
  return (
    <TrendCard
      title="Revenue Trend"
      value={formatNairaCompact(total.value)}
      trend={total.trend}
      isEmpty={data.length === 0}
      emptyBackdrop={
        <svg viewBox="0 0 560 190" preserveAspectRatio="none" className="size-full">
          <path
            d="M0 170 L50 160 L100 110 L200 125 L260 85 L360 85 L410 40 L560 0 L560 190 L0 190 Z"
            fill="#F3F4F4"
          />
        </svg>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <XAxis dataKey="label" hide />
          <Tooltip
            formatter={(value) => [formatNaira(Number(value)), "Revenue"]}
            cursor={{ stroke: "#E0E1E2" }}
          />
          <Area
            type="linear"
            dataKey="value"
            stroke="#0EA774"
            strokeWidth={2}
            fill="#E7F8F2"
            fillOpacity={1}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </TrendCard>
  );
}
