import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import AdminToaster from "@/components/admin/ui/AdminToaster";
import "./globals.css";

const pjs = Plus_Jakarta_Sans({
  variable: "--font-pjs",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FuelTap Supplier",
  description: "Manage your fuel stations, managers, inventory and orders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${pjs.variable} h-full antialiased`}>
      <body className="font-pjs flex min-h-full flex-col">
        {children}
        <AdminToaster />
      </body>
    </html>
  );
}
