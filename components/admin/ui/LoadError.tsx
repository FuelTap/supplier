"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import EmptyIllustration from "./EmptyIllustration";
import { outlinePillClass, primaryPillClass } from "./PillInput";

// Shown in place of a page whose data couldn't be loaded, so a failed request
// never looks like an empty account.
export default function LoadError({
  title = "We couldn't load this page",
  message,
  onRetry,
  backHref,
}: {
  title?: string;
  message: string;
  // Defaults to re-fetching the page's server data.
  onRetry?: () => void;
  backHref?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      role="alert"
      className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center"
    >
      <EmptyIllustration />
      <h1 className="font-pjs mt-6 text-2xl font-semibold text-black">{title}</h1>
      <p className="text-grey-800 mt-2 text-base leading-snug">{message}</p>
      <div className="mt-8 flex w-full max-w-80 flex-col gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            onRetry ? onRetry() : startTransition(() => router.refresh())
          }
          className={primaryPillClass}
        >
          {isPending ? "Retrying…" : "Try Again"}
        </button>
        {backHref && (
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className={outlinePillClass}
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}
