"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { ManagerList, type ManagerOption } from "@/components/admin/ui/ManagerPicker";

// Picks a manager for a station (Assign Manager / Reassign Manager).
export default function AssignManagerDialog({
  open,
  onOpenChange,
  title,
  stationName,
  managers,
  currentManagerId,
  isPending,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  stationName: string;
  managers: ManagerOption[];
  currentManagerId: string | null;
  isPending: boolean;
  onSelect: (managerId: string) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[1500] bg-[#D9D9D9]/60 backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-[1500] w-[calc(100%-2rem)] max-w-120 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-lg outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
            <div>
              <Dialog.Title className="text-xl font-medium text-black">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-grey-800 mt-1 text-sm">
                {stationName}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close"
              className="cursor-pointer rounded-md p-1 text-black hover:bg-gray-100"
            >
              <X size={20} />
            </Dialog.Close>
          </div>
          {managers.length === 0 ? (
            <p className="text-grey-800 px-5 py-8 text-center text-sm">
              You don&apos;t have any managers to assign yet. Invite one from the
              Managers page.
            </p>
          ) : (
            <div aria-busy={isPending} className={isPending ? "pointer-events-none opacity-60" : ""}>
              <ManagerList
                managers={managers}
                value={currentManagerId}
                onSelect={onSelect}
              />
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
