import { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import AdminInviteForm, {
  InvalidInvite,
} from "@/components/admin/auth/AdminInviteForm";
import PageLoading from "@/components/admin/ui/PageLoading";
import { getInvite } from "@/lib/server/admin/auth";

export const metadata: Metadata = {
  title: "Create Account | FuelTap Supplier",
};

type SearchParams = Promise<{ token?: string }>;

// Super admins join through an invitation link: /register?token=…
export default function AdminRegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // The token is request data, so the form streams in behind a boundary.
  return (
    <Suspense fallback={<PageLoading />}>
      <Invite searchParams={searchParams} />
    </Suspense>
  );
}

async function Invite({ searchParams }: { searchParams: SearchParams }) {
  // The expiry check reads the current time, so this must run per request.
  await connection();
  const { token } = await searchParams;
  const invite = await getInvite(token ?? null);

  if (!invite.success) return <InvalidInvite message={invite.message} />;
  return <AdminInviteForm invite={invite.data} />;
}
