"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Admin pages use their own toast manager so they can match the design's dark,
// top-right banner without changing the customer-facing toasts.
export const adminToast = ToastPrimitive.createToastManager();

function AdminToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((item) => (
    <ToastPrimitive.Root
      key={item.id}
      toast={item}
      className={cn(
        "absolute top-0 right-0 w-full rounded-xl bg-black text-white shadow-lg transition-all duration-300",
        "[transform:translateY(calc(var(--toast-index)*0.75rem))] data-starting-style:-translate-y-4 data-starting-style:opacity-0 data-ending-style:opacity-0",
      )}
    >
      <ToastPrimitive.Content className="flex items-center gap-3 p-4">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            item.type === "error" ? "bg-error" : "bg-green-500",
          )}
        >
          {item.type === "error" ? <X size={20} /> : <Check size={20} />}
        </span>
        <div className="min-w-0 flex-1">
          <ToastPrimitive.Title className="text-sm font-medium" />
          <ToastPrimitive.Description className="text-sm leading-snug" />
        </div>
        <ToastPrimitive.Close
          aria-label="Dismiss"
          className="shrink-0 cursor-pointer rounded p-1 text-white/70 hover:text-white"
        >
          <X size={16} />
        </ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  ));
}

export default function AdminToaster() {
  return (
    <ToastPrimitive.Provider toastManager={adminToast} timeout={5000}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed top-20 right-4 z-[2000] w-[calc(100%-2rem)] max-w-106 md:top-28 md:right-16">
          <AdminToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
