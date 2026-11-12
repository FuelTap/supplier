"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import LoadError from "@/components/admin/ui/LoadError";

// Catches anything a page or layout throws, e.g. when the signed-in account
// can't be loaded. Server error messages are hidden in production, so the copy
// here stays generic.
export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F8F9FB]">
      <LoadError
        title="Something went wrong"
        message="We couldn't load your FuelTap account. Please check your connection and try again."
        onRetry={retry}
      />
    </main>
  );
}
