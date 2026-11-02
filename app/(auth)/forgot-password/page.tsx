import { Metadata } from "next";
import AdminForgotPassword from "@/components/admin/auth/AdminForgotPassword";

export const metadata: Metadata = {
  title: "Forgot Password | FuelTap Supplier",
};

export default function AdminForgotPasswordPage() {
  return <AdminForgotPassword />;
}
