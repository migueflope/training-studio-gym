"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, Users, LayoutDashboard } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { LockedAccessDialog } from "@/components/landing/LockedAccessDialog";
import type { UserProfile } from "@/lib/auth/roles";
import { isAdminRole } from "@/lib/auth/roles";

interface Props {
  profile: UserProfile | null;
  hasActiveMembership: boolean;
}

type NavItem = {
  href: string;
  label: string;
  Icon: typeof Home;
  matchPrefix?: boolean;
  requiresAuth?: boolean;
};

const ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", Icon: Home },
  { href: "/planes", label: "Planes", Icon: CreditCard },
  { href: "/entrenadores", label: "Entrenadores", Icon: Users },
  { href: "/dashboard", label: "Mi Panel", Icon: LayoutDashboard, matchPrefix: true, requiresAuth: true },
  { href: "/contacto", label: "Contacto", Icon: WhatsAppIcon as unknown as typeof Home },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/";
  return item.matchPrefix ? pathname.startsWith(item.href) : pathname === item.href;
}

export function MobileBottomNav({ profile, hasActiveMembership }: Props) {
  const pathname = usePathname();
  const [lockedOpen, setLockedOpen] = useState(false);

  const isAdmin = !!profile && isAdminRole(profile.role);
  const canAccessDashboard = isAdmin || hasActiveMembership;

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="flex items-stretch justify-around">
          {ITEMS.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.Icon;
            const locked = !!item.requiresAuth && !canAccessDashboard;

            const inner = (
              <span
                className={`flex items-center justify-center px-2 py-3 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon
                  className={`w-7 h-7 ${active ? "fill-primary/20" : ""}`}
                  strokeWidth={active ? 2.4 : 2}
                />
              </span>
            );

            return (
              <li key={item.href} className="flex-1">
                {locked ? (
                  <button
                    type="button"
                    onClick={() => setLockedOpen(true)}
                    aria-label={item.label}
                    className="w-full"
                  >
                    {inner}
                  </button>
                ) : (
                  <Link href={item.href} aria-label={item.label} className="block">
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <LockedAccessDialog
        open={lockedOpen}
        mode={profile ? "no-membership" : "unauthenticated"}
        onClose={() => setLockedOpen(false)}
      />
    </>
  );
}
