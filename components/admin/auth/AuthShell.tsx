"use client";

import Logo from "@/components/web/Logo";
import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const panelCopy: Record<string, { title: string; text: string }> = {
  "/register": {
    title: "Fuel your business growth.",
    text: "Join our supplier network to get regular delivery requests, reach thousands of local customers, and keep your fuel deliveries efficient and your business strong.",
  },
};

const defaultCopy = {
  title: "Tired of fuel wahala?",
  text: "You've come to the right place to find an easy, hassle-free way to have fuel delivered straight to your door, keeping your car and generator powered up.",
};

export function AuthFormHeader() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between">
      <Logo />
      <button
        type="button"
        onClick={() => router.back()}
        className="flex h-14 cursor-pointer items-center gap-3 rounded-full bg-gray-100 px-5 text-lg text-black hover:bg-gray-200"
      >
        <ChevronLeft size={20} aria-hidden="true" />
        Back
      </button>
    </div>
  );
}

export function AuthPanel() {
  const pathname = usePathname();
  const copy = panelCopy[pathname] ?? defaultCopy;

  return (
    <aside className="relative hidden w-1/2 overflow-hidden border-l border-gray-100 bg-[linear-gradient(140deg,#D6FDEF_0%,#C8D9F1_45%,#B4B6EF_100%)] md:flex md:items-center">
      {/* Placed as in the design: the 1065×828 ripples image at full size on
          the 720px-wide panel, ring centre 466.5px from the left and 182px
          from the top. Sizes are in % of panel width (margin-top % is also
          width-based), so it scales with the panel on other screens. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-[-9.1%] mt-[-32.2%] aspect-[1065/828] w-[147.9%] bg-[url('/images/admin/auth-ripples.png')] bg-contain bg-no-repeat"
      />
      <div className="relative px-10 lg:px-25">
        <p className="text-primary-400 mb-3 text-base font-medium">FuelTap</p>
        <h2 className="text-4xl leading-tight text-black lg:text-[3.25rem]">
          {copy.title}
        </h2>
        <p className="mt-4 max-w-lg text-base leading-snug text-black lg:text-lg">
          {copy.text}
        </p>
      </div>
    </aside>
  );
}
