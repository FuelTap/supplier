"use client";

import Image from "next/image";
import { useState } from "react";
import PageHeading from "../admin/ui/PageHeading";
import SearchBox from "../admin/ui/SearchBox";
import FilterPill from "../admin/ui/FilterPill";
import Pagination, { paginate } from "../admin/ui/Pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export type StationOrder = {
  id: string;
  customer: string;
  type: "One-time" | "Recurring";
  fuel: string;
  quantity: number;
  amount: number;
  address: string;
  deliveryDate: string;
  status: "New" | "Ready for Delivery" | "Scheduled" | "Out for Delivery" | "Delivered" | "Cancelled";
};

const demoOrders: StationOrder[] = Array.from({ length: 24 }, (_, index) => ({
  id: `ORD-${1273 + index}`,
  customer: ["John Anderson", "Sarah Owens", "David Keller", "Davidson James"][index % 4],
  type: index % 3 === 0 ? "One-time" : "Recurring",
  fuel: index % 2 === 0 ? "Petrol" : "Diesel",
  quantity: [50, 100, 20, 80][index % 4],
  amount: [23000, 14700, 11800, 23000][index % 4],
  address: ["12 Admiralty Way", "Ikeja GRA", "Lekki Phase 1"][index % 3],
  deliveryDate: "2026-10-04T10:42:00+01:00",
  status: (["New", "Ready for Delivery", "Delivered", "Out for Delivery", "Delivered", "Cancelled", "Scheduled"] as const)[index % 7],
}));

function matchesTab(order: StationOrder, tab: string) {
  if (tab === "new") return order.status === "New";
  if (tab === "upcoming") return ["New", "Ready for Delivery", "Scheduled"].includes(order.status);
  if (tab === "progress") return order.status === "Out for Delivery";
  if (tab === "past") return ["Delivered", "Cancelled"].includes(order.status);
  return true;
}

const statusClasses = {
  New: "bg-indigo-50 text-blue-600",
  "Ready for Delivery": "bg-teal-100 text-teal-600",
  Scheduled: "bg-amber-50 text-amber-600",
  "Out for Delivery": "bg-indigo-100 text-blue-600",
  Delivered: "bg-emerald-50 text-emerald-600",
  Cancelled: "bg-rose-50 text-rose-600",
};

const tabs = [
  { id: "all", label: "All Orders", title: "All Caught Up!", description: "There are no orders right now. New customer requests within your delivery radius will pop up here automatically." },
  { id: "new", label: "New (0)", title: "No new orders", description: "New customer orders will appear here when they are received by your station." },
  { id: "upcoming", label: "Upcoming", title: "No upcoming orders", description: "You don’t have any scheduled orders at the moment. Orders scheduled for a future delivery date will appear here so you can keep track of what’s coming up." },
  { id: "progress", label: "In-Progress (0)", title: "No orders in progress", description: "Orders your station is preparing or delivering will appear here." },
  { id: "past", label: "Past", title: "No past orders", description: "Completed and cancelled orders will appear here for your records." },
] as const;

const orderTypes = [
  { label: "All Types", value: "all" },
  { label: "One-time", value: "one-time" },
  { label: "Recurring", value: "recurring" },
] as const;

