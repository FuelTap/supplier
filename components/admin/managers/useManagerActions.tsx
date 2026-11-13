"use client";

import { RotateCcw, Send, Trash2, UserX, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  cancelManagerInvite,
  deleteManager,
  reactivateManager,
  resendManagerInvite,
  suspendManager,
} from "@/lib/server/admin/managers";
import type { ActionResult, ManagerView } from "@/lib/server/admin/types";
import type { MenuAction } from "@/components/admin/ui/ActionsMenu";
import { adminToast } from "@/components/admin/ui/AdminToaster";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";

type DialogKind =
  | "cancel-invite"
  | "suspend"
  | "suspend-blocked"
  | "delete"
  | "delete-blocked"
  | "reactivate";

type Dialog = { kind: DialogKind; manager: ManagerView };

const strong = (text: string) => (
  <strong className="font-semibold text-black">{text}</strong>
);

export function useManagerActions() {
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(
    action: () => Promise<ActionResult>,
    blockedKind?: DialogKind,
  ) {
    const manager = dialog?.manager;
    startTransition(async () => {
      try {
        const result = await action();
        if (result.success) {
          adminToast.add({ description: result.message });
          setDialog(null);
          router.refresh();
        } else if (result.blocked && blockedKind && manager) {
          setDialog({ kind: blockedKind, manager });
        } else {
          adminToast.add({ description: result.message, type: "error" });
        }
      } catch {
        adminToast.add({
          description: "Please check your connection and try again.",
          type: "error",
        });
      }
    });
  }

  function actionsFor(manager: ManagerView): MenuAction[] {
    const open = (kind: DialogKind) => () => setDialog({ kind, manager });
    const blocked = manager.outstandingOrders > 0;
    const remove: MenuAction = {
      label: "Delete Manager",
      icon: <Trash2 />,
      destructive: true,
      onSelect: open(blocked ? "delete-blocked" : "delete"),
    };

    if (manager.status === "pending") {
      return [
        {
          label: "Resend Invite",
          icon: <Send />,
          onSelect: () => run(() => resendManagerInvite(manager.id)),
        },
        { label: "Cancel Invite", icon: <X />, onSelect: open("cancel-invite") },
      ];
    }
    if (manager.status === "inactive") {
      return [
        {
          label: "Reactivate Manager",
          icon: <RotateCcw />,
          onSelect: open("reactivate"),
        },
        remove,
      ];
    }
    return [
      {
        label: "Suspend Manager",
        icon: <UserX />,
        onSelect: open(blocked ? "suspend-blocked" : "suspend"),
      },
      remove,
    ];
  }

  const close = (open: boolean) => {
    if (!open && !isPending) setDialog(null);
  };
  const is = (kind: DialogKind) => dialog?.kind === kind;
  const name = dialog?.manager.name ?? "";
  const stationName = dialog?.manager.station?.name;

  const dialogs = (
    <>
      <ConfirmDialog
        variant="confirm"
        open={is("cancel-invite")}
        onOpenChange={close}
        title="Cancel the invitation?"
        cancelLabel="Keep Invitation"
        confirmLabel="Cancel Invitation"
        isPending={isPending}
        onConfirm={() =>
          dialog && run(() => cancelManagerInvite(dialog.manager.id))
        }
      >
        The invited manager will no longer be able to accept this invitation or
        access FuelTap through it. You can invite them again later.
      </ConfirmDialog>

      <ConfirmDialog
        variant="blocked"
        open={is("suspend-blocked")}
        onOpenChange={close}
        title="You can't suspend this manager now."
      >
        {strong(name)} has pending orders that need attention. Please complete
        these orders or reassign them to another manager before suspending the
        account.
      </ConfirmDialog>

      <ConfirmDialog
        variant="confirm"
        open={is("suspend")}
        onOpenChange={close}
        title="Suspend Manager?"
        cancelLabel="Keep Manager Active"
        confirmLabel="Suspend Manager"
        isPending={isPending}
        onConfirm={() =>
          dialog &&
          run(() => suspendManager(dialog.manager.id), "suspend-blocked")
        }
        note={
          stationName ? (
            <>
              <p>
                Manager&apos;s assigned station will remain active, but it will
                need another manager to oversee its operations.
              </p>
              <p className="mt-2">
                If the station remains unassigned for{" "}
                <strong className="font-semibold">3 hours</strong>, it will
                automatically become{" "}
                <strong className="font-semibold">inactive</strong> and will no
                longer be visible to customers.
              </p>
            </>
          ) : undefined
        }
      >
        {strong(name)} will no longer be able to access their FuelTap account
        until you reactivate them.
      </ConfirmDialog>

      <ConfirmDialog
        variant="blocked"
        open={is("delete-blocked")}
        onOpenChange={close}
        title="You can't delete this manager now."
      >
        {strong(name)}&apos;s station has outstanding orders that need
        attention. Please complete these orders or reassign them to another
        manager before deleting this manager.
      </ConfirmDialog>

      <ConfirmDialog
        variant="confirm"
        open={is("delete")}
        onOpenChange={close}
        title={`Delete ${name}?`}
        cancelLabel="Keep Manager"
        confirmLabel="Delete Manager"
        isPending={isPending}
        onConfirm={() =>
          dialog && run(() => deleteManager(dialog.manager.id), "delete-blocked")
        }
        note={
          stationName ? (
            <>
              <p>
                Their assigned station, {strong(stationName)}, will remain active
                but will need another manager. If it remains unassigned for 3
                hours, it will automatically become inactive and no longer be
                visible to customers.
              </p>
              <p className="mt-2">This action cannot be undone.</p>
            </>
          ) : undefined
        }
      >
        {stationName
          ? "Deleting this manager will permanently remove their access to FuelTap."
          : "Deleting this manager will permanently remove their access to FuelTap. This action cannot be undone."}
      </ConfirmDialog>

      <ConfirmDialog
        variant="confirm"
        open={is("reactivate")}
        onOpenChange={close}
        title={`Reactivate ${name}?`}
        cancelLabel="Keep Suspended"
        confirmLabel="Reactivate Manager"
        isPending={isPending}
        onConfirm={() =>
          dialog && run(() => reactivateManager(dialog.manager.id))
        }
      >
        {strong(name)} will regain access to their FuelTap account and their
        previously assigned station.
      </ConfirmDialog>
    </>
  );

  return { actionsFor, dialogs };
}
