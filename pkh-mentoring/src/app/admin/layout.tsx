"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Clock,
  Users,
  Video,
  BarChart3,
  Wrench,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavBadges {
  students: number;
  slots: number;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, badgeKey: null },
  { href: "/admin/slots", label: "Slots", icon: Clock, badgeKey: "slots" as const },
  { href: "/admin/students", label: "Students", icon: Users, badgeKey: "students" as const },
  { href: "/admin/zoom", label: "Zoom", icon: Video, badgeKey: null },
  { href: "/admin/stats", label: "Stats", icon: BarChart3, badgeKey: null },
  { href: "/admin/system", label: "System", icon: Wrench, badgeKey: null },
  { href: "/admin/settings", label: "Settings", icon: Settings, badgeKey: null },
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
  const [badges, setBadges] = useState<NavBadges>({ students: 0, slots: 0 });

  useEffect(() => {
    fetch("/api/admin/stats/summary")
      .then((res) => res.json())
      .then((data) => {
        setBadges({
          students: data.totalStudents ?? 0,
          slots: data.openSlots ?? 0,
        });
      })
      .catch(() => {});
  }, [pathname]);

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
          const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
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
              <span className="flex-1">{item.label}</span>
              {item.badgeKey && badgeCount > 0 && (
                <span className="bg-gold text-navy text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center" style={{ fontSize: "12px" }}>
                  {badgeCount}
                </span>
              )}
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
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
