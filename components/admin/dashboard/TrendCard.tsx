import EmptyIllustration from "@/components/admin/ui/EmptyIllustration";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface Props {
  title: string;
  value: string;
  trend: number;
  isEmpty: boolean;
  children: React.ReactNode;
  // Faint placeholder drawn behind the illustration when there's no data.
  emptyBackdrop: React.ReactNode;
}

// Card frame shared by the revenue and orders charts.
export default function TrendCard({
  title,
  value,
  trend,
  isEmpty,
  children,
  emptyBackdrop,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <header className="flex items-end justify-between border-b border-gray-100 px-8 py-6">
        <div>
          <h2 className="text-lg text-black">{title}</h2>
          <p className="mt-1 text-2xl font-medium text-black">{value}</p>
        </div>
        <span
          className={cn(
            "flex items-center gap-1 text-sm font-medium",
            trend > 0 ? "text-green-500" : "text-neutra-800",
          )}
        >
          <ArrowUpRight size={16} aria-hidden="true" />
          {trend > 0 ? `+${trend}%` : "0"}
        </span>
      </header>
      <div className="relative h-60 px-8 py-5">
        {isEmpty ? (
          <>
            <div className="absolute inset-x-8 bottom-5 h-48 opacity-60">
              {emptyBackdrop}
            </div>
            <EmptyIllustration className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
