import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAuthenticated } from "@/lib/auth";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check as a fallback in case middleware isn't running.
  // The middleware sets x-pathname on every matched request.
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") || "";

  // Only redirect if we can confirm this is NOT the login page.
  // If x-pathname is set (middleware ran) and it's not the login page, check auth.
  if (pathname && pathname !== "/admin/login") {
    const authed = await isAuthenticated();
    if (!authed) {
      redirect("/admin/login");
    }
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
