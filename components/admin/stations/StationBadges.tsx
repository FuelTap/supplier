import StatusBadge from "@/components/admin/ui/StatusBadge";
import type { StationView } from "@/lib/server/admin/types";

export function ComplianceBadge({ station }: { station: StationView }) {
  if (!station.manager) return <span className="text-black">N/A</span>;
  return station.complianceStatus === "verified" ? (
    <StatusBadge tone="green">Verified</StatusBadge>
  ) : (
    <StatusBadge tone="yellow">Pending</StatusBadge>
  );
}

export function StationStatusBadge({ station }: { station: StationView }) {
  if (station.displayStatus === "unassigned") {
    return <span className="text-black">N/A</span>;
  }
  return station.displayStatus === "active" ? (
    <StatusBadge tone="green">Active</StatusBadge>
  ) : (
    <StatusBadge tone="yellow">Inactive</StatusBadge>
  );
}
