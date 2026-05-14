"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, User, LogOut, ChevronDown, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { LockedAccessDialog } from "@/components/landing/LockedAccessDialog";

interface AvatarMenuProps {
  fullName: string;
  initials: string;
  avatarUrl: string | null;
  email: string;
  canAccessDashboard?: boolean;
}

export function AvatarMenu({
  fullName,
  initials,
  avatarUrl,
  email,
  canAccessDashboard = true,
}: AvatarMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lockedOpen, setLockedOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 group"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-9 h-9 rounded-full object-cover border border-primary/30 group-hover:border-primary transition-colors"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border border-primary/30 group-hover:border-primary transition-colors">
            {initials}
          </div>
        )}
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
            role="menu"
          >
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-bold truncate">{fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
            <div className="py-1">
              {canAccessDashboard ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/60 transition-colors"
                  role="menuitem"
                >
                  <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                  Mi Panel
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setLockedOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/60 transition-colors text-left"
                  role="menuitem"
                >
                  <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">Mi Panel</span>
                  <Lock className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
                </button>
              )}
              <Link
                href="/dashboard/perfil"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/60 transition-colors"
                role="menuitem"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                Mi Perfil
              </Link>
            </div>
            <div className="py-1 border-t border-border">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LockedAccessDialog
        open={lockedOpen}
        mode="no-membership"
        onClose={() => setLockedOpen(false)}
      />
    </div>
  );
}
