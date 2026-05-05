"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Bell } from "lucide-react";
import type { UserProfile } from "@/lib/auth/roles";
import { MobileDrawer } from "./MobileDrawer";

interface Props {
  profile: UserProfile | null;
}

// Swipe-right anywhere (not just edge) but with strict thresholds so
// vertical scrolls and casual taps don't trigger the drawer. Avoiding the
// edge also dodges iOS Safari's "swipe-back" gesture which used to make
// the drawer open compete with browser navigation.
const EDGE_DEAD_ZONE_PX = 24; // ignore swipes that START within this px of the edge (iOS back gesture)
const OPEN_DELTA_PX = 100; // must travel ≥ this far right
const OPEN_VELOCITY_PX_MS = 0.4; // …or be a fast flick
const HORIZONTAL_RATIO = 2; // dx must be at least this many times dy
const MAX_DURATION_MS = 600; // ignore very slow drags (probably text selection)

export function MobileTopBar({ profile }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const swipeRef = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Swipe-right anywhere on the screen to open the drawer. We deliberately
  // ignore touches that start in the very-left-edge dead zone so iOS Safari's
  // own "swipe back" gesture wins there (the drawer would otherwise compete
  // with browser navigation and feel laggy).
  useEffect(() => {
    if (drawerOpen) return;

    const isInteractive = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false;
      // Don't trigger when starting on form controls / scrollable carousels.
      return !!target.closest(
        'input, textarea, select, button, a[role="slider"], [data-no-swipe]',
      );
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (t.clientX <= EDGE_DEAD_ZONE_PX) return; // let iOS handle edge back-gesture
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
      if (dx <= 0) return; // must move right
      if (adx < ady * HORIZONTAL_RATIO) return; // must be clearly horizontal
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

  return (
    <>
      <header
        className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border"
            : "bg-background/40 backdrop-blur-md border-b border-transparent"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="h-14 px-3 flex items-center justify-between gap-2">
          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
            className="p-2 -ml-2 text-foreground hover:bg-secondary rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo + name centered, tap → hero */}
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

          {/* Right slot: notif bell (logged in) or login link (guest) */}
          <div className="flex items-center justify-end min-w-[40px]">
            {profile ? (
              <Link
                href="/dashboard"
                aria-label="Notificaciones"
                className="relative p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-bold text-primary"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        profile={profile}
      />
    </>
  );
}
