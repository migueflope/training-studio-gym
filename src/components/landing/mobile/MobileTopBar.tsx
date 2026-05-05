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

const EDGE_THRESHOLD_PX = 24; // touch must start within this many px of left edge
const OPEN_DELTA_PX = 60; // and travel at least this far right
const OPEN_VELOCITY_PX_MS = 0.3; // …or be a fast flick

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

  // Swipe-right from left edge to open drawer (Twitter/X style).
  useEffect(() => {
    if (drawerOpen) return;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (t.clientX > EDGE_THRESHOLD_PX) return; // must start near edge
      swipeRef.current = { x: t.clientX, y: t.clientY, t: performance.now() };
    };

    const onTouchEnd = (e: TouchEvent) => {
      const start = swipeRef.current;
      swipeRef.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - start.x;
      const dy = Math.abs(t.clientY - start.y);
      const dt = Math.max(1, performance.now() - start.t);
      const vx = dx / dt;
      // Mostly horizontal, far enough OR fast enough.
      if (dy > Math.abs(dx)) return;
      if (dx > OPEN_DELTA_PX || vx > OPEN_VELOCITY_PX_MS) {
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

          {/* Logo centered */}
          <Link href="/" aria-label="Inicio" className="flex items-center">
            <Image
              src="/assets/logo-transparent.png"
              alt="Training Studio Gym"
              width={928}
              height={1105}
              className="h-9 w-auto object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.35)]"
              priority
            />
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
