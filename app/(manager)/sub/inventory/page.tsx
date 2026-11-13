import type { Metadata } from "next";
import { Suspense } from "react";
import StationInventory from "@/components/substation/StationInventory";

export const metadata: Metadata = { title: "Inventory | FuelTap" };

export default function InventoryPage() {
  return (
    <Suspense>
      <StationInventory />
    </Suspense>
  );
}
