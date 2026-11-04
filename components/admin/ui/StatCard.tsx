import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface Props {
  label: string;
  value: string;
  // Percentage change; omit to hide the trend row entirely.
  trend?: number;
  comparison?: string;
}

export default function StatCard({
  label,
  value,
  trend,
  comparison = "vs last Month",
}: Props) {
  const showTrend = trend !== undefined;
  const isDown = (trend ?? 0) < 0;
  const isZero = trend === 0;

  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      <p className="truncate border-b border-gray-100 px-4 py-2.5 text-xs text-black md:px-5 md:text-sm">
        {label}
      </p>
      <div className="px-4 pt-4 pb-3 md:px-5">
        <p className="font-pjs truncate text-xl font-medium text-black md:text-2xl">
          {value}
        </p>
        {showTrend && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
            <span
              className={cn(
                "flex items-center gap-1 font-medium",
                isZero
                  ? "text-neutra-700"
                  : isDown
                    ? "text-error"
                    : "text-green-500",
              )}
            >
              {isDown ? (
                <ArrowDownLeft size={14} aria-hidden="true" />
              ) : (
                <ArrowUpRight size={14} aria-hidden="true" />
              )}
              {isZero
                ? "0"
                : `${Math.abs(trend).toLocaleString("en-NG", { maximumFractionDigits: 2 })}%`}
            </span>
            <span className="text-grey-800">{comparison}</span>
          </div>
        )}
      </div>
    </div>
  );
}
