"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { StationView } from "@/lib/server/admin/types";
import ActionsMenu from "@/components/admin/ui/ActionsMenu";
import EmptyIllustration from "@/components/admin/ui/EmptyIllustration";
import FilterPill from "@/components/admin/ui/FilterPill";
import type { ManagerOption } from "@/components/admin/ui/ManagerPicker";
import PageHeading from "@/components/admin/ui/PageHeading";
import Pagination, { paginate } from "@/components/admin/ui/Pagination";
import { primaryPillClass } from "@/components/admin/ui/PillInput";
import SearchBox from "@/components/admin/ui/SearchBox";
import StatCard from "@/components/admin/ui/StatCard";
import { ComplianceBadge, StationStatusBadge } from "./StationBadges";
import { useStationActions } from "./useStationActions";

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Unassigned", value: "unassigned" },
] as const;

type StatusFilter = (typeof statusOptions)[number]["value"];

export default function StationsList({
  stations,
  managers,
}: {
  stations: StationView[];
  managers: ManagerOption[];
}) {
  const { actionsFor, dialogs } = useStationActions(managers);
  const [search, setSearch] = useState("");
  const [stationFilter, setStationFilter] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(24);

  const stationOptions = [
    { label: "All Stations", value: "all" },
    ...stations.map((s) => ({ label: s.name, value: s.id })),
  ];

  const query = search.trim().toLowerCase();
  const filtered = stations.filter(
    (s) =>
      (stationFilter === "all" || s.id === stationFilter) &&
      (status === "all" || s.displayStatus === status) &&
      (!query ||
        [s.name, s.city, s.address, s.manager?.name ?? ""].some((field) =>
          field.toLowerCase().includes(query),
        )),
  );
  const current = paginate(filtered, page, perPage);

  const stats = {
    total: stations.length,
    active: stations.filter((s) => s.displayStatus === "active").length,
    setupIncomplete: stations.filter(
      (s) => s.manager && s.complianceStatus === "pending",
    ).length,
    unassigned: stations.filter((s) => !s.manager).length,
  };

  return (
    <>
      <PageHeading
        title="Stations"
        subtitle="Manage and scale your retail outlets. Track managers, view live statuses, and open new branches."
      />

      <div className="mt-10 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        <StatCard label="Total Stations" value={String(stats.total)} trend={0} />
        <StatCard label="Active Stations" value={String(stats.active)} trend={0} />
        <StatCard
          label="Setup Incomplete"
          value={String(stats.setupIncomplete)}
          trend={0}
        />
        <StatCard
          label="Unassigned Stations"
          value={String(stats.unassigned)}
          trend={0}
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SearchBox
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by station name, city, or manager.."
        />
        <div className="flex flex-wrap items-center gap-3">
          <FilterPill
            label="Stations"
            options={stationOptions}
            value={stationFilter}
            onChange={(value) => {
              setStationFilter(value);
              setPage(1);
            }}
          />
          <FilterPill
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          <Link
            href="/stations/new"
            className={`${primaryPillClass} w-auto! gap-2 px-6`}
          >
            <Plus size={18} aria-hidden="true" />
            New Station
          </Link>
        </div>
      </div>

      {stations.length === 0 ? (
        <div className="mt-5 flex flex-col items-center text-center">
          <EmptyIllustration />
          <h2 className="mt-8 text-xl font-medium text-black">
            No Stations added Yet
          </h2>
          <p className="text-grey-800 mt-4 max-w-144 text-base">
            To begin listing your outlets and delivering fuel to customers,
            start by adding your first branch location and assigning it to your
            verified manager.
          </p>
          <Link
            href="/stations/new"
            className={`${primaryPillClass} mt-6 w-auto! gap-2 px-5`}
          >
            <Plus size={18} aria-hidden="true" />
            Add your First Station
          </Link>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left text-base [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
              <thead>
                <tr className="text-lg text-black">
                  <th className="px-5 py-5 font-medium">Stations ID</th>
                  <th className="px-5 py-5 font-medium">Branch Name</th>
                  <th className="px-5 py-5 font-medium">Manager</th>
                  <th className="px-5 py-5 font-medium">Address</th>
                  <th className="px-5 py-5 font-medium">Compliance Status</th>
                  <th className="px-5 py-5 font-medium">Status</th>
                  <th className="px-5 py-5 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {current.rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-grey-800 px-5 py-10 text-center">
                      No stations match your search or filters.
                    </td>
                  </tr>
                )}
                {current.rows.map((station) => (
                  <tr key={station.id} className="odd:bg-[#EEF0FC]">
                    <td className="text-grey-800 px-5 py-4 whitespace-nowrap">
                      {station.code}
                    </td>
                    <td className="max-w-52 px-5 py-4">
                      <Link
                        href={`/stations/${station.id}`}
                        className="text-primary-500 block truncate hover:underline"
                        title={station.name}
                      >
                        {station.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {station.manager ? (
                        <span className="text-black">{station.manager.name}</span>
                      ) : (
                        <span className="text-yellow-600">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-black">
                      {station.address && (
                        <span className="block">{station.address}</span>
                      )}
                      <span className="text-grey-800 block">
                        {[station.city, station.state].filter(Boolean).join(", ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <ComplianceBadge station={station} />
                    </td>
                    <td className="px-5 py-4">
                      <StationStatusBadge station={station} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <ActionsMenu
                          label={`Actions for ${station.name}`}
                          actions={actionsFor(station)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={current.page}
            perPage={perPage}
            total={filtered.length}
            noun="Stations"
            onPageChange={setPage}
            onPerPageChange={(value) => {
              setPerPage(value);
              setPage(1);
            }}
          />
        </div>
      )}

      {dialogs}
    </>
  );
}
