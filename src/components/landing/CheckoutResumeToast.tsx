"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ArrowRight, X } from "lucide-react";
import { readCheckout } from "@/lib/checkout/storage";

const PLAN_NAMES: Record<string, string> = {
  mensualidad: "Mensualidad del Gym",
  "12-clases": "Paquete 12 Clases",
  "15-clases": "Paquete 15 Clases",
  "20-clases": "Paquete 20 Clases",
};

const DISMISS_KEY = "ts:checkout:toast-dismissed";

export function CheckoutResumeToast() {
  const pathname = usePathname();
  const [planLabel, setPlanLabel] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(DISMISS_KEY) === "1") {
      setDismissed(true);
    }
    const saved = readCheckout();
    if (saved && saved.step >= 2 && saved.step <= 3) {
      setPlanLabel(PLAN_NAMES[saved.plan] ?? "tu plan");
    } else {
      setPlanLabel(null);
    }
  }, [pathname]);

  const hideOnRoute =
    pathname?.startsWith("/planes") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login");

  const shouldShow = !!planLabel && !dismissed && !hideOnRoute;

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    }
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          className="fixed z-40 left-3 right-3 sm:left-auto sm:right-6 bottom-[calc(env(safe-area-inset-bottom)+72px)] md:bottom-6 sm:w-[360px] md:w-[380px] sm:max-w-[calc(100vw-3rem)]"
        >
          <div className="relative rounded-2xl border border-primary/30 bg-background/95 backdrop-blur-xl shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7),0_0_30px_-10px_rgba(212,175,55,0.45)] overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
                className="h-px w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_10px_rgba(212,175,55,0.85)]"
              />
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Cerrar"
              className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 p-4 pr-9">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 shrink-0 shadow-[0_0_18px_-4px_rgba(212,175,55,0.6)]">
                <RotateCcw className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight">
                  Continuá tu pago
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  Tu progreso de{" "}
                  <span className="text-foreground font-medium">
                    {planLabel}
                  </span>{" "}
                  está guardado.
                </p>
                <Link
                  href="/planes"
                  onClick={handleDismiss}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  Continuar <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
