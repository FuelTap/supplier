"use client";

import { useState } from "react";
import type { InventoryItem } from "@/lib/server/admin/types";
import FilterPill from "@/components/admin/ui/FilterPill";
import PageHeading from "@/components/admin/ui/PageHeading";
import Pagination, { paginate } from "@/components/admin/ui/Pagination";
import SearchBox from "@/components/admin/ui/SearchBox";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { formatDateTime, formatNaira } from "@/components/admin/ui/format";

const fuelOptions = [
  { label: "All", value: "all" },
  { label: "Petrol", value: "Petrol" },
  { label: "Diesel", value: "Diesel" },
  { label: "Cooking Gas", value: "Cooking Gas" },
] as const;

export default function InventoryTable({ inventory }: { inventory: InventoryItem[] }) {
  const [search, setSearch] = useState("");
  const [station, setStation] = useState("all");
  const [fuel, setFuel] = useState<(typeof fuelOptions)[number]["value"]>("all");
  const [state, setState] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(24);

  const unique = (values: string[]) => [...new Set(values)].sort();
  const stationOptions = [
    { label: "All Stations", value: "all" },
    ...unique(inventory.map((i) => i.stationId)).map((id) => ({
      label: inventory.find((i) => i.stationId === id)!.branchName,
      value: id,
    })),
  ];
  const stateOptions = [
    { label: "All States", value: "all" },
    ...unique(inventory.map((i) => i.state)).map((s) => ({ label: s, value: s })),
  ];

  const query = search.trim().toLowerCase();
  const filtered = inventory.filter(
    (item) =>
      (station === "all" || item.stationId === station) &&
      (fuel === "all" || item.fuelType === fuel) &&
      (state === "all" || item.state === state) &&
      (!query ||
        [item.branchName, item.fuelType, item.managerName ?? ""].some((field) =>
          field.toLowerCase().includes(query),
        )),
  );
  const current = paginate(filtered, page, perPage);
  const resetPage = <T,>(set: (value: T) => void) => (value: T) => {
    set(value);
    setPage(1);
  };

  return (
    <>
      <PageHeading
        title="Inventory"
        subtitle="View and monitor inventory across all stations."
      />

      <div className="mt-8 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SearchBox
          value={search}
          onChange={resetPage(setSearch)}
          placeholder="Search by branch name, fuel type.."
        />
        <div className="flex flex-wrap items-center gap-3">
          <FilterPill
            label="Stations"
            options={stationOptions}
            value={station}
            onChange={resetPage(setStation)}
          />
          <FilterPill
            label="Fuel Type"
            options={fuelOptions}
            value={fuel}
            onChange={resetPage(setFuel)}
          />
          <FilterPill
            label="State"
            options={stateOptions}
            value={state}
            onChange={resetPage(setState)}
          />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-base [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <thead>
              <tr className="text-lg text-black">
                <th className="px-5 py-5 font-medium">Branch Name</th>
                <th className="px-5 py-5 font-medium">Manager</th>
                <th className="px-5 py-5 font-medium">Fuel Type</th>
                <th className="px-5 py-5 font-medium">Amount/Litre</th>
                <th className="px-5 py-5 font-medium">Status</th>
                <th className="px-5 py-5 font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {current.rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-grey-800 px-5 py-10 text-center">
                    {inventory.length === 0
                      ? "No inventory yet. Add a station to start listing fuel."
                      : "No inventory matches your search or filters."}
                  </td>
                </tr>
              )}
              {current.rows.map((item) => {
                const updated = formatDateTime(item.lastUpdated);
                return (
                  <tr key={item.id} className="odd:bg-[#EEF0FC]">
                    <td className="max-w-52 truncate px-5 py-4 text-black" title={item.branchName}>
                      {item.branchName}
                    </td>
                    <td className="px-5 py-4 text-black">
                      {item.managerName ?? (
                        <span className="text-yellow-600">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-black">{item.fuelType}</td>
                    <td className="px-5 py-4 text-black">
                      {formatNaira(item.pricePerUnit)}
                      {item.fuelType === "Cooking Gas" && (
                        <span className="text-grey-800 text-sm">/kg</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {item.enabled ? (
                        <StatusBadge tone="green">Enabled</StatusBadge>
                      ) : (
                        <StatusBadge tone="grey">Disabled</StatusBadge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-black">
                      <span className="block">{updated.date}</span>
                      <span className="text-grey-800 block">{updated.time}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          page={current.page}
          perPage={perPage}
          total={filtered.length}
          noun="Items"
          onPageChange={setPage}
          onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
        />
      </div>
    </>
  );
}
