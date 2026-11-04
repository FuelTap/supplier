"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatCount } from "@/components/admin/ui/format";
import type { StatValue, TrendPoint } from "@/lib/server/admin/types";
import TrendCard from "./TrendCard";

export default function OrdersTrendChart({
  total,
  data,
}: {
  total: StatValue;
  data: TrendPoint[];
}) {
  return (
    <TrendCard
      title="Orders Trend"
      value={formatCount(total.value)}
      trend={total.trend}
      isEmpty={data.length === 0}
      emptyBackdrop={
        <div className="flex size-full items-end gap-2">
          {[2, 4, 10, 6, 3, 5, 9, 4, 6, 10, 5, 4, 2].map((h, i) => (
            <span
              key={i}
              className="flex-1 bg-[#EEF0FC]"
              style={{ height: `${h * 5}%` }}
            />
          ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <XAxis dataKey="label" hide />
          <Tooltip
            formatter={(value) => [formatCount(Number(value)), "Orders"]}
            cursor={{ fill: "#EEF0FC" }}
          />
          <Bar dataKey="value" fill="#4E71E8" />
        </BarChart>
      </ResponsiveContainer>
    </TrendCard>
  );
}
