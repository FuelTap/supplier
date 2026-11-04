import EmptyIllustration from "@/components/admin/ui/EmptyIllustration";
import { formatNairaCompact } from "@/components/admin/ui/format";

// Ranked list of stations by revenue (top- or lowest-performing).
export default function TopStationsTable({
  title,
  stations,
}: {
  title: string;
  stations: { name: string; revenue: number }[];
}) {
  const isEmpty = stations.length === 0;
  const rows = isEmpty
    ? Array.from({ length: 5 }, () => null)
    : stations.slice(0, 5);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <h2 className="border-b border-gray-100 px-8 py-8 text-xl text-black">
        {title}
      </h2>
      <ul>
        {rows.map((station, i) => (
          <li
            key={station ? `${station.name}-${i}` : i}
            className="flex h-14.5 items-center justify-between px-8 text-base text-black odd:bg-[#EEF0FC] even:bg-white"
          >
            {station ? (
              <>
                <span>{station.name}</span>
                <span>{formatNairaCompact(station.revenue)}</span>
              </>
            ) : (
              <>
                <span className="text-neutra-600" aria-hidden="true">
                  ------
                </span>
                <span className="text-neutra-600" aria-hidden="true">
                  ------
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
      {isEmpty && (
        <>
          <p className="sr-only">No station data yet.</p>
          <EmptyIllustration className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </>
      )}
    </section>
  );
}
