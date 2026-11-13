"use client";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

// The ! modifiers override the unlayered global `input` styles in globals.css.
export const pillInputClass =
  "h-12.5! w-full rounded-full! border! border-gray-200! bg-white! px-5! text-base! text-black! outline-none placeholder:text-grey-800! focus-visible:border-primary-400! focus-visible:ring-4 focus-visible:ring-primary-50 disabled:bg-gray-100! disabled:text-grey-800! aria-invalid:border-error!";

export function PillInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return <input className={cn(pillInputClass, className)} {...props} />;
}

export function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cn(pillInputClass, "pr-14!", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-5 -translate-y-1/2 cursor-pointer text-black"
      >
        {visible ? <Eye size={20} /> : <EyeOff size={20} />}
      </button>
    </div>
  );
}

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-base text-black">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

export const primaryPillClass =
  "bg-primary-500 hover:bg-primary-500/90 flex h-12 w-full cursor-pointer items-center justify-center rounded-full text-base font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-primary-400/40";

export const outlinePillClass =
  "border-primary-500 text-primary-500 hover:bg-primary-50 flex h-12 w-full cursor-pointer items-center justify-center rounded-full border bg-white text-base font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
