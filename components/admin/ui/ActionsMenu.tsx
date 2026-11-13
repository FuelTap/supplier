"use client";

import { Menu } from "@base-ui/react/menu";
import { cn } from "@/lib/utils";
import { GripHorizontal } from "lucide-react";

export type MenuAction = {
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
  destructive?: boolean;
};

interface Props {
  actions: MenuAction[];
  label: string;
  // "row" is the plain dots in a table row; "button" is the round blue button
  // on the station detail page.
  trigger?: "row" | "button";
}

export default function ActionsMenu({ actions, label, trigger = "row" }: Props) {
  if (actions.length === 0) return null;

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={label}
        className={cn(
          "flex cursor-pointer items-center justify-center",
          trigger === "row"
            ? "size-9 rounded-lg text-black hover:bg-gray-100"
            : "bg-primary-500 hover:bg-primary-500/90 size-12 rounded-full text-white",
        )}
      >
        <GripHorizontal size={trigger === "row" ? 22 : 18} strokeWidth={3} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={6} className="z-[1400]">
          <Menu.Popup className="w-52 overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] outline-none data-ending-style:opacity-0 data-starting-style:opacity-0">
            <Menu.Group>
              <Menu.GroupLabel className="text-grey-800 border-b border-gray-100 px-4 py-2.5 text-xs">
                Actions
              </Menu.GroupLabel>
              {actions.map((action) => (
                <Menu.Item
                  key={action.label}
                  onClick={action.onSelect}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-3.5 text-sm outline-none last:border-b-0 data-highlighted:bg-gray-100",
                    action.destructive ? "text-error" : "text-black",
                  )}
                >
                  <span aria-hidden="true" className="[&_svg]:size-4">
                    {action.icon}
                  </span>
                  {action.label}
                </Menu.Item>
              ))}
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
