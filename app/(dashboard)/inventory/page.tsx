import { connection } from "next/server";
import { Suspense } from "react";
import PageLoading from "@/components/admin/ui/PageLoading";
import { Metadata } from "next";
import InventoryTable from "@/components/admin/inventory/InventoryTable";
import { getInventory } from "@/lib/server/admin/inventory";

export const metadata: Metadata = { title: "Inventory | FuelTap Supplier" };

export default function InventoryPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <InventoryContent />
    </Suspense>
  );
}

async function InventoryContent() {
  // Mock data lives in memory, so read it per request rather than at build time.
  await connection();
  const result = await getInventory();
  return <InventoryTable inventory={result.success ? result.data : []} />;
}
