"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Clock,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/slots", label: "Slots", icon: Clock },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/stats", label: "Stats", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let path = "";
  for (const seg of segments) {
    path += `/${seg}`;
    crumbs.push({
      label: seg.charAt(0).toUpperCase() + seg.slice(1),
      href: path,
    });
  }
  return crumbs;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const breadcrumbs = getBreadcrumbs(pathname);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-navy-light">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
            <span className="text-navy font-bold text-sm">PKH</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm">PKH Mentoring</div>
            <div className="text-warm-grey text-xs">Admin Dashboard</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                active
                  ? "text-gold border-l-2 border-gold bg-gold/10"
                  : "text-white hover:bg-navy-light border-l-2 border-transparent"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-navy-light p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-white hover:bg-navy-light rounded-md transition-colors w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-warm-white">
      <aside className="hidden lg:flex w-64 bg-navy flex-col flex-shrink-0">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy transform transition-transform lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:text-gold"
          >
            <X size={20} />
          </button>
        </div>
        {sidebar}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-sand-dark px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-navy"
          >
            <Menu size={24} />
          </button>
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-2">
                {i > 0 && <span className="text-sand-dark">/</span>}
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-navy font-medium">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-warm-grey hover:text-navy">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1280px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
