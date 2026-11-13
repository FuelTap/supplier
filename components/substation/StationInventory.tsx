"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { MoreHorizontal, Plus } from "lucide-react";
import PageHeading from "@/components/admin/ui/PageHeading";
import {
  PillInput,
  outlinePillClass,
  primaryPillClass,
} from "@/components/admin/ui/PillInput";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { adminToast } from "@/components/admin/ui/AdminToaster";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const fuels = {
  Petrol: { code: "PMS", unit: "litre", image: "/images/petrol.png" },
  Diesel: { code: "AGO", unit: "litre", image: "/images/Diesel.png" },
  "Cooking Gas": { code: "LPG", unit: "kg", image: "/images/Gas cylinder.png" },
} as const;
type FuelType = keyof typeof fuels;
type Product = {
  id: string;
  fuel: FuelType;
  price: number;
  enabled: boolean;
  updated: string;
};
type Action = { type: "remove" | "toggle"; product: Product };

// Preview state only. Wire station-scoped server operations once the manager API is available.
export default function StationInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const adding = searchParams.get("add") === "true";

  function closeEditor() {
    setEditing(null);
    if (adding) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("add");
      router.replace(`/sub/inventory${params.size ? `?${params}` : ""}`, {
        scroll: false,
      });
    }
  }

  function save(fuel: FuelType, price: number) {
    const updated = new Date().toISOString();
    setProducts((current) =>
      editing
        ? current.map((product) =>
            product.id === editing.id
              ? { ...product, price, updated }
              : product,
          )
        : [
            ...current,
            { id: crypto.randomUUID(), fuel, price, enabled: true, updated },
          ],
    );
    adminToast.add({
      description: editing
        ? "Price updated in this preview."
        : "Product added to this preview.",
      type: "success",
    });
    closeEditor();
  }

  function confirmAction() {
    if (!action) return;
    const { product, type } = action;
    setProducts((current) =>
      type === "remove"
        ? current.filter((item) => item.id !== product.id)
        : current.map((item) =>
            item.id === product.id ? { ...item, enabled: !item.enabled } : item,
          ),
    );
    adminToast.add({
      description:
        type === "remove"
          ? "Product removed from this preview."
          : `Product ${product.enabled ? "disabled" : "enabled"} in this preview.`,
      type: "success",
    });
    setAction(null);
  }

  return (
    <>
      <PageHeading
        title="Inventory"
        subtitle="Manage your inventory and update your price."
      >
        <Link
          href="/sub/inventory?add=true"
          className={cn(primaryPillClass, "w-auto! gap-2 px-6")}
        >
          <Plus size={18} aria-hidden="true" /> Add Product
        </Link>
      </PageHeading>
      <p className="text-grey-800 mt-3 text-xs">
        Preview only. Changes stay on this page and do not update your station.
      </p>
      {products.length === 0 ? (
        <div className="flex min-h-110 flex-col items-center justify-center py-16 text-center">
          <Image
            src="/empty.png"
            alt=""
            width={160}
            height={160}
            className="mb-5 h-auto object-contain"
          />
          <h2 className="text-lg font-medium text-black">
            No inventory added yet
          </h2>
          <p className="text-grey-800 mt-2 max-w-120 text-sm">
            You haven’t added any products to this station. Add your available
            fuel products to start managing availability, and keep your
            inventory up to date.
          </p>
          <Link
            href="/sub/inventory?add=true"
            className={cn(primaryPillClass, "mt-5 w-auto! gap-2 px-6")}
          >
            <Plus size={16} aria-hidden="true" /> Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const fuel = fuels[product.fuel];
            return (
              <article
                key={product.id}
                className="rounded-2xl border border-gray-200 bg-white"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={fuel.image}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 shrink-0 object-contain"
                      />
                      <div>
                        <h2 className="font-medium text-black">
                          {product.fuel}
                        </h2>
                        <p className="text-yellow-600 text-xs">{fuel.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 text-2xl tabular-nums">
                        ₦
                        {product.price.toLocaleString("en-NG", {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-grey-800 text-xs">per {fuel.unit}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex justify-between gap-3 text-xs">
                    <span className="text-grey-800">Last updated</span>
                    <time dateTime={product.updated}>
                      {new Date(product.updated).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: "Africa/Lagos",
                      })}
                    </time>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={product.enabled}
                    aria-label={`${product.enabled ? "Disable" : "Enable"} ${product.fuel}`}
                    onClick={() => setAction({ type: "toggle", product })}
                    className="flex min-h-9 cursor-pointer items-center gap-2 text-xs"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-5 w-9 items-center rounded-full p-0.5",
                        product.enabled ? "bg-primary-500" : "bg-grey-600",
                      )}
                    >
                      <span
                        className={cn(
                          "size-4 rounded-full bg-white",
                          product.enabled && "translate-x-4",
                        )}
                      />
                    </span>
                    {product.enabled ? "Disable Product" : "Enable Product"}
                  </button>
                  <ProductActions
                    product={product}
                    onEdit={() => setEditing(product)}
                    onRemove={() => setAction({ type: "remove", product })}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
      <ProductEditor
        key={editing?.id ?? (adding ? "add" : "closed")}
        open={adding || !!editing}
        product={editing}
        usedFuels={products.map((product) => product.fuel)}
        onClose={closeEditor}
        onSave={save}
      />
      <ConfirmDialog
        open={!!action}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        variant="confirm"
        title={`Want to ${action?.type === "remove" ? "remove" : action?.product.enabled ? "disable" : "enable"} product?`}
        cancelLabel="Cancel"
        confirmLabel={`Yes, ${action?.type === "remove" ? "Remove" : action?.product.enabled ? "Disable" : "Enable"}`}
        onConfirm={confirmAction}
      >
        {action?.type === "remove"
          ? "This product will be permanently deleted from your inventory."
          : action?.product.enabled
            ? "Disabling this product will temporarily hide it from customers."
            : "Enabling this will make the product visible to customers."}
      </ConfirmDialog>
    </>
  );
}

function ProductActions({
  product,
  onEdit,
  onRemove,
}: {
  product: Product;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`Actions for ${product.fuel}`}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-gray-100"
      >
        <MoreHorizontal size={18} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44">
        <button
          type="button"
          className="cursor-pointer rounded-lg px-3 py-2 text-left hover:bg-gray-100"
          onClick={() => {
            setOpen(false);
            onEdit();
          }}
        >
          Update Price
        </button>
        <button
          type="button"
          className="text-error cursor-pointer rounded-lg px-3 py-2 text-left hover:bg-gray-100"
          onClick={() => {
            setOpen(false);
            onRemove();
          }}
        >
          Remove Product
        </button>
      </PopoverContent>
    </Popover>
  );
}

function ProductEditor({
  open,
  product,
  usedFuels,
  onClose,
  onSave,
}: {
  open: boolean;
  product: Product | null;
  usedFuels: FuelType[];
  onClose: () => void;
  onSave: (fuel: FuelType, price: number) => void;
}) {
  const [fuel, setFuel] = useState<FuelType | "">(product?.fuel ?? "");
  const [price, setPrice] = useState(product?.price.toString() ?? "");
  const amount = Number(price);
  const valid =
    fuel !== "" &&
    Number.isFinite(amount) &&
    amount > 0 &&
    (product ? amount !== product.price : !usedFuels.includes(fuel));
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[1500] bg-black/20 backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-[1500] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-112 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-white p-6 shadow-lg outline-none">
          <Dialog.Title className="text-lg font-medium">
            {product ? "Update Price" : "What are you selling?"}
          </Dialog.Title>
          <Dialog.Description className="text-grey-800 mt-1 text-sm">
            {product
              ? "Modify the price as needed"
              : "Add a fuel type and set the price customers will see when they order."}
          </Dialog.Description>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (valid && fuel) onSave(fuel, amount);
            }}
          >
            {!product && (
              <fieldset className="mt-5">
                <legend className="mb-2 text-sm">Fuel Type</legend>
                <div className="flex gap-2">
                  {(Object.keys(fuels) as FuelType[]).map((type) => (
                    <label
                      key={type}
                      className={cn(
                        "flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-full border px-2 text-center text-xs has-[:focus-visible]:ring-2",
                        fuel === type
                          ? "border-primary-500 bg-primary-50 text-primary-500"
                          : "border-gray-200 text-grey-800",
                        usedFuels.includes(type) &&
                          "cursor-not-allowed opacity-50",
                      )}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="fuel"
                        value={type}
                        checked={fuel === type}
                        disabled={usedFuels.includes(type)}
                        onChange={() => setFuel(type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>
                {usedFuels.length === 3 && (
                  <p className="text-grey-800 mt-2 text-xs">
                    All fuel types have been added. Update an existing product
                    instead.
                  </p>
                )}
              </fieldset>
            )}
            <label
              htmlFor="inventory-price"
              className="mt-4 mb-2 block text-sm"
            >
              Price
            </label>
            <PillInput
              id="inventory-price"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              required
              placeholder="Enter price"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              aria-describedby="price-unit service-fee"
            />
            <p id="price-unit" className="text-grey-800 mt-1 text-xs">
              Price in naira per{" "}
              {fuel ? fuels[fuel].unit : "litre (gas per kg)"}.
            </p>
            <p
              id="service-fee"
              className="text-primary-500 mt-3 rounded-lg bg-primary-50 p-3 text-xs"
            >
              Service fee: FuelTap charges a 10% service fee on each customer
              purchase.
            </p>
            <div className="mt-12 flex gap-3">
              <Dialog.Close className={outlinePillClass}>Cancel</Dialog.Close>
              <button
                type="submit"
                disabled={!valid}
                className={primaryPillClass}
              >
                {product ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
