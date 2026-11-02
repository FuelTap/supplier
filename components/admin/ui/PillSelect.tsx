"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Full-width pill select used in forms (State, City).
export default function PillSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <Select
      items={options.map((o) => ({ label: o, value: o }))}
      value={value || null}
      onValueChange={(next) => onChange(next ?? "")}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className="data-placeholder:text-grey-800 w-full cursor-pointer rounded-full border-gray-200 bg-white px-5 text-base text-black data-[size=default]:h-12.5 [&_svg:not([class*='size-'])]:size-5 [&_svg]:text-black"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {options.map((option) => (
          <SelectItem key={option} value={option} className="cursor-pointer py-2.5 text-base">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
