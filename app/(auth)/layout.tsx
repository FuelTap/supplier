import { AuthFormHeader, AuthPanel } from "@/components/admin/auth/AuthShell";

// Split-screen layout for super admin login, invite sign-up and password reset.
// The page itself never scrolls: spacing shrinks with the screen height, and
// only the form column scrolls on screens too short to fit it.
export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-dvh w-full overflow-hidden bg-[#F8F9FB]">
      <div className="flex w-full justify-center overflow-y-auto px-4 pt-[clamp(1.5rem,9vh,6.25rem)] pb-[clamp(1rem,3vh,2rem)] md:w-1/2">
        <div className="h-fit w-full max-w-110">
          <AuthFormHeader />
          <div className="mt-[clamp(1.25rem,5vh,3rem)]">{children}</div>
        </div>
      </div>
      <AuthPanel />
    </main>
  );
}
