"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { markSetupCompletionShown } from "@/lib/server/admin/dashboard";
import type {
  DashboardMetrics,
  SetupStatus,
} from "@/lib/server/admin/types";
import DateRangePill, { type DateRange } from "@/components/admin/ui/DateRangePill";
import FilterPill from "@/components/admin/ui/FilterPill";
import PageHeading from "@/components/admin/ui/PageHeading";
import ProcessingOverlay from "@/components/admin/ui/ProcessingOverlay";
import { primaryPillClass } from "@/components/admin/ui/PillInput";
import AdminSetupChecklist from "./AdminSetupChecklist";
import AdminStatsRow from "./AdminStatsRow";
import OrdersTrendChart from "./OrdersTrendChart";
import RevenueTrendChart from "./RevenueTrendChart";
import TopStationsTable from "./TopStationsTable";

interface Props {
  companyName: string;
  setup: SetupStatus;
  metrics: DashboardMetrics | null;
  stations: { id: string; name: string }[];
}

const HANDOFF_MS = 2500;

export default function AdminDashboard({
  companyName,
  setup,
  metrics,
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
      stations={stations}
    />
  );
}

function FullDashboard({
  companyName,
  metrics,
  stations,
}: Omit<Props, "setup">) {
  const [stationId, setStationId] = useState("all");
  const [range, setRange] = useState<DateRange>({ from: "", to: "" });

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
          onChange={setStationId}
        />
        <DateRangePill value={range} onChange={setRange} />
        <Link
          href="/stations/new"
          className={`${primaryPillClass} w-auto! gap-2 px-6`}
        >
          <Plus size={18} aria-hidden="true" />
          New Station
        </Link>
      </PageHeading>

      {metrics ? (
        <div className="mt-10 flex flex-col gap-5">
          <AdminStatsRow metrics={metrics} />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <RevenueTrendChart
              total={metrics.revenueTotal}
              data={metrics.revenueTrend}
            />
            <OrdersTrendChart
              total={metrics.ordersTotal}
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
        <p role="alert" className="text-error mt-10 text-base">
          We couldn&apos;t load your dashboard figures. Please refresh the page.
        </p>
      )}
    </>
  );
}
