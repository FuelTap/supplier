"use client";

import { Suspense, use } from "react";
import MonthYearPill, { type MonthYear } from "@/components/admin/ui/MonthYearPill";
import { PeriodSkeleton } from "@/components/admin/ui/SupplierSkeletons";
import type { QueryResult } from "@/lib/server/admin/types";

type Props = {
  metrics: Promise<QueryResult<{ period: MonthYear }>>;
  onChange: (period: MonthYear) => void;
};

export default function MetricsPeriodPicker(props: Props) {
  return (
    <Suspense fallback={<PeriodSkeleton />}>
      <PeriodPicker {...props} />
    </Suspense>
  );
}

function PeriodPicker({ metrics, onChange }: Props) {
  const result = use(metrics);
  return <MonthYearPill value={result.success ? result.data.period : null} onChange={onChange} />;
}
