"use client";

import { Command } from "cmdk";
import { Check, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ManagerOption = { id: string; name: string };

// Searchable list of managers with a check on the selected one.
export function ManagerList({
  managers,
  value,
  onSelect,
}: {
  managers: ManagerOption[];
  value: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Command className="w-full" label="Managers">
      <div className="p-3">
        <div className="flex h-12 items-center gap-3 rounded-full border border-gray-100 px-4">
          <Search size={20} className="text-grey-800 shrink-0" aria-hidden="true" />
          {/* ! modifiers override the global `input` styles. */}
          <Command.Input
            placeholder="Search"
            className="h-full! w-full rounded-none! border-0! bg-transparent! p-0! text-base! text-black! outline-none placeholder:text-grey-800!"
          />
        </div>
      </div>
      <Command.List className="max-h-64 overflow-y-auto">
        <Command.Empty className="text-grey-800 px-4 py-6 text-center text-sm">
          No managers found.
        </Command.Empty>
        {managers.map((manager) => (
          <Command.Item
            key={manager.id}
            value={`${manager.name} ${manager.id}`}
            onSelect={() => onSelect(manager.id)}
            className={cn(
              "flex cursor-pointer items-center justify-between px-4 py-4 text-base outline-none data-[selected=true]:bg-gray-100",
              manager.id === value
                ? "bg-primary-50! text-primary-500"
                : "text-black",
            )}
          >
            {manager.name}
            {manager.id === value && <Check size={18} aria-label="Selected" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
}

// Form field version: a pill that opens the searchable list.
export default function ManagerPicker({
  id,
  managers,
  value,
  onChange,
  placeholder = "Select a manager",
}: {
  id?: string;
  managers: ManagerOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = managers.find((m) => m.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        className="flex h-12.5 w-full cursor-pointer items-center justify-between rounded-full border border-gray-200 bg-white px-5 text-base"
      >
        <span className={selected ? "text-black" : "text-grey-800"}>
          {selected?.name ?? placeholder}
        </span>
        <ChevronDown size={20} className="text-black" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--anchor-width) gap-0 overflow-hidden rounded-2xl p-0"
      >
        <ManagerList
          managers={managers}
          value={value}
          onSelect={(managerId) => {
            onChange(managerId === value ? null : managerId);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
