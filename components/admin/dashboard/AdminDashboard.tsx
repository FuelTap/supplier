"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import { markSetupCompletionShown } from "@/lib/server/admin/dashboard";
import type {
  DashboardMetrics,
  SetupStatus,
} from "@/lib/server/admin/types";
import MonthYearPill, { type MonthYear } from "@/components/admin/ui/MonthYearPill";
import FilterPill from "@/components/admin/ui/FilterPill";
import LoadError from "@/components/admin/ui/LoadError";
import PageHeading from "@/components/admin/ui/PageHeading";
import ProcessingOverlay from "@/components/admin/ui/ProcessingOverlay";
import { primaryPillClass } from "@/components/admin/ui/PillInput";
import AdminSetupChecklist from "./AdminSetupChecklist";
import AdminStatsRow from "./AdminStatsRow";
import OrdersTrendChart from "./OrdersTrendChart";
import SalesTrendChart from "./SalesTrendChart";
import TopStationsTable from "./TopStationsTable";

interface Props {
  companyName: string;
  setup: SetupStatus;
  metrics: DashboardMetrics | null;
  // Why `metrics` is null, when it failed to load.
  metricsError: string | null;
  stations: { id: string; name: string }[];
}

const HANDOFF_MS = 2500;

export default function AdminDashboard({
  companyName,
  setup,
  metrics,
  metricsError,
  stations,
}: Props) {
  const router = useRouter();
  const setupComplete =
    setup.kybSubmitted && setup.hasManager && setup.hasStation;
  // Play the "Processing…" hand-off once, the first time setup is complete.
  const showHandoff = setupComplete && !setup.completionShown;

  useEffect(() => {
    if (!showHandoff) return;
    const timer = setTimeout(async () => {
      await markSetupCompletionShown();
      router.refresh();
    }, HANDOFF_MS);
    return () => clearTimeout(timer);
  }, [showHandoff, router]);

  if (!setupComplete || showHandoff) {
    return (
      <>
        <PageHeading
          title="Dashboard"
          subtitle={companyName}
          subtitleTone="yellow"
        />
        <AdminSetupChecklist setup={setup} />
        {showHandoff && <ProcessingOverlay />}
      </>
    );
  }

  return (
    <FullDashboard
      companyName={companyName}
      metrics={metrics}
      metricsError={metricsError}
      stations={stations}
    />
  );
}

function FullDashboard({
  companyName,
  metrics,
  metricsError,
  stations,
}: Omit<Props, "setup">) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const stationId = searchParams.get("stationId") ?? "all";

  function updateFilters(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    startTransition(() => {
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    });
  }

  function selectPeriod(period: MonthYear) {
    updateFilters({ month: String(period.month), year: String(period.year) });
  }

  const monthLabel = metrics
    ? new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(
        new Date(Date.UTC(metrics.period.year, metrics.period.month - 1, 1)),
      )
    : "";

  const stationOptions = [
    { label: "All Stations", value: "all" },
    ...stations.map((s) => ({ label: s.name, value: s.id })),
  ];
  const stationLabel =
    stationOptions.find((o) => o.value === stationId)?.label ?? "All Stations";

  return (
    <>
      <PageHeading
        title="Dashboard"
        subtitle={`${companyName} · ${stationLabel.replace(/^TotalEnergies - /, "")}`}
        subtitleTone="yellow"
      >
        <FilterPill
          label="Stations"
          options={stationOptions}
          value={stationId}
          onChange={(id) => updateFilters({ stationId: id === "all" ? null : id })}
        />
        <MonthYearPill
          value={metrics?.period ?? null}
          onChange={selectPeriod}
        />
        <Link
          href="/stations/new"
          className={`${primaryPillClass} w-auto! gap-2 px-6`}
        >
          <Plus size={18} aria-hidden="true" />
          New Station
        </Link>
      </PageHeading>

      {isPending && <p role="status" className="mt-5 text-sm text-grey-800">Updating dashboard…</p>}
      {metrics ? (
        <div aria-busy={isPending} className="mt-10 flex flex-col gap-5">
          <AdminStatsRow metrics={metrics} />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SalesTrendChart
              total={metrics.revenueTotal}
              monthLabel={monthLabel}
              data={metrics.revenueTrend}
            />
            <OrdersTrendChart
              total={metrics.ordersTotal}
              monthLabel={monthLabel}
              data={metrics.ordersTrend}
            />
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <TopStationsTable
              title="Top-performing stations"
              stations={metrics.topStations}
            />
            <TopStationsTable
              title="Lowest-performing stations"
              stations={metrics.lowestStations}
            />
          </div>
        </div>
      ) : (
        <LoadError
          title="We couldn't load your dashboard figures"
          message={metricsError ?? "Please try again."}
        />
      )}
    </>
  );
}
