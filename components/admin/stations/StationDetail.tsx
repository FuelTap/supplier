"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, use, useState, useTransition } from "react";
import { dashboardPeriodHref } from "@/lib/helpers/dashboard-period";
import { splitName } from "@/lib/helpers/help";
import type {
  OrderStatus,
  QueryResult,
  StationDashboardMetrics,
  StationOrder,
  StationView,
} from "@/lib/server/admin/types";
import DashboardTrends from "@/components/admin/dashboard/DashboardTrends";
import MetricsPeriodPicker from "@/components/admin/dashboard/MetricsPeriodPicker";
import ActionsMenu from "@/components/admin/ui/ActionsMenu";
import LoadError from "@/components/admin/ui/LoadError";
import type { ManagerOption } from "@/components/admin/ui/ManagerPicker";
import type { MonthYear } from "@/components/admin/ui/MonthYearPill";
import Pagination, { paginate } from "@/components/admin/ui/Pagination";
import StatCard from "@/components/admin/ui/StatCard";
import StatusBadge, { type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { FiguresSkeleton } from "@/components/admin/ui/SupplierSkeletons";
import {
  formatCount,
  formatNaira,
  formatNairaCompact,
} from "@/components/admin/ui/format";
import { StationStatusBadge } from "./StationBadges";
import { useStationActions } from "./useStationActions";

const orderStatus: Record<OrderStatus, { label: string; tone: BadgeTone }> = {
  new: { label: "New", tone: "blue" },
  ready: { label: "Ready for Delivery", tone: "green" },
  delivered: { label: "Delivered", tone: "green" },
  "out-for-delivery": { label: "Out for Delivery", tone: "blue" },
  cancelled: { label: "Cancelled", tone: "red" },
  scheduled: { label: "Scheduled", tone: "yellow" },
};

type StationDetailProps = {
  station: StationView;
  orders: StationOrder[];
  managers: ManagerOption[];
  metrics: Promise<QueryResult<StationDashboardMetrics>>;
};

export default function StationDetail({
  station,
  orders,
  managers,
  metrics,
}: StationDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { actionsFor, dialogs } = useStationActions(managers);
  const hasActivity = orders.length > 0;

  function selectPeriod(period: MonthYear) {
    startTransition(() => {
      router.push(dashboardPeriodHref(`/stations/${encodeURIComponent(station.id)}`, period), {
        scroll: false,
      });
    });
  }

  return (
    <>
      {/* Stacked on phones: Back, then title, then status and actions. */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-start gap-4 md:flex-row md:gap-5">
          <Link
            href="/stations"
            className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-sm text-black hover:bg-gray-100"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Back
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-medium text-blue-600 md:text-2xl">
                {station.name}
              </h1>
              {station.displayStatus === "active" && station.closesAt && (
                <span className="bg-primary-50 text-primary-500 rounded-full px-4 py-1 text-sm md:text-lg">
                  Open now, closes {station.closesAt}
                </span>
              )}
            </div>
            <p className="text-grey-800 mt-1 text-base md:text-lg">
              {[...new Set([station.address, station.city, station.state])]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:justify-end md:gap-5">
          <MetricsPeriodPicker metrics={metrics} onChange={selectPeriod} />
          <div className="flex shrink-0 items-center gap-3 md:gap-5">
            <StationStatusBadge station={station} />
            <ActionsMenu
              label={`Actions for ${station.name}`}
              trigger="button"
              actions={actionsFor(station, { detail: true })}
            />
          </div>
        </div>
      </div>

      <div className="relative flow-root">
        {isPending && (
          <p role="status" className="text-grey-800 absolute top-2 right-0 text-sm">
            Updating station figures…
          </p>
        )}
        <div aria-busy={isPending}>
          <Suspense fallback={<FiguresSkeleton station />}>
            <StationFigures metrics={metrics} />
          </Suspense>
        </div>
      </div>

      {hasActivity && <OrdersTable orders={orders} />}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {hasActivity && (
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <h2 className="border-b border-gray-100 px-8 py-8 text-xl text-black">
              Products & Prices
            </h2>
            <ul>
              {station.products.map((product) => (
                <li
                  key={product.name}
                  className="flex h-14.5 items-center justify-between px-8 text-base text-black odd:bg-[#EEF0FC]"
                >
                  <span>{product.name}</span>
                  <span>
                    {product.unit === "L"
                      ? `${formatNaira(product.price)}/L`
                      : `${formatCount(product.price)}/kg`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <ManagerCard station={station} />
      </div>

      {dialogs}
    </>
  );
}

function StationFigures({ metrics }: Pick<StationDetailProps, "metrics">) {
  const result = use(metrics);
  if (!result.success) {
    return (
      <LoadError
        title="We couldn't load this station's figures"
        message={result.message}
      />
    );
  }

  const figures = result.data;
  const { todaySales, todayOrders } = figures;
  return (
    <div className="mt-10 flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        <StatCard
          label="Today's Sales"
          value={todaySales ? formatNairaCompact(todaySales.value) : "—"}
          trend={todaySales?.trend}
          comparison="vs yesterday"
        />
        <StatCard
          label="Today's Orders"
          value={todayOrders ? formatCount(todayOrders.value) : "—"}
          trend={todayOrders?.trend}
          comparison="vs yesterday"
        />
        <StatCard
          label="Sales this month"
          value={formatNairaCompact(figures.salesThisMonth.value)}
          trend={figures.salesThisMonth.trend}
        />
        <StatCard
          label="Orders this month"
          value={formatCount(figures.ordersThisMonth.value)}
          trend={figures.ordersThisMonth.trend}
        />
      </div>
      <DashboardTrends metrics={figures} stationOverview />
    </div>
  );
}

function ManagerCard({ station }: { station: StationView }) {
  const manager = station.manager;
  return (
    <section className="h-fit overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
        <h2 className="text-xl text-black">Manager</h2>
        {manager &&
          (manager.status === "pending" ? (
            <StatusBadge tone="yellow">Invite Pending</StatusBadge>
          ) : manager.status === "active" ? (
            <StatusBadge tone="green">Active</StatusBadge>
          ) : (
            <StatusBadge tone="yellow">Suspended</StatusBadge>
          ))}
      </div>
      {manager ? (
        <div className="flex items-center gap-3 px-8 py-6">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl text-white">
            {splitName(manager.name)}
          </span>
          <div className="min-w-0">
            <p className="text-xl font-medium text-black">{manager.name}</p>
            <p className="text-grey-800 truncate text-sm">{manager.email}</p>
            <p className="text-sm text-yellow-600">
              +234 {manager.phone.replace(/^0/, "")}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-grey-800 px-8 py-6 text-base">
          No manager assigned yet. Use the actions menu to assign one.
        </p>
      )}
    </section>
  );
}

function OrdersTable({ orders }: { orders: StationOrder[] }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const current = paginate(orders, page, perPage);
  const allOnPage =
    current.rows.length > 0 && current.rows.every((o) => selected.has(o.id));

  const toggle = (ids: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const checkboxClass =
    "accent-primary-500 h-5! w-5! cursor-pointer rounded! border-gray-200! p-0!";

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left text-base [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
          <thead>
            <tr className="text-lg text-black">
              <th className="w-12 py-5 pl-5">
                <input
                  type="checkbox"
                  aria-label="Select all orders on this page"
                  checked={allOnPage}
                  onChange={(e) =>
                    toggle(current.rows.map((o) => o.id), e.target.checked)
                  }
                  className={checkboxClass}
                />
              </th>
              <th className="px-3 py-5 font-medium">Order ID</th>
              <th className="px-5 py-5 font-medium">Station</th>
              <th className="px-5 py-5 font-medium">Customer</th>
              <th className="px-5 py-5 font-medium">Fuel Type</th>
              <th className="px-5 py-5 font-medium">Qty</th>
              <th className="px-5 py-5 font-medium">Amount</th>
              <th className="px-5 py-5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {current.rows.map((order) => (
              <tr key={order.id} className="odd:bg-[#EEF0FC]">
                <td className="py-5 pl-5">
                  <input
                    type="checkbox"
                    aria-label={`Select ${order.code}`}
                    checked={selected.has(order.id)}
                    onChange={(e) => toggle([order.id], e.target.checked)}
                    className={checkboxClass}
                  />
                </td>
                <td className="text-grey-800 px-3 py-5">{order.code}</td>
                <td className="px-5 py-5 text-black">{order.frequency}</td>
                <td className="text-primary-500 px-5 py-5">{order.customer}</td>
                <td className="px-5 py-5 text-black">{order.fuelType}</td>
                <td className="px-5 py-5 text-black">{order.quantity}</td>
                <td className="px-5 py-5 text-black">{formatNaira(order.amount)}</td>
                <td className="px-5 py-5">
                  <StatusBadge tone={orderStatus[order.status].tone}>
                    {orderStatus[order.status].label}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={current.page}
        perPage={perPage}
        total={orders.length}
        noun="Orders"
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setPage(1);
        }}
      />
    </div>
  );
}
