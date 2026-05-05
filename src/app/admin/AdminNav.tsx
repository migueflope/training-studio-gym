"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell as DumbbellIcon,
  Key,
  Settings,
} from "lucide-react";

interface AdminNavProps {
  pendingBadge: number;
}

type Item = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const ITEMS: Item[] = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/pagos", label: "Pagos", icon: CreditCard },
  { href: "/admin/rutinas", label: "Rutinas IA", icon: DumbbellIcon },
  { href: "/admin/bot-ia", label: "Configurar Bot", icon: Key },
  { href: "/admin/contenido", label: "CMS Web", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminNav({ pendingBadge }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-4 space-y-1">
      {ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              {item.label}
            </span>
            {item.href === "/admin/pagos" && pendingBadge > 0 && (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingBadge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
