"use client";

import { useScrollLock } from "@/hooks/useScrollLock";

// Blocks the page with the design's dark "Processing…" card while a step
// finishes.
export default function ProcessingOverlay({ label = "Processing…" }) {
  useScrollLock(true);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[1600] flex items-start justify-center bg-[#D9D9D9]/60 px-4 pt-[30vh] backdrop-blur-sm"
    >
      <div className="flex w-full max-w-140 flex-col items-center gap-6 rounded-[2rem] bg-[linear-gradient(90deg,#061337_0%,#1E3A8A_100%)] px-6 py-10 text-white shadow-xl">
        <span aria-hidden="true" className="relative flex size-24 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-yellow-600/60" />
          <span className="absolute inset-2.5 animate-ping rounded-full border border-yellow-600/50" />
          <span className="size-14 rounded-full border-4 border-yellow-600/60 bg-[#FFC300]" />
        </span>
        <p className="font-pjs text-2xl font-medium md:text-3xl">{label}</p>
      </div>
    </div>
  );
}
