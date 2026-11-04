import { cn } from "@/lib/utils";

// The blurred lavender-to-mint glow that sits behind cards in the designs.
export default function SoftGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[70vh] w-[min(52rem,90vw)] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-60 blur-3xl",
        "bg-[linear-gradient(140deg,#B4B6EF_0%,#D6FDEF_100%)]",
        className,
      )}
    />
  );
}
