"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Sparkles, ArrowRight } from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

const WELCOME_SEEN_KEY = "ts:welcome_seen";
const PROMO_NEXT = "/";

interface MonthlyPricing {
  price: number;
  discount_percentage: number;
}

interface WelcomeOfferDialogProps {
  mensualidad: MonthlyPricing;
  /**
   * 'welcome' auto-triggers on first home visit (4s timer or first scroll).
   * 'planes-gate' is controlled by the parent — used when a logged-out user
   * clicks "Ver Planes".
   */
  mode: "welcome" | "planes-gate";
  /** Required for planes-gate mode. */
  open?: boolean;
  /**
   * Called when the modal needs to close. `reason` lets the parent react
   * differently to a cancel vs. the user picking a CTA (AuthModal takes
   * over after a CTA, so the parent should not navigate away).
   */
  onClose?: (reason: "dismiss" | "action") => void;
}

function formatCop(n: number) {
  return `$${n.toLocaleString("es-CO")}`;
}

function computePrices(p: MonthlyPricing) {
  // The CMS-configured discount IS the welcome offer. Modal shows list price
  // crossed out → discounted price.
  const final = Math.round(p.price * (1 - p.discount_percentage / 100));
  return {
    before: formatCop(p.price),
    after: formatCop(final),
  };
}

export function WelcomeOfferDialog({
  mensualidad,
  mode,
  open: controlledOpen,
  onClose,
}: WelcomeOfferDialogProps) {
  const [autoOpen, setAutoOpen] = useState(false);
  const { openAuth } = useAuthModal();

  const isOpen = mode === "welcome" ? autoOpen : !!controlledOpen;

  useEffect(() => {
    if (mode !== "welcome") return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(WELCOME_SEEN_KEY)) return;

    let fired = false;
    const trigger = () => {
      if (fired) return;
      fired = true;
      window.localStorage.setItem(WELCOME_SEEN_KEY, "1");
      setAutoOpen(true);
      window.removeEventListener("scroll", trigger);
      window.clearTimeout(timer);
    };

    const timer = window.setTimeout(trigger, 4000);
    window.addEventListener("scroll", trigger, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", trigger);
    };
  }, [mode]);

  const dismiss = useCallback(() => {
    if (mode === "welcome") setAutoOpen(false);
    onClose?.("dismiss");
  }, [mode, onClose]);

  const handleSignup = useCallback(() => {
    if (mode === "welcome") setAutoOpen(false);
    onClose?.("action");
    openAuth("signup", { next: PROMO_NEXT });
  }, [openAuth, mode, onClose]);

  const handleLogin = useCallback(() => {
    if (mode === "welcome") setAutoOpen(false);
    onClose?.("action");
    openAuth("login", { next: PROMO_NEXT });
  }, [openAuth, mode, onClose]);

  const prices = computePrices(mensualidad);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-background border border-primary/40 rounded-2xl shadow-[0_0_60px_-10px_rgba(212,175,55,0.5)] overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

            <button
              type="button"
              onClick={dismiss}
              aria-label="Cerrar"
              className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full bg-black/50 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Image Section */}
            <div className="relative w-full h-48 md:h-56 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
              <img 
                src="/welcome-offer.png" 
                alt="Welcome Offer" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative px-6 md:px-8 pb-6 text-center mt-[-1.5rem] z-20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs uppercase tracking-[0.18em] text-primary font-semibold drop-shadow-md">
                  Estrenamos nueva web
                </span>
                <Sparkles className="w-4 h-4 text-primary" />
              </div>

              <h2 className="text-2xl md:text-[1.65rem] font-display font-bold leading-tight mb-2">
                Llevate <span className="text-primary">10% OFF</span> en tu primera mensualidad
              </h2>

              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Creá tu cuenta y reclamá la oferta de bienvenida. Sin caducidad, la activás cuando estés listo para arrancar.
              </p>

              <div className="mt-5 flex items-baseline justify-center gap-3">
                <span className="text-lg text-muted-foreground line-through">
                  {prices.before}
                </span>
                <span className="text-3xl md:text-4xl font-display font-bold text-primary">
                  {prices.after}
                </span>
                <span className="text-sm text-muted-foreground">/ mes</span>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleSignup}
                  className="w-full px-6 py-3.5 bg-primary text-primary-foreground text-base font-bold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.45)] hover:shadow-[0_0_36px_rgba(212,175,55,0.75)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Crear cuenta y reclamar
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full px-6 py-3 bg-secondary/40 border border-border text-foreground font-medium rounded-lg hover:bg-secondary hover:border-primary/30 transition-all"
                >
                  Ya tengo cuenta
                </button>
              </div>

              <button
                type="button"
                onClick={dismiss}
                className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                No, gracias, seguir mirando
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
