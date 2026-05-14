"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  X,
  ArrowRight,
  UserPlus,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Target,
  CalendarCheck,
  Dumbbell,
} from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

export type LockedAccessMode = "unauthenticated" | "no-membership";

interface LockedAccessDialogProps {
  open: boolean;
  mode: LockedAccessMode;
  onClose: () => void;
}

type CopyItem = {
  title: string;
  body: string;
  primaryAction: { type: "link"; href: string } | { type: "auth"; mode: "login" | "signup" };
  primaryLabel: string;
  primaryIcon: React.ReactNode;
  secondaryAction: { type: "link"; href: string } | { type: "auth"; mode: "login" | "signup" };
  secondaryLabel: string;
  secondaryIcon: React.ReactNode;
};

const COPY: Record<LockedAccessMode, CopyItem> = {
  unauthenticated: {
    title: "Acceso exclusivo para socios",
    body:
      "Tu panel personal está reservado para miembros del club. Iniciá sesión para ver tus rutinas, progreso y reservas.",
    primaryAction: { type: "auth", mode: "login" },
    primaryLabel: "Iniciar Sesión",
    primaryIcon: <ArrowRight className="w-4 h-4" />,
    secondaryAction: { type: "auth", mode: "signup" },
    secondaryLabel: "Crear cuenta",
    secondaryIcon: <UserPlus className="w-4 h-4" />,
  },
  "no-membership": {
    title: "Desbloqueá Mi Panel",
    body:
      "Activá un plan y llevá tu entrenamiento al siguiente nivel.",
    primaryAction: { type: "link", href: "/planes" },
    primaryLabel: "Ver planes",
    primaryIcon: <Sparkles className="w-4 h-4" />,
    secondaryAction: { type: "link", href: "/contacto" },
    secondaryLabel: "Hablar con un asesor",
    secondaryIcon: <MessageCircle className="w-4 h-4" />,
  },
};

const PANEL_FEATURES = [
  { Icon: TrendingUp, label: "Tu progreso" },
  { Icon: Target, label: "Metas personales" },
  { Icon: CalendarCheck, label: "Asistencias al gym" },
  { Icon: Dumbbell, label: "Rutinas con IA" },
];

const ACTIVATING_PLANS = [
  "Mensualidad",
  "Paquete 12 clases",
  "Paquete 15 clases",
  "Paquete 20 clases",
];

export function LockedAccessDialog({ open, mode, onClose }: LockedAccessDialogProps) {
  const { openAuth } = useAuthModal();
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

  const showFeatures = mode === "no-membership";

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
            className="relative w-full max-w-md rounded-3xl border border-primary/30 bg-background/95 backdrop-blur-xl p-7 sm:p-8 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8),0_0_40px_-10px_rgba(212,175,55,0.3)] overflow-hidden"
          >
            {/* Futuristic scanline */}
            {showFeatures && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                  className="h-px w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_rgba(212,175,55,0.9)]"
                />
              </div>
            )}

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors z-10"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 border border-primary/30 shadow-[0_0_24px_-4px_rgba(212,175,55,0.45)]">
                <Lock className="w-7 h-7 text-primary" />
              </div>

              <h2 className="text-2xl font-display font-bold mb-2.5">
                {COPY[mode].title}
              </h2>
              <p className="text-muted-foreground text-[15px] leading-relaxed mb-6 max-w-sm">
                {COPY[mode].body}
              </p>

              {showFeatures && (
                <>
                  <div className="grid grid-cols-2 gap-2 w-full mb-5">
                    {PANEL_FEATURES.map((f, i) => (
                      <motion.div
                        key={f.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-primary/15 bg-primary/[0.04] text-left"
                      >
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/15 text-primary shrink-0">
                          <f.Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[13px] font-medium leading-tight">
                          {f.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="w-full mb-6"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">
                      Planes que lo activan
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {ACTIVATING_PLANS.map((p) => (
                        <span
                          key={p}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}

              <div className="flex flex-col w-full gap-2.5">
                <ActionButton
                  action={COPY[mode].primaryAction}
                  variant="primary"
                  label={COPY[mode].primaryLabel}
                  icon={COPY[mode].primaryIcon}
                  onClose={onClose}
                  openAuth={openAuth}
                />
                <ActionButton
                  action={COPY[mode].secondaryAction}
                  variant="secondary"
                  label={COPY[mode].secondaryLabel}
                  icon={COPY[mode].secondaryIcon}
                  onClose={onClose}
                  openAuth={openAuth}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ActionButton({
  action,
  variant,
  label,
  icon,
  onClose,
  openAuth,
}: {
  action: CopyItem["primaryAction"];
  variant: "primary" | "secondary";
  label: string;
  icon: React.ReactNode;
  onClose: () => void;
  openAuth: (mode: "login" | "signup") => void;
}) {
  const className =
    variant === "primary"
      ? "flex items-center justify-center gap-2 px-5 py-3 text-[15px] font-bold bg-primary text-primary-foreground rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_28px_rgba(212,175,55,0.65)] hover:-translate-y-0.5 transition-all"
      : "flex items-center justify-center gap-2 px-5 py-3 text-[15px] font-medium text-foreground border border-border rounded-full hover:border-primary/40 hover:bg-primary/5 transition-colors";

  if (action.type === "auth") {
    return (
      <button
        type="button"
        onClick={() => {
          onClose();
          openAuth(action.mode);
        }}
        className={className}
      >
        {icon}
        {label}
      </button>
    );
  }
  return (
    <Link href={action.href} onClick={onClose} className={className}>
      {icon}
      {label}
    </Link>
  );
}
