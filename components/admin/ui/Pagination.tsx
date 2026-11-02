"use client";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";

const perPageOptions = [
  { label: "6", value: "6" },
  { label: "12", value: "12" },
  { label: "24", value: "24" },
] as const;

interface Props {
  page: number;
  perPage: number;
  total: number;
  noun: string; // e.g. "Stations"
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

const navClass =
  "border-primary-400/60 text-primary-400 flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-xs disabled:cursor-not-allowed disabled:opacity-40";

export default function Pagination({
  page,
  perPage,
  total,
  noun,
  onPageChange,
  onPerPageChange,
}: Props) {
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 px-6 py-3">
      <p className="text-sm text-black">
        Showing {from}–{to} of {total.toLocaleString()} {noun}
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          className={navClass}
          disabled={page <= 1}
          aria-label="Previous page"
          onClick={() => onPageChange(page - 1)}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        {pageWindow(page, pageCount).map((n, i) =>
          n === null ? (
            <span key={`gap-${i}`} aria-hidden="true" className="text-grey-800 px-1">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              aria-current={n === page ? "page" : undefined}
              aria-label={`Page ${n}`}
              onClick={() => onPageChange(n)}
              className={cn(
                "size-10 cursor-pointer rounded-lg text-sm",
                n === page
                  ? "bg-primary-500 text-white"
                  : "text-black hover:bg-gray-100",
              )}
            >
              {n}
            </button>
          ),
        )}
        <button
          type="button"
          className={navClass}
          disabled={page >= pageCount}
          aria-label="Next page"
          onClick={() => onPageChange(page + 1)}
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </nav>

      <div className="flex items-center gap-2 text-xs text-black">
        Per Page:
        <Select
          items={perPageOptions}
          value={String(perPage)}
          onValueChange={(next) => {
            if (next) onPerPageChange(Number(next));
          }}
        >
          <SelectTrigger
            aria-label="Rows per page"
            className="h-10 cursor-pointer gap-3 rounded-lg border-gray-100 bg-white px-3 text-sm data-[size=default]:h-10"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {perPageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Page numbers to show, with null for a gap: 1 … 4 5 6 … 20.
function pageWindow(page: number, pageCount: number): (number | null)[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages]
    .filter((n) => n >= 1 && n <= pageCount)
    .sort((a, b) => a - b);
  return sorted.flatMap((n, i) =>
    i > 0 && n - sorted[i - 1] > 1 ? [null, n] : [n],
  );
}

// Keeps page within range and returns the rows for the current page.
export function paginate<T>(rows: T[], page: number, perPage: number) {
  const pageCount = Math.max(1, Math.ceil(rows.length / perPage));
  const safePage = Math.min(page, pageCount);
  return {
    page: safePage,
    rows: rows.slice((safePage - 1) * perPage, safePage * perPage),
  };
}
