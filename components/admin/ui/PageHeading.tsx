export default function PageHeading({
  title,
  subtitle,
  subtitleTone = "grey",
  children,
}: {
  title: string;
  subtitle: React.ReactNode;
  subtitleTone?: "grey" | "yellow";
  // Controls shown on the right (filters, primary button).
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="font-pjs text-3xl font-semibold text-blue-600 md:text-[40px] md:leading-tight">
          {title}
        </h1>
        <p
          className={
            subtitleTone === "yellow"
              ? "text-secondary-500 mt-1 text-lg font-medium"
              : "text-grey-800 mt-1 text-base md:text-lg"
          }
        >
          {subtitle}
        </p>
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      )}
    </div>
  );
}
