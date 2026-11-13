"use client";

import { Eye, Power, PowerOff, UserRoundPen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  assignStationManager,
  deactivateStation,
  reactivateStation,
} from "@/lib/server/admin/stations";
import type { ActionResult, StationView } from "@/lib/server/admin/types";
import type { MenuAction } from "@/components/admin/ui/ActionsMenu";
import { adminToast } from "@/components/admin/ui/AdminToaster";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import type { ManagerOption } from "@/components/admin/ui/ManagerPicker";
import AssignManagerDialog from "./AssignManagerDialog";

type Dialog =
  | { kind: "deactivate-blocked"; station: StationView }
  | { kind: "deactivate"; station: StationView }
  | { kind: "reactivate"; station: StationView }
  | { kind: "assign"; station: StationView };

// Row/detail actions for a station, plus the dialogs they open. Used by both
// the stations list and the station detail page so the rules stay identical.
export function useStationActions(managers: ManagerOption[]) {
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>, onBlocked?: () => void) {
    startTransition(async () => {
      try {
        const result = await action();
        if (result.success) {
          adminToast.add({ description: result.message });
          setDialog(null);
          router.refresh();
        } else if (result.blocked && onBlocked) {
          onBlocked();
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

  function actionsFor(
    station: StationView,
    { includeView = true } = {},
  ): MenuAction[] {
    const view: MenuAction = {
      label: "View Station",
      icon: <Eye />,
      onSelect: () => router.push(`/stations/${station.id}`),
    };
    const reassign: MenuAction = {
      label: station.manager ? "Reassign Manager" : "Assign Manager",
      icon: <UserRoundPen />,
      onSelect: () => setDialog({ kind: "assign", station }),
    };
    const deactivate: MenuAction = {
      label: "Deactivate",
      icon: <PowerOff />,
      onSelect: () =>
        setDialog({
          kind:
            station.outstandingOrders > 0 ? "deactivate-blocked" : "deactivate",
          station,
        }),
    };
    const activate: MenuAction = {
      label: "Activate",
      icon: <Power />,
      onSelect: () => setDialog({ kind: "reactivate", station }),
    };

    let actions: MenuAction[];
    if (station.deactivated) actions = [view, reassign, activate];
    else if (!station.manager) actions = [reassign, deactivate];
    // Waiting for the invited manager to accept.
    else if (station.manager.status === "pending") actions = [deactivate];
    else actions = [view, reassign, deactivate];

    return includeView ? actions : actions.filter((a) => a !== view);
  }

  const close = (open: boolean) => {
    if (!open && !isPending) setDialog(null);
  };

  const dialogs = (
    <>
      <ConfirmDialog
        variant="blocked"
        open={dialog?.kind === "deactivate-blocked"}
        onOpenChange={close}
        title="You can't deactivate this station now"
      >
        This station has outstanding orders that need attention. Please complete
        these orders or reassign them to another manager before deactivating
        the station.
      </ConfirmDialog>

      <ConfirmDialog
        variant="confirm"
        open={dialog?.kind === "deactivate"}
        onOpenChange={close}
        title="Deactivate this station?"
        cancelLabel="Keep Active"
        confirmLabel="Deactivate Station"
        isPending={isPending}
        onConfirm={() => {
          if (dialog?.kind !== "deactivate") return;
          const { station } = dialog;
          run(
            () => deactivateStation(station.id),
            () => setDialog({ kind: "deactivate-blocked", station }),
          );
        }}
      >
        This station will stop receiving orders and will no longer be visible
        to customers until you reactivate it.
      </ConfirmDialog>

      <ConfirmDialog
        variant="confirm"
        open={dialog?.kind === "reactivate"}
        onOpenChange={close}
        title="Reactivate this station?"
        cancelLabel="Keep Inactive"
        confirmLabel="Reactivate Station"
        isPending={isPending}
        onConfirm={() => {
          if (dialog?.kind !== "reactivate") return;
          const { station } = dialog;
          run(() => reactivateStation(station.id));
        }}
      >
        This station will become active again and be visible to customers.
      </ConfirmDialog>

      <AssignManagerDialog
        open={dialog?.kind === "assign"}
        onOpenChange={close}
        title={
          dialog?.kind === "assign" && dialog.station.manager
            ? "Reassign Manager"
            : "Assign Manager"
        }
        stationName={dialog?.kind === "assign" ? dialog.station.name : ""}
        managers={managers}
        currentManagerId={
          dialog?.kind === "assign" ? (dialog.station.manager?.id ?? null) : null
        }
        isPending={isPending}
        onSelect={(managerId) => {
          if (dialog?.kind !== "assign") return;
          const { station } = dialog;
          if (managerId === station.manager?.id) {
            setDialog(null);
            return;
          }
          run(() => assignStationManager(station.id, managerId));
        }}
      />
    </>
  );

  return { actionsFor, dialogs };
}