export default function StationOrders({ orders = demoOrders }: { orders?: StationOrder[] }) {
  const [active, setActive] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [orderType, setOrderType] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(24);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const matching = orders.filter(order => matchesTab(order, active)
    && (orderType === "all" || order.type.toLowerCase() === orderType)
    && `${order.id} ${order.customer} ${order.fuel} ${order.quantity} ${order.address}`.toLowerCase().includes(search.trim().toLowerCase()));
  const visible = paginate(matching, page, perPage);
  const dated = active === "upcoming" || active === "progress" || active === "past";
  function toggle(id: string) {
    setSelected(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  const current = tabs.find(tab => tab.id === active) ?? tabs[0];
  const filtered = search.trim().length > 0 || orderType !== "all";

  return <div className="min-w-0">
    <PageHeading title="Orders" subtitle="View and manage orders received by your station." />
    <div className="mt-7 flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <nav aria-label="Order status" className="max-w-full overflow-x-auto pb-1">
        <div className="flex w-max items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 p-1">
          {tabs.map(tab => <button key={tab.id} type="button" aria-pressed={active === tab.id} onClick={() => { setActive(tab.id); setPage(1); }} className={`min-h-10 cursor-pointer whitespace-nowrap rounded-full px-4 text-sm text-blue-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${active === tab.id ? "bg-white shadow-sm" : "hover:bg-white/60"}`}>{tab.id === "new" ? `New (${orders.filter(order => matchesTab(order, "new")).length})` : tab.id === "progress" ? `In-Progress (${orders.filter(order => matchesTab(order, "progress")).length})` : tab.label}</button>)}
        </div>
      </nav>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row xl:flex-1 xl:justify-end xl:pl-5">
        <SearchBox value={search} onChange={value => { setSearch(value); setPage(1); }} placeholder="Search by customer name, fuel type, quantity..." />
        <FilterPill label="Order Type" options={orderTypes} value={orderType} onChange={value => { setOrderType(value); setPage(1); }} />
      </div>
    </div>
    {matching.length > 0 ? <section className="mt-5 overflow-hidden rounded-xl border border-grey-200 bg-white" aria-label="Station orders">
      <Table className="min-w-250 text-xs">
        <TableHeader><TableRow><TableHead className="px-4"><input type="checkbox" aria-label="Select all orders on this page" checked={visible.rows.length > 0 && visible.rows.every(order => selected.has(order.id))} onChange={event => { const checked = event.target.checked; setSelected(previous => { const next = new Set(previous); visible.rows.forEach(order => checked ? next.add(order.id) : next.delete(order.id)); return next; }); }} /></TableHead>{["Order ID", "Order Type", "Customer", "Fuel Type", "Qty", "Amount", "Delivery Address", ...(dated ? ["Est. Delivery Date"] : []), "Status", "Actions"].map(label => <TableHead key={label} className="h-14 px-3 text-xs">{label}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{visible.rows.map(order => <TableRow key={order.id} className="border-0 odd:bg-[#eeedff]"><TableCell className="px-4"><input type="checkbox" aria-label={`Select ${order.id}`} checked={selected.has(order.id)} onChange={() => toggle(order.id)} /></TableCell><TableCell className="px-3 py-5 text-grey-800">{order.id}</TableCell><TableCell className="px-3">{order.type}</TableCell><TableCell className="max-w-36 truncate px-3 text-blue-600" title={order.customer}>{order.customer}</TableCell><TableCell className="px-3">{order.fuel}</TableCell><TableCell className="px-3">{order.quantity} L</TableCell><TableCell className="px-3">₦{order.amount.toLocaleString("en-NG")}</TableCell><TableCell className="px-3"><p className="max-w-40 truncate" title={order.address}>{order.address}</p><p className="mt-2 text-grey-800">Lekki, Lagos</p></TableCell>{dated && <TableCell className="px-3"><p>{new Date(order.deliveryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" })}</p><p className="mt-2 text-grey-800">{new Date(order.deliveryDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" })}</p></TableCell>}<TableCell className="px-3"><span className={`rounded-full px-3 py-1 ${statusClasses[order.status]}`}>{order.status}</span></TableCell><TableCell className="px-3"><details><summary className="cursor-pointer list-none rounded p-2 text-center focus-visible:outline-2" aria-label={`Details for ${order.id}`}>⠿</summary><p className="max-w-40 whitespace-normal py-2">{order.id}: {order.quantity} L of {order.fuel} for {order.customer}.</p></details></TableCell></TableRow>)}</TableBody>
      </Table>
      <Pagination page={visible.page} perPage={perPage} total={matching.length} noun="Orders" onPageChange={setPage} onPerPageChange={value => { setPerPage(value); setPage(1); }} />
    </section> : <section aria-live="polite" aria-atomic="true" className="mx-auto flex max-w-xl flex-col items-center px-4 pt-16 text-center md:pt-24">
      <Image src="/empty.png" alt="" width={162} height={148} className="mb-6 rounded-lg" />
      <h2 className="text-base font-medium text-black">{filtered ? "No matching orders" : current.title}</h2>
      <p className="text-grey-800 mt-2 max-w-lg text-sm leading-relaxed">{filtered ? "No orders match your filters. Try another search or reset the filters." : current.description}</p>
      {filtered && <button type="button" onClick={() => { setSearch(""); setOrderType("all"); }} className="mt-4 cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-blue-600 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-blue-600">Reset filters</button>}
    </section>}
  </div>;
}
