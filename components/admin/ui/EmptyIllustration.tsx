import { cn } from "@/lib/utils";
import { Fuel } from "lucide-react";

// The small "dashboard card with a fuel pump" graphic from the empty states.
export default function EmptyIllustration({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative h-37 w-40 overflow-hidden rounded-md bg-white p-3 shadow-xs",
        className,
      )}
    >
      <div className="mb-1 h-1.5 w-8 rounded bg-gray-200" />
      <div className="h-1.5 w-12 rounded bg-gray-100" />
      <div className="bg-primary-50 absolute top-8 left-8 h-16 w-24 rounded-md" />
      <div className="border-primary-400/40 absolute top-5 left-17 h-14 w-12 rounded-sm border border-dashed" />
      <div className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow">
        <Fuel className="text-primary-500" size={22} />
      </div>
      <div className="absolute bottom-3 left-3 h-1.5 w-8 rounded bg-gray-200" />
      <div className="absolute right-3 bottom-2.5 h-3 w-12 rounded-full bg-[linear-gradient(90deg,#0EA774_0%,#D6FDEF_100%)]" />
    </div>
  );
}
