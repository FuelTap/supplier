"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ManagerStatus, ManagerView } from "@/lib/server/admin/types";
import ActionsMenu from "@/components/admin/ui/ActionsMenu";
import FilterPill from "@/components/admin/ui/FilterPill";
import PageHeading from "@/components/admin/ui/PageHeading";
import Pagination, { paginate } from "@/components/admin/ui/Pagination";
import { primaryPillClass } from "@/components/admin/ui/PillInput";
import SearchBox from "@/components/admin/ui/SearchBox";
import StatCard from "@/components/admin/ui/StatCard";
import StatusBadge, { type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { formatRelative } from "@/components/admin/ui/format";
import { useManagerActions } from "./useManagerActions";

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Pending Invitation", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
] as const;

const statusBadge: Record<ManagerStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending Invitation", tone: "blue" },
  active: { label: "Active", tone: "green" },
  inactive: { label: "Inactive", tone: "yellow" },
};

const stationStatusLabel = {
  active: "Active",
  inactive: "Inactive",
  unassigned: "Unassigned",
} as const;

export default function ManagersList({
  managers,
  now,
}: {
  managers: ManagerView[];
  // Server time, so "2 hours ago" renders the same on server and client.
  now: number;
}) {
  const { actionsFor, dialogs } = useManagerActions();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof statusOptions)[number]["value"]>("all");
  const [state, setState] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(24);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const states = [
    ...new Set(managers.flatMap((m) => (m.station ? [m.station.state] : []))),
  ].sort();
  const stateOptions = [
    { label: "All States", value: "all" },
    ...states.map((s) => ({ label: s, value: s })),
  ];

  const query = search.trim().toLowerCase();
  const filtered = managers.filter(
    (m) =>
      (status === "all" || m.status === status) &&
      (state === "all" || m.station?.state === state) &&
      (!query ||
        [m.name, m.email, m.station?.name ?? ""].some((field) =>
          field.toLowerCase().includes(query),
        )),
  );
  const current = paginate(filtered, page, perPage);

  const stats = {
    total: managers.length,
    active: managers.filter((m) => m.status === "active").length,
    pending: managers.filter((m) => m.status === "pending").length,
    suspended: managers.filter((m) => m.status === "inactive").length,
    unassigned: managers.filter((m) => m.status === "active" && !m.station).length,
  };

  const allOnPage =
    current.rows.length > 0 && current.rows.every((m) => selected.has(m.id));
  const toggle = (ids: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  const checkboxClass =
    "accent-primary-500 h-5! w-5! cursor-pointer rounded! border-gray-200! p-0!";

  return (
    <>
      <PageHeading title="Managers" subtitle="Manage details of station managers" />

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-5">
        <StatCard label="Total Managers" value={String(stats.total)} />
        <StatCard label="Active Managers" value={String(stats.active)} />
        <StatCard label="Pending Invitations" value={String(stats.pending)} />
        <StatCard label="Suspended Managers" value={String(stats.suspended)} />
        <StatCard label="Unassigned Managers" value={String(stats.unassigned)} />
      </div>

      <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SearchBox
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by manager, station"
        />
        <div className="flex flex-wrap items-center gap-3">
          <FilterPill
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          <FilterPill
            label="State"
            options={stateOptions}
            value={state}
            onChange={(value) => {
              setState(value);
              setPage(1);
            }}
          />
          <Link
            href="/managers/invite"
            className={`${primaryPillClass} w-auto! gap-2 px-6`}
          >
            <Plus size={18} aria-hidden="true" />
            Invite Manager
          </Link>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-base [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <thead>
              <tr className="text-lg text-black">
                <th className="w-12 py-5 pl-5">
                  <input
                    type="checkbox"
                    aria-label="Select all managers on this page"
                    checked={allOnPage}
                    onChange={(e) =>
                      toggle(current.rows.map((m) => m.id), e.target.checked)
                    }
                    className={checkboxClass}
                  />
                </th>
                <th className="px-3 py-5 font-medium">Managers ID</th>
                <th className="px-5 py-5 font-medium">Manager</th>
                <th className="px-5 py-5 font-medium">Contact Details</th>
                <th className="px-5 py-5 font-medium">Station</th>
                <th className="px-5 py-5 font-medium">Status</th>
                <th className="px-5 py-5 font-medium">Last Log In</th>
                <th className="px-5 py-5 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {current.rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-grey-800 px-5 py-10 text-center">
                    {managers.length === 0
                      ? "No managers yet. Invite your first manager to get started."
                      : "No managers match your search or filters."}
                  </td>
                </tr>
              )}
              {current.rows.map((manager) => (
                <tr key={manager.id} className="odd:bg-[#EEF0FC]">
                  <td className="py-4 pl-5">
                    <input
                      type="checkbox"
                      aria-label={`Select ${manager.name}`}
                      checked={selected.has(manager.id)}
                      onChange={(e) => toggle([manager.id], e.target.checked)}
                      className={checkboxClass}
                    />
                  </td>
                  <td className="text-grey-800 px-3 py-4 whitespace-nowrap">
                    {manager.code}
                  </td>
                  <td className="text-primary-500 px-5 py-4 whitespace-nowrap">
                    {manager.name}
                  </td>
                  <td className="max-w-52 px-5 py-4">
                    <span className="block truncate text-black" title={manager.email}>
                      {manager.email}
                    </span>
                    <span className="text-grey-800 block text-sm">{manager.phone}</span>
                  </td>
                  <td className="max-w-56 px-5 py-4">
                    {manager.station ? (
                      <>
                        <span className="block truncate text-black" title={manager.station.name}>
                          {manager.station.name}
                        </span>
                        <span className="text-grey-800 block text-sm">
                          {stationStatusLabel[manager.station.displayStatus]}
                        </span>
                      </>
                    ) : (
                      <span className="text-yellow-600">Not Assigned</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={statusBadge[manager.status].tone}>
                      {statusBadge[manager.status].label}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-black">
                    {formatRelative(manager.lastLoginAt, now)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center">
                      <ActionsMenu
                        label={`Actions for ${manager.name}`}
                        actions={actionsFor(manager)}
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
          noun="Managers"
          onPageChange={setPage}
          onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
        />
      </div>

      {dialogs}
    </>
  );
}
