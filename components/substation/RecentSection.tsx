import Image from "next/image";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const orders = [
  ["John Anderson", "One-time", "Petrol", "50 L", "₦23,000", "New"],
  [
    "Sarah Owens",
    "Recurring",
    "Diesel",
    "100 L",
    "₦14,700",
    "Ready for Delivery",
  ],
  ["David Keller", "Recurring", "Diesel", "20 L", "₦11,800", "Delivered"],
  [
    "Davidson James",
    "One-time",
    "Petrol",
    "80 L",
    "₦23,000",
    "Out for Delivery",
  ],
];

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center p-10">
      <Image src="/empty.png" width={162} height={148} alt={label} />
    </div>
  );
}

export default function RecentSection({ empty = false }: { empty?: boolean }) {
  const panel = "overflow-hidden rounded-xl border border-grey-200 bg-white";
  const heading = "border-b border-grey-200 px-5 py-5 font-medium md:px-7";
  return (
    <div className="mt-5 space-y-5">
      <section className={panel} aria-label="Recent orders">
        <h2 className={heading}>Recent Orders</h2>
        {empty ? (
          <EmptyState label="No recent orders" />
        ) : (
          <Table className="min-w-180 text-sm">
            <TableHeader>
              <TableRow>
                {[
                  "Order ID",
                  "Customer",
                  "Order Type",
                  "Fuel Type",
                  "Qty",
                  "Amount",
                  "Status",
                ].map((label) => (
                  <TableHead key={label} className="h-14 px-5">
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={order[0]} className="border-0 odd:bg-[#eeedff]">
                  <TableCell className="px-5 py-5 text-grey-800">
                    ORD-127{index + 3}
                  </TableCell>
                  {order.map((value, column) => (
                    <TableCell
                      key={column}
                      className={`px-5 py-5 ${column === 0 ? "text-blue-600" : ""}`}
                    >
                      {column === 5 ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${value === "Delivered" ? "bg-emerald-50 text-emerald-600" : value === "Ready for Delivery" ? "bg-teal-100 text-teal-600" : "bg-indigo-100 text-blue-600"}`}
                        >
                          {value}
                        </span>
                      ) : (
                        value
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className={panel} aria-label="Recent transactions">
          <h2 className={heading}>
            Recent Transactions
            {empty && (
              <span className="mt-1 block text-sm font-normal">
                ₦0{" "}
                <span className="text-xs text-grey-800">
                  in escrow · 0 orders
                </span>
              </span>
            )}
          </h2>
          {empty ? (
            <EmptyState label="No recent transactions" />
          ) : (
            <ul className="divide-y divide-grey-200">
              {["Credited", "Processing", "Debited", "Pending"].map(
                (status, index) => {
                  const incoming = index === 0 || index === 3;
                  return (
                    <li
                      key={status}
                      className="flex items-center justify-between gap-3 px-5 py-4 md:px-7"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex size-11 shrink-0 items-center justify-center rounded-full text-white ${incoming ? "bg-linear-to-br from-emerald-400 via-emerald-600 to-emerald-950" : "bg-linear-to-br from-rose-400 via-rose-700 to-rose-950"}`}
                        >
                          {incoming ? (
                            <ArrowDownLeft size={20} />
                          ) : (
                            <ArrowUpRight size={20} />
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            {incoming ? "Order earnings" : "Wallet withdrawal"}
                          </p>
                          <p className="mt-1 text-xs text-grey-800">
                            Order #FT-2046 · 1:50 PM
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-xs">
                        <p
                          className={
                            incoming ? "text-emerald-600" : "text-rose-600"
                          }
                        >
                          {incoming ? "+" : "−"}₦20,700
                        </p>
                        <p
                          className={`mt-1 ${["Pending", "Processing"].includes(status) ? "text-amber-600" : "text-emerald-600"}`}
                        >
                          {status}
                        </p>
                      </div>
                    </li>
                  );
                },
              )}
            </ul>
          )}
        </section>
        <section className={panel} aria-label="Recent activities">
          <h2 className={heading}>Recent Activities</h2>
          {empty ? (
            <EmptyState label="No recent station activity" />
          ) : (
            <ul className="divide-y divide-grey-200">
              {[
                "New order received",
                "Order dispatched",
                "Order delivered",
                "Earnings released to wallet",
              ].map((activity, index) => (
                <li
                  key={activity}
                  className="flex items-center justify-between gap-4 px-5 py-5 md:px-7"
                >
                  <div>
                    <p className="text-sm">{activity}</p>
                    <p className="mt-1 text-xs text-grey-800">
                      Order #FT-2048 · ₦85,000
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-grey-800">
                    {index === 0
                      ? "12 minutes ago"
                      : `${index} hour${index > 1 ? "s" : ""} ago`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
