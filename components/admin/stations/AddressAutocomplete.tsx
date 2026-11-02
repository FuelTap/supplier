"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { pillInputClass } from "@/components/admin/ui/PillInput";
import { cn } from "@/lib/utils";

export type AddressResult = {
  id: string;
  line1: string;
  line2: string;
  lat: number;
  lng: number;
  state: string | null;
  city: string | null;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
};

function toResult(item: NominatimResult): AddressResult {
  const a = item.address ?? {};
  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  const city = a.suburb ?? a.city ?? a.town ?? a.village ?? null;
  const rawState = a.state ?? null;
  const state =
    rawState === "Federal Capital Territory"
      ? "FCT"
      : (rawState?.replace(/ State$/, "") ?? null);
  return {
    id: String(item.place_id),
    line1: street || item.display_name.split(",")[0],
    line2: [city, "Nigeria"].filter(Boolean).join(", "),
    lat: Number(item.lat),
    lng: Number(item.lon),
    state,
    city,
  };
}

// Street address input with OpenStreetMap (Nominatim) suggestions.
export default function AddressAutocomplete({
  id,
  value,
  onChange,
  onSelect,
  invalid,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: AddressResult) => void;
  invalid?: boolean;
}) {
  const [results, setResults] = useState<AddressResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = value.trim();
    if (!open || query.length < 3) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=ng&limit=5&q=${encodeURIComponent(query)}`,
          { signal: controller.signal, headers: { Accept: "application/json" } },
        );
        const data: NominatimResult[] = await res.json();
        setResults(data.map(toResult));
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, open]);

  const showList = open && value.trim().length >= 3;

  return (
    <div className="relative">
      <input
        id={id}
        value={value}
        role="combobox"
        autoComplete="off"
        placeholder="e.g. 12 Admiralty Way, Lekki"
        aria-invalid={invalid}
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={id ? `${id}-results` : undefined}
        className={pillInputClass}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {showList && (
        <ul
          id={id ? `${id}-results` : undefined}
          role="listbox"
          className="absolute inset-x-2 top-full z-[600] mt-2 max-h-60 overflow-y-auto rounded-xl bg-white py-2 shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
        >
          {loading && results.length === 0 && (
            <li className="text-grey-800 px-5 py-3 text-sm">Searching…</li>
          )}
          {!loading && results.length === 0 && (
            <li className="text-grey-800 px-5 py-3 text-sm">
              No matching addresses. You can still type it and place the pin on
              the map.
            </li>
          )}
          {results.map((result) => (
            <li key={result.id} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(result);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-4 px-5 py-3 text-left hover:bg-gray-100",
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100"
                >
                  <MapPin size={18} />
                </span>
                <span>
                  <span className="block text-base text-black">{result.line1}</span>
                  <span className="text-grey-800 block text-sm">{result.line2}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
