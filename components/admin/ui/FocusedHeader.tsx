"use client";

import Logo from "@/components/web/Logo";
import { cn } from "@/lib/utils";
import { Headphones, X } from "lucide-react";
import Link from "next/link";

interface Props {
  // 0–100; the yellow line under the header.
  progress: number;
  // "cancel" shows "Cancel ✕"; "back" shows "Back".
  action: "cancel" | "back";
  onAction: () => void;
  showHelp?: boolean;
}

// Header for single-task pages (KYB, invite manager, add station): logo,
// one exit action and a progress line instead of the main navigation.
export default function FocusedHeader({
  progress,
  action,
  onAction,
  showHelp = false,
}: Props) {
  return (
    <header className="relative w-full bg-[linear-gradient(90deg,#E4E5FD_0%,#ECF4F8_50%,#E7F8F2_100%)]">
      <div className="container flex h-19 items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-6">
          {showHelp && (
            <Link
              href="/support"
              className="flex items-center gap-2 text-base text-black hover:underline"
            >
              <Headphones size={20} aria-hidden="true" />
              Help?
            </Link>
          )}
          <button
            type="button"
            onClick={onAction}
            className="border-primary-500 text-primary-500 hover:bg-primary-50 flex h-11 cursor-pointer items-center gap-3 rounded-full border bg-white/40 px-5 text-base"
          >
            {action === "cancel" ? "Cancel" : "Back"}
            {action === "cancel" && <X size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Progress"
        className="h-1 w-full bg-gray-200"
      >
        <div
          className={cn("h-full bg-[#FFC300] transition-[width] duration-500")}
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
