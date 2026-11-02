"use client";

import { splitName } from "@/lib/helpers/help";
import Logo from "../web/Logo";
import { Bell, ChevronDown, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useEffect, useState } from "react";
import { adminLogout } from "@/lib/server/admin/auth";
import { adminToast } from "./ui/AdminToaster";

const adminLinks = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Stations", path: "/stations" },
  { name: "Managers", path: "/managers" },
  { name: "Inventory", path: "/inventory" },
];

const accountItemClassName =
  "flex w-full cursor-pointer items-center px-6 py-3 text-left text-sm text-black transition-colors hover:bg-gray-100 md:px-7 md:py-3.5 md:text-base";

export default function AdminHeader() {
  const { user } = useAuth();
  const fullName = user?.profile?.fullName ?? "";
  const initials = splitName(fullName || "Admin");

  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  async function handleLogout() {
    if (!user?.id) {
      router.replace("/login");
      return;
    }
    const res = await adminLogout(user.id);
    if (!res?.success) {
      adminToast.add({ description: "Could not log out.", type: "error" });
      return;
    }
    router.replace("/login");
  }

  // Below md the header isn't pinned, so open menus would scroll away.
  useScrollLock(
    menuOpen ||
      (accountOpen && window.matchMedia("(max-width: 767px)").matches),
  );

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const navLinks = (onNavigate?: () => void) =>
    adminLinks.map((link) => (
      <Link
        key={link.path}
        href={link.path}
        onClick={onNavigate}
        aria-current={isActive(link.path) ? "page" : undefined}
        className={cn(
          "text-sm whitespace-nowrap transition-colors md:text-base",
          isActive(link.path)
            ? "text-primary-500 font-medium"
            : "text-grey-800 hover:text-black",
        )}
      >
        {link.name}
      </Link>
    ));

  return (
    <header
      className={cn(
        "relative inset-x-0 top-0 w-full border-b border-gray-100 bg-white md:fixed",
        menuOpen ? "z-1100" : "z-10",
      )}
    >
      <div className="container flex items-center justify-between gap-4 py-3 xl:py-4">
        {/* ===== Menu toggle (below xl) ===== */}
        <div className="flex flex-1 items-center gap-4 xl:hidden">
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="admin-nav-menu"
            className="cursor-pointer text-black"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="flex shrink-0 justify-center xl:justify-start">
          <Logo />
        </div>

        <nav aria-label="Admin" className="hidden items-center gap-6 xl:flex">
          {navLinks()}
        </nav>

        {/* ===== Notifications + account ===== */}
        <div className="flex flex-1 items-center justify-end gap-4 xl:flex-none xl:gap-6">
          <button
            type="button"
            aria-label="Notifications"
            className="text-grey-800 hidden cursor-pointer hover:text-black md:block"
          >
            <Bell size={22} />
          </button>

          <Popover
            open={accountOpen}
            onOpenChange={(open) => {
              setAccountOpen(open);
              if (open) setMenuOpen(false);
            }}
          >
            <PopoverTrigger
              aria-label="Account menu"
              className="flex cursor-pointer items-center gap-2 text-left"
            >
              <span className="hidden max-w-40 flex-col text-right md:flex">
                <span className="truncate text-lg text-black capitalize">
                  {fullName}
                </span>
                <span className="text-grey-800 truncate text-sm">
                  {user?.profile?.email}
                </span>
              </span>
              <Avatar className="size-11">
                <AvatarFallback className="bg-blue-600 text-base font-medium text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown
                size={20}
                className={cn(
                  "text-black transition-transform duration-200",
                  accountOpen && "rotate-180",
                )}
              />
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-60 gap-0 divide-y divide-gray-100 overflow-hidden rounded-xl p-0 md:w-94"
            >
              {/* The bell is hidden on mobile, so notifications live here. */}
              <button
                type="button"
                className={cn(accountItemClassName, "md:hidden")}
                onClick={() => setAccountOpen(false)}
              >
                Notification
              </button>
              <button
                type="button"
                className={accountItemClassName}
                onClick={() => {
                  setAccountOpen(false);
                  void handleLogout();
                }}
              >
                Log Out
              </button>
              <Link
                href="/support"
                className={accountItemClassName}
                onClick={() => setAccountOpen(false)}
              >
                Help & Support
              </Link>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ===== Nav menu overlay (below xl) ===== */}
      {menuOpen && (
        <div
          id="admin-nav-menu"
          className="absolute inset-x-0 top-full h-dvh bg-black/25 xl:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div className="container pt-2">
            <nav
              aria-label="Admin"
              className="flex w-full items-center justify-between gap-4 rounded-full bg-white px-6 py-3 shadow-sm md:w-fit md:justify-start md:gap-6 md:px-7"
              onClick={(e) => e.stopPropagation()}
            >
              {navLinks(() => setMenuOpen(false))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
