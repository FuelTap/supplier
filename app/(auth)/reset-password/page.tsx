import { Metadata } from "next";
import { Suspense } from "react";
import {
  InvalidResetLink,
  ResetPasswordForm,
} from "@/components/admin/auth/AdminForgotPassword";
import PageLoading from "@/components/admin/ui/PageLoading";

export const metadata: Metadata = {
  title: "Reset Password | FuelTap Supplier",
};

type SearchParams = Promise<{ email?: string; token?: string }>;

// Opened from the password reset email: /reset-password?email=…&token=…
export default function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // The link's query is request data, so the form streams in behind a boundary.
  return (
    <Suspense fallback={<PageLoading />}>
      <ResetPassword searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetPassword({ searchParams }: { searchParams: SearchParams }) {
  const { email, token } = await searchParams;
  if (!email || !token) return <InvalidResetLink />;
  return <ResetPasswordForm email={email} token={token} />;
}
