import { Metadata } from "next";
import LoginForm from "@/components/admin/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In | FuelTap Supplier",
};

export default function AdminLoginPage() {
  return <LoginForm />;
}
