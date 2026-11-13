import { Metadata } from "next";
import AdminLoginForm from "@/components/admin/auth/AdminLoginForm";

export const metadata: Metadata = {
  title: "Log In | FuelTap Supplier",
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
