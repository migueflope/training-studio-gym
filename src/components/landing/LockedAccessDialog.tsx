"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, ArrowRight, UserPlus, Sparkles, MessageCircle } from "lucide-react";

export type LockedAccessMode = "unauthenticated" | "no-membership";

interface LockedAccessDialogProps {
  open: boolean;
  mode: LockedAccessMode;
  onClose: () => void;
}

const COPY: Record<LockedAccessMode, {
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  primaryIcon: React.ReactNode;
  secondaryHref: string;
  secondaryLabel: string;
  secondaryIcon: React.ReactNode;
}> = {
  unauthenticated: {
    title: "Acceso exclusivo para socios",
    body:
      "Tu panel personal está reservado para miembros del club. Iniciá sesión para ver tus rutinas, progreso y reservas.",
    primaryHref: "/login",
    primaryLabel: "Iniciar Sesión",
    primaryIcon: <ArrowRight className="w-4 h-4" />,
    secondaryHref: "/login?mode=signup",
    secondaryLabel: "Crear cuenta",
    secondaryIcon: <UserPlus className="w-4 h-4" />,
  },
  "no-membership": {
    title: "Necesitás un plan activo",
    body:
      "Tu panel se desbloquea apenas tengas una membresía vigente. Elegí el plan que mejor te queda y empezá a entrenar con nosotros.",
    primaryHref: "/planes",
    primaryLabel: "Ver planes",
    primaryIcon: <Sparkles className="w-4 h-4" />,
    secondaryHref: "/contacto",
    secondaryLabel: "Hablar con un asesor",
    secondaryIcon: <MessageCircle className="w-4 h-4" />,
  },
};

export function LockedAccessDialog({ open, mode, onClose }: LockedAccessDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-primary/30 bg-background/95 backdrop-blur-xl p-8 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8),0_0_40px_-10px_rgba(212,175,55,0.3)]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 border border-primary/30 shadow-[0_0_24px_-4px_rgba(212,175,55,0.45)]">
                <Lock className="w-7 h-7 text-primary" />
              </div>

              <h2 className="text-2xl font-display font-bold mb-3">
                {COPY[mode].title}
              </h2>
              <p className="text-muted-foreground text-[15px] leading-relaxed mb-7 max-w-sm">
                {COPY[mode].body}
              </p>

              <div className="flex flex-col w-full gap-2.5">
                <Link
                  href={COPY[mode].primaryHref}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-[15px] font-bold bg-primary text-primary-foreground rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_28px_rgba(212,175,55,0.65)] hover:-translate-y-0.5 transition-all"
                >
                  {COPY[mode].primaryIcon}
                  {COPY[mode].primaryLabel}
                </Link>
                <Link
                  href={COPY[mode].secondaryHref}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-[15px] font-medium text-foreground border border-border rounded-full hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  {COPY[mode].secondaryIcon}
                  {COPY[mode].secondaryLabel}
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
