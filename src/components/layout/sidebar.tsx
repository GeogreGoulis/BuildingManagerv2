"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Wallet,
  CalendarDays,
  Bell,
  Users,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/generated/prisma";

interface SidebarProps {
  role: Role;
  onNavigate?: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: null },
  { href: "/buildings", label: "Buildings", icon: Building2, roles: null },
  { href: "/finances", label: "Finances", icon: Wallet, roles: ["ADMIN", "MANAGER", "OWNER", "ACCOUNTANT"] },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, roles: null },
  { href: "/notifications", label: "Notifications", icon: Bell, roles: null },
  { href: "/users", label: "Users", icon: Users, roles: ["ADMIN", "MANAGER"] },
  { href: "/settings/roles", label: "Role Settings", icon: Settings, roles: ["ADMIN"] },
  { href: "/profile", label: "Profile", icon: User, roles: null },
];

export function Sidebar({ role, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <nav className="flex flex-col gap-1 p-4">
      <div className="mb-4 px-2">
        <h2 className="text-lg font-bold">Building Manager</h2>
      </div>
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
