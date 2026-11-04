// Money and date formatting shared by the admin pages.

const nairaCompact = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const nairaWhole = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

// "₦980K", "₦4.8M"
export const formatNairaCompact = (value: number) => nairaCompact.format(value);

// "₦2,004,975"
export const formatNaira = (value: number) => nairaWhole.format(value);

export const formatCount = (value: number) => value.toLocaleString("en-NG");

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Lagos",
});

const timeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Africa/Lagos",
});

function ordinal(day: number) {
  if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
  return `${day}${["th", "st", "nd", "rd"][day % 10] ?? "th"}`;
}

// { date: "4th Oct, 2026", time: "10:42 AM" }
export function formatDateTime(iso: string) {
  const parts = Object.fromEntries(
    dateFormat.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  return {
    date: `${ordinal(Number(parts.day))} ${parts.month}, ${parts.year}`,
    time: timeFormat.format(new Date(iso)),
  };
}

// "2 hours ago", "3 days ago"
export function formatRelative(iso: string | null, now: number) {
  if (!iso) return "—";
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
