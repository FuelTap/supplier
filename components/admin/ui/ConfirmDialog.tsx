"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  children: React.ReactNode;
  // Optional grey box with extra context, shown under the description.
  note?: React.ReactNode;
} & (
  | {
      // The action can't go ahead; only an "Okay" button is shown.
      variant: "blocked";
    }
  | {
      variant: "confirm";
      cancelLabel: string;
      confirmLabel: string;
      onConfirm: () => void;
      isPending?: boolean;
    }
);

const pillClass =
  "flex h-14 flex-1 cursor-pointer items-center justify-center rounded-full px-4 text-base font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

// The yellow ⓘ confirmation used by every station and manager action.
export default function ConfirmDialog(props: Props) {
  const { open, onOpenChange, title, children, note } = props;

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-[1500] bg-[#D9D9D9]/60 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-[1500] flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-128 -translate-x-1/2 -translate-y-1/2 flex-col items-center overflow-y-auto rounded-[2rem] bg-white px-6 py-12 text-center shadow-lg outline-none transition-all duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 md:px-8">
          <Info
            aria-hidden="true"
            className="size-22 text-yellow-600"
            strokeWidth={1.75}
          />
          <AlertDialog.Title className="font-pjs mt-6 text-2xl font-semibold text-black md:text-3xl">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description
            render={<div />}
            className="text-grey-800 mt-2 text-sm leading-snug md:text-base"
          >
            {children}
          </AlertDialog.Description>

          {note && (
            <div className="mt-2 w-full rounded-xl border border-gray-100 bg-gray-100 p-4 text-left text-xs leading-snug text-black">
              <p className="text-primary-500 mb-2 flex items-center gap-1.5 text-sm font-medium">
                <Info size={16} aria-hidden="true" />
                Note
              </p>
              {note}
            </div>
          )}

          <div className="mt-8 flex w-full max-w-97 gap-4">
            {props.variant === "blocked" ? (
              <AlertDialog.Close
                className={cn(
                  pillClass,
                  "bg-primary-500 hover:bg-primary-500/90 text-white",
                )}
              >
                Okay
              </AlertDialog.Close>
            ) : (
              <>
                <AlertDialog.Close
                  disabled={props.isPending}
                  className={cn(
                    pillClass,
                    "border-primary-500 text-primary-500 hover:bg-primary-50 border bg-white",
                  )}
                >
                  {props.cancelLabel}
                </AlertDialog.Close>
                <button
                  type="button"
                  onClick={props.onConfirm}
                  disabled={props.isPending}
                  className={cn(
                    pillClass,
                    "bg-primary-500 hover:bg-primary-500/90 text-white",
                  )}
                >
                  {props.isPending ? "Please wait…" : props.confirmLabel}
                </button>
              </>
            )}
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
