import { cn } from "@/lib/utils";

export type BadgeTone = "green" | "yellow" | "blue" | "red" | "grey";

const tones: Record<BadgeTone, string> = {
  green: "bg-green-50 text-green-500",
  yellow: "bg-yellow-100 text-yellow-600",
  blue: "bg-primary-50 text-primary-500",
  red: "bg-red-50 text-error",
  grey: "bg-gray-100 text-black border border-gray-200",
};

export default function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-4 py-1 text-base whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
