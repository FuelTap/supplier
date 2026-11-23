import { cn } from "@/lib/utils";
import PageHeading from "./PageHeading";

export function Skeleton({ className }: { className: string }) {
  return <span aria-hidden="true" className={cn("block rounded-md bg-[#E7EAF3] motion-safe:animate-pulse", className)} />;
}

export function PeriodSkeleton() {
  return <Skeleton className="h-12 w-36 rounded-full sm:w-52" />;
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-xl border border-gray-100 bg-white">
          <div className="border-b border-gray-100 px-4 py-3 md:px-5">
            <Skeleton className="h-4 w-24 max-w-full" />
          </div>
          <div className="space-y-3 px-4 pt-4 pb-3 md:px-5">
            <Skeleton className="h-6 w-20 max-w-full md:h-8" />
            <div className="flex justify-between gap-3">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FiguresSkeleton({ station = false }: { station?: boolean }) {
  return (
    <div role="status" aria-label={station ? "Loading station figures" : "Loading dashboard figures"} className="mt-10 flex flex-col gap-5">
      <StatsSkeleton />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {[0, 1].map((index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-6 sm:px-8">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
              {station && <Skeleton className="h-12 w-32 rounded-full" />}
            </div>
            <div aria-hidden="true" className="flex h-60 flex-col justify-between px-4 py-5 sm:px-8">
              <Skeleton className="h-3 w-40 max-w-full" />
              {[0, 1, 2, 3].map((line) => <span key={line} className="border-b border-gray-100" />)}
              <Skeleton className="mx-auto h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <PageHeading title="Dashboard" subtitle={<Skeleton className="h-5 w-44" />}>
        <Skeleton className="h-12 w-36 rounded-full" />
        <PeriodSkeleton />
        <Skeleton className="h-12 w-36 rounded-full" />
      </PageHeading>
      <FiguresSkeleton />
    </>
  );
}

export function StationsListSkeleton() {
  return (
    <div role="status" aria-label="Loading stations">
      <div className="mt-10"><StatsSkeleton /></div>
      <div className="mt-8 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Skeleton className="h-12 w-full max-w-md rounded-full" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-12 w-36 rounded-full" />
          <Skeleton className="h-12 w-32 rounded-full" />
          <Skeleton className="h-12 w-36 rounded-full" />
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="grid grid-cols-3 gap-4 border-b border-gray-100 px-5 py-5 last:border-b-0 md:grid-cols-7">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="hidden h-4 w-full md:block" />
            <Skeleton className="hidden h-4 w-3/4 md:block" />
            <Skeleton className="hidden h-4 w-3/4 md:block" />
            <Skeleton className="hidden h-4 w-1/2 md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StationDetailSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col items-start gap-4 md:flex-row md:gap-5">
          <Skeleton className="h-11 w-24 shrink-0 rounded-full" />
          <div className="min-w-0 max-w-full space-y-2">
            <Skeleton className="h-7 w-56 max-w-full md:w-64" />
            <Skeleton className="h-5 w-72 max-w-full md:w-80" />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 md:gap-5">
          <PeriodSkeleton />
          <div className="flex items-center gap-3 md:gap-5">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="size-12 rounded-full" />
          </div>
        </div>
      </div>
      <FiguresSkeleton station />
    </>
  );
}

export function SupplierLayoutSkeleton() {
  return (
    <div role="status" aria-label="Loading supplier workspace">
      <div className="border-b border-gray-100 bg-white md:fixed md:inset-x-0 md:top-0 md:z-10">
        <div className="container flex items-center justify-between gap-4 py-3 xl:py-4">
          <Skeleton className="size-6 xl:hidden" />
          <Skeleton className="h-12 w-28" />
          <div className="hidden items-center gap-6 xl:flex">
            {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-4 w-17" />)}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="hidden h-8 w-32 md:block" />
            <Skeleton className="size-11 rounded-full" />
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="container pt-8 pb-16 md:pt-30">
        <Skeleton className="h-9 w-40 md:h-12" />
        <Skeleton className="mt-2 h-5 w-52" />
        <div className="mt-10"><StatsSkeleton /></div>
      </div>
    </div>
  );
}
