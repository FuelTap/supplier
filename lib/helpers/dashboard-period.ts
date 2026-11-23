export function dashboardPeriodHref(
  pathname: string,
  period: { month?: string | number; year?: string | number },
) {
  const query = new URLSearchParams();
  if (period.month !== undefined) query.set("month", String(period.month));
  if (period.year !== undefined) query.set("year", String(period.year));
  return query.size ? `${pathname}?${query}` : pathname;
}

export function lagosCalendarDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).formatToParts(date);

  return {
    day: Number(parts.find((part) => part.type === "day")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    year: Number(parts.find((part) => part.type === "year")?.value),
  };
}
