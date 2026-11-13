import { connection } from "next/server";
import { Suspense } from "react";
import LoadError from "@/components/admin/ui/LoadError";
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
  // Account data is per request, so it's read at request time, not build time.
  await connection();
  const result = await getInventory();
  if (!result.success) return <LoadError message={result.message} />;
  return <InventoryTable inventory={result.data} />;
}
