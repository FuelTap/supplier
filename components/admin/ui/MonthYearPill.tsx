"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type MonthYear = { month: number; year: number };

const monthFormat = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  timeZone: "UTC",
});
const months = Array.from({ length: 12 }, (_, index) =>
  monthFormat.format(new Date(Date.UTC(2026, index, 1))),
);

export default function MonthYearPill({
  value,
  onChange,
}: {
  value: MonthYear | null;
  onChange: (value: MonthYear) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-12 shrink-0 items-center rounded-full border border-gray-100 bg-white">
      <span className="text-grey-800 flex h-full items-center border-r border-gray-100 px-4 text-xs whitespace-nowrap">
        Month
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label="Choose month and year"
          disabled={!value}
          className="flex h-full cursor-pointer items-center gap-3 rounded-r-full px-4 text-xs font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {value ? `${months[value.month - 1]} ${value.year}` : "Select month"}
          <CalendarDays size={16} aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-4">
          {value && (
            <form
              key={`${value.year}-${value.month}`}
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                onChange({
                  month: Number(form.get("month")),
                  year: Number(form.get("year")),
                });
                setOpen(false);
              }}
            >
              <label className="flex flex-col gap-1 text-xs text-black">
                Month
                <select
                  name="month"
                  defaultValue={value.month}
                  className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>{month}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-black">
                Year
                <input
                  name="year"
                  type="number"
                  min={1}
                  max={9999}
                  step={1}
                  required
                  defaultValue={value.year}
                  className="h-10 rounded-md border border-gray-200 px-3 text-sm"
                />
              </label>
              <button
                type="submit"
                className="bg-primary-500 h-10 cursor-pointer rounded-full px-4 text-xs font-medium text-white"
              >
                Apply
              </button>
            </form>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
