"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useTransition } from "react";
import { markSetupCompletionShown } from "@/lib/server/admin/dashboard";
import { dashboardPeriodHref } from "@/lib/helpers/dashboard-period";
import type {
  DashboardMetrics,
  QueryResult,
  SetupStatus,
} from "@/lib/server/admin/types";
import type { MonthYear } from "@/components/admin/ui/MonthYearPill";
import FilterPill from "@/components/admin/ui/FilterPill";
import LoadError from "@/components/admin/ui/LoadError";
import PageHeading from "@/components/admin/ui/PageHeading";
import ProcessingOverlay from "@/components/admin/ui/ProcessingOverlay";
import { primaryPillClass } from "@/components/admin/ui/PillInput";
import { FiguresSkeleton } from "@/components/admin/ui/SupplierSkeletons";
import AdminSetupChecklist from "./AdminSetupChecklist";
import AdminStatsRow from "./AdminStatsRow";
import DashboardTrends from "./DashboardTrends";
import MetricsPeriodPicker from "./MetricsPeriodPicker";
import TopStationsTable from "./TopStationsTable";

interface Props {
  companyName: string;
  setup: SetupStatus;
  metrics: Promise<QueryResult<DashboardMetrics>>;
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function selectPeriod(period: MonthYear) {
    startTransition(() => {
      router.push(dashboardPeriodHref("/dashboard", period), { scroll: false });
    });
  }

  function selectStation(id: string) {
    if (id === "all") return;
    startTransition(() => {
      router.push(dashboardPeriodHref(`/stations/${encodeURIComponent(id)}`, {
        month: searchParams.get("month") ?? undefined,
        year: searchParams.get("year") ?? undefined,
      }));
    });
  }

  const stationOptions = [
    { label: "All Stations", value: "all" },
    ...stations.map((s) => ({ label: s.name, value: s.id })),
  ];

  return (
    <>
      <PageHeading
        title="Dashboard"
        subtitle={`${companyName} · All Stations`}
        subtitleTone="yellow"
      >
        <FilterPill
          label="Stations"
          options={stationOptions}
          value="all"
          onChange={selectStation}
        />
        <MetricsPeriodPicker metrics={metrics} onChange={selectPeriod} />
        <Link
          href="/stations/new"
          className={`${primaryPillClass} w-auto! gap-2 px-6`}
        >
          <Plus size={18} aria-hidden="true" />
          New Station
        </Link>
      </PageHeading>

      <div className="relative flow-root">
        {isPending && <p role="status" className="text-grey-800 absolute top-2 right-0 text-sm">Updating dashboard…</p>}
        <div aria-busy={isPending}>
          <Suspense fallback={<FiguresSkeleton />}>
            <DashboardFigures metrics={metrics} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

function DashboardFigures({ metrics }: Pick<Props, "metrics">) {
  const result = use(metrics);
  if (!result.success) {
    return (
      <LoadError
        title="We couldn't load your dashboard figures"
        message={result.message}
      />
    );
  }

  const figures = result.data;
  return (
    <div className="mt-10 flex flex-col gap-5">
      <AdminStatsRow metrics={figures} />
      <DashboardTrends metrics={figures} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TopStationsTable
          title="Top-performing stations"
          stations={figures.topStations}
        />
        <TopStationsTable
          title="Lowest-performing stations"
          stations={figures.lowestStations}
        />
      </div>
    </div>
  );
}
