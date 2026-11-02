"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option<T extends string> = { label: string; value: T };

interface Props<T extends string> {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

// Pill with a fixed label on the left and a select on the right, e.g.
// "Status | All Statuses ▾".
export default function FilterPill<T extends string>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <div className="flex h-12 shrink-0 items-center rounded-full border border-gray-100 bg-white">
      <span className="text-grey-800 flex h-full items-center border-r border-gray-100 px-4 text-xs whitespace-nowrap">
        {label}
      </span>
      <Select
        items={options}
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next as T);
        }}
      >
        <SelectTrigger
          aria-label={label}
          className="max-w-48 cursor-pointer gap-3 rounded-r-full border-0 px-4 text-xs font-medium text-black data-[size=default]:h-full"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer py-2.5"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
