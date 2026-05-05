"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell,
  Key,
  Settings,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import type { Notification } from "@/lib/notifications";
import type { UserProfile } from "@/lib/auth/roles";

interface AdminMobileShellProps {
  profile: UserProfile;
  pendingBadge: number;
  notifItems: Notification[];
  notifUnread: number;
}

type Item = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  matchPrefix?: boolean;
  badgeKey?: "pending";
};

function isActive(pathname: string, item: { href: string; matchPrefix?: boolean }): boolean {
  if (item.href === "/admin") return pathname === "/admin";
  return item.matchPrefix ? pathname.startsWith(item.href) : pathname === item.href;
}

const EDGE_DEAD_ZONE_PX = 24;
const OPEN_DELTA_PX = 100;
const OPEN_VELOCITY_PX_MS = 0.4;
const HORIZONTAL_RATIO = 2;
const MAX_DURATION_MS = 600;

export function AdminMobileShell({
  profile,
  pendingBadge,
  notifItems,
  notifUnread,
}: AdminMobileShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const swipeRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const drawerItems: Item[] = [
    { href: "/admin", label: "Resumen", Icon: LayoutDashboard },
    { href: "/admin/usuarios", label: "Usuarios", Icon: Users, matchPrefix: true },
    {
      href: "/admin/pagos",
      label: "Pagos",
      Icon: CreditCard,
      matchPrefix: true,
      badgeKey: "pending",
    },
    { href: "/admin/rutinas", label: "Rutinas IA", Icon: Dumbbell, matchPrefix: true },
    { href: "/admin/bot-ia", label: "Configurar Bot", Icon: Key, matchPrefix: true },
    { href: "/admin/contenido", label: "CMS Web", Icon: Settings, matchPrefix: true },
  ];

  const tabItems: Item[] = [
    { href: "/admin", label: "Resumen", Icon: LayoutDashboard },
    { href: "/admin/usuarios", label: "Usuarios", Icon: Users, matchPrefix: true },
    {
      href: "/admin/pagos",
      label: "Pagos",
      Icon: CreditCard,
      matchPrefix: true,
      badgeKey: "pending",
    },
    { href: "/admin/rutinas", label: "Rutinas", Icon: Dumbbell, matchPrefix: true },
    { href: "/admin/contenido", label: "CMS", Icon: Settings, matchPrefix: true },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen) return;

    const isInteractive = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false;
      return !!target.closest(
        'input, textarea, select, button, a[role="slider"], [data-no-swipe]',
      );
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (t.clientX <= EDGE_DEAD_ZONE_PX) return;
      if (isInteractive(e.target)) return;
      swipeRef.current = { x: t.clientX, y: t.clientY, t: performance.now() };
    };

    const onTouchEnd = (e: TouchEvent) => {
      const start = swipeRef.current;
      swipeRef.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - start.x;
      const adx = Math.abs(dx);
      const ady = Math.abs(t.clientY - start.y);
      const dt = Math.max(1, performance.now() - start.t);
      if (dt > MAX_DURATION_MS) return;
      if (dx <= 0) return;
      if (adx < ady * HORIZONTAL_RATIO) return;
      const vx = dx / dt;
      if (adx >= OPEN_DELTA_PX || vx >= OPEN_VELOCITY_PX_MS) {
        setDrawerOpen(true);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [drawerOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setDrawerOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -300) setDrawerOpen(false);
  };

  return (
    <>
      <header
        className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-[background-color,border-color] duration-300 ${
          scrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border"
            : "bg-background/70 backdrop-blur-md border-b border-border/50"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="h-14 px-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
            className="p-2 -ml-2 text-foreground hover:bg-secondary rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" aria-label="Training Studio Gym" className="flex items-center gap-2 min-w-0">
            <Image
              src="/assets/logo-transparent.png"
              alt=""
              width={928}
              height={1105}
              className="h-9 w-auto object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.35)] shrink-0"
              priority
            />
            <span className="font-display font-bold text-sm tracking-tight truncate">
              TRAINING STUDIO
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <NotificationBell
              userId={profile.id}
              initialItems={notifItems}
              initialUnread={notifUnread}
            />
            <Link
              href="/dashboard/perfil"
              aria-label="Mi perfil"
              className="ml-1 shrink-0"
            >
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-primary/30"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold border border-primary/30 text-sm">
                  {profile.initials}
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 36 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.2, right: 0 }}
              onDragEnd={handleDragEnd}
              role="dialog"
              aria-label="Menú admin"
              className="md:hidden fixed top-0 bottom-0 left-0 z-[61] w-[82%] max-w-[340px] bg-card border-r border-border shadow-2xl flex flex-col overflow-y-auto"
            >
              <div className="px-5 py-5 border-b border-border bg-primary/5 flex items-start justify-between gap-3">
                <Link
                  href="/dashboard/perfil"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 min-w-0 flex-1"
                >
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-primary/30 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold border border-primary/30 shrink-0">
                      {profile.initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display font-bold text-base truncate">{profile.fullName}</p>
                    <p className="text-xs text-primary/80 truncate font-medium uppercase tracking-wider">
                      {profile.role === "owner" ? "Propietario" : "Partner"}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Cerrar menú"
                  className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-0.5">
                {drawerItems.map((item) => {
                  const Icon = item.Icon;
                  const active = isActive(pathname, item);
                  const showBadge = item.badgeKey === "pending" && pendingBadge > 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${active ? "" : "text-muted-foreground"}`} />
                        {item.label}
                      </span>
                      {showBadge && (
                        <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {pendingBadge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-5 py-4 border-t border-border space-y-1">
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al sitio
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-secondary transition-colors"
                >
                  Ir al panel de socio
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="flex items-stretch justify-around">
          {tabItems.map((item) => {
            const Icon = item.Icon;
            const active = isActive(pathname, item);
            const showBadge = item.badgeKey === "pending" && pendingBadge > 0;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className="block relative"
                >
                  <span
                    className={`flex items-center justify-center px-2 py-3 transition-colors ${
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon
                      className={`w-7 h-7 ${active ? "fill-primary/20" : ""}`}
                      strokeWidth={active ? 2.4 : 2}
                    />
                  </span>
                  {showBadge && (
                    <span className="absolute top-1.5 right-[calc(50%-22px)] bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {pendingBadge > 9 ? "9+" : pendingBadge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
