"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";

export type DateRange = { from: string; to: string }; // yyyy-mm-dd, or ""

const short = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

function label(range: DateRange) {
  if (!range.from && !range.to) return "--";
  const from = range.from ? short.format(new Date(range.from)) : "…";
  const to = range.to ? short.format(new Date(range.to)) : "…";
  return `${from} – ${to}`;
}

// "Date Range | -- 📅" pill that opens a from/to picker.
export default function DateRangePill({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (value: DateRange) => void;
}) {
  return (
    <div className="flex h-12 shrink-0 items-center rounded-full border border-gray-100 bg-white">
      <span className="text-grey-800 flex h-full items-center border-r border-gray-100 px-4 text-xs whitespace-nowrap">
        Date Range
      </span>
      <Popover>
        <PopoverTrigger
          aria-label="Choose date range"
          className="flex h-full cursor-pointer items-center gap-3 rounded-r-full px-4 text-xs font-medium text-black"
        >
          {label(value)}
          <CalendarDays size={16} aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 gap-3 p-4">
          <label className="flex flex-col gap-1 text-xs text-black">
            From
            <input
              type="date"
              value={value.from}
              max={value.to || undefined}
              onChange={(e) => onChange({ ...value, from: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-black">
            To
            <input
              type="date"
              value={value.to}
              min={value.from || undefined}
              onChange={(e) => onChange({ ...value, to: e.target.value })}
            />
          </label>
          <button
            type="button"
            onClick={() => onChange({ from: "", to: "" })}
            className="text-primary-500 cursor-pointer self-start text-xs hover:underline"
          >
            Clear dates
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
