import { Metadata } from "next";
import KybFlow from "@/components/admin/kyb/KybFlow";

export const metadata: Metadata = {
  title: "Business Verification | FuelTap Supplier",
};

export default function KybPage() {
  return <KybFlow />;
}
