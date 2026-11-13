"use client";
import Link from "next/link";
import DateRangePill, { DateRange } from "../admin/ui/DateRangePill";
import PageHeading from "../admin/ui/PageHeading";
import { primaryPillClass } from "../admin/ui/PillInput";
import { useState } from "react";
import { Plus } from "lucide-react";
import StatSection from "./StatSection";
import RecentSection from "./RecentSection";

const ManagerDashboard = ({ empty = false }: { empty?: boolean }) => {
  const [range, setRange] = useState<DateRange>({ from: "", to: "" });
  return (
    <>
      <PageHeading
        title="Dashboard"
        subtitle={`Total Energies - Lekki Phase 1`}
        subtitleTone="yellow"
      >
        <DateRangePill value={range} onChange={setRange} />
        <Link
          href="/sub/inventory?add=true"
          className={`${primaryPillClass} w-auto! gap-2 px-6`}
        >
          <Plus size={18} aria-hidden="true" />
          Add Product
        </Link>
      </PageHeading>

      <StatSection empty={empty} />
      <RecentSection empty={empty} />
    </>
  );
};

export default ManagerDashboard;
