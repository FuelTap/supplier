import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface Props {
  title: string;
  value: string;
  trend?: number;
  isEmpty: boolean;
  children: React.ReactNode;
  controls?: React.ReactNode;
}

// Card frame shared by the revenue and orders charts.
export default function TrendCard({
  title,
  value,
  trend,
  isEmpty,
  children,
  controls,
}: Props) {
  const TrendIcon = (trend ?? 0) < 0 ? ArrowDownLeft : ArrowUpRight;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-6 sm:px-8">
        <div>
          <h2 className="text-lg text-black">{title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-2xl font-medium text-black">{value}</p>
            {trend !== undefined && (
              <span
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  trend > 0 ? "text-green-500" : trend < 0 ? "text-error" : "text-neutra-800",
                )}
              >
                <TrendIcon size={16} aria-hidden="true" />
                {trend ? `${trend > 0 ? "+" : ""}${trend.toLocaleString("en-NG", { maximumFractionDigits: 2 })}%` : "0"}
              </span>
            )}
          </div>
        </div>
        {controls}
      </header>
      <div className="relative h-60 px-4 py-5 sm:px-8">
        {isEmpty ? (
          <Image
            src="/empty.png"
            alt="No chart data for this period"
            width={162}
            height={148}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
