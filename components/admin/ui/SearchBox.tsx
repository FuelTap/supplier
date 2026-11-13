"use client";

import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function SearchBox({ value, onChange, placeholder }: Props) {
  return (
    <div className="relative w-full min-w-0 xl:max-w-124">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-black"
      />
      {/* The ! modifiers override the unlayered global `input` styles. */}
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="focus-visible:border-primary-400/40! focus-visible:ring-primary-50 placeholder:text-grey-800! h-12! w-full rounded-full! border-gray-100! bg-white! pr-4! pl-14! text-base! text-black! outline-none focus-visible:ring-4"
      />
    </div>
  );
}
