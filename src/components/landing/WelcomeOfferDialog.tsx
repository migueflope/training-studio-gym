"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronRight, Zap } from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

const WELCOME_SEEN_KEY = "ts:welcome_seen";
const PROMO_NEXT = "/";

interface MonthlyPricing {
  price: number;
  discount_percentage: number;
}

interface WelcomeOfferDialogProps {
  mensualidad: MonthlyPricing;
  mode: "welcome" | "planes-gate";
  open?: boolean;
  onClose?: (reason: "dismiss" | "action") => void;
}

function formatCop(n: number) {
  return `$${n.toLocaleString("es-CO")}`;
}

export function WelcomeOfferDialog({
  mensualidad,
  mode,
  open: controlledOpen,
  onClose,
}: WelcomeOfferDialogProps) {
  const [autoOpen, setAutoOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { openAuth } = useAuthModal();

  const isOpen = mode === "welcome" ? autoOpen : !!controlledOpen;

  useEffect(() => {
    setIsMounted(true);
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

  // Pricing calculation
  const finalPrice = Math.round(mensualidad.price * (1 - mensualidad.discount_percentage / 100));
  const priceBefore = formatCop(mensualidad.price);
  const priceAfter = formatCop(finalPrice);

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-[20px]"
          onClick={dismiss}
        >
          {/* Main Card */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0, rotateX: 10 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.9, y: 30, opacity: 0, rotateX: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#050505] rounded-[2.5rem] border border-white/5 shadow-[0_0_80px_-15px_rgba(212,175,55,0.25)] overflow-hidden flex flex-col"
          >
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[100px] pointer-events-none z-0" />

            {/* Close Button */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-black/60 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hero Image Section (Top) */}
            <div className="relative w-full h-64 overflow-hidden z-10 group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10" />
              <img 
                src="/welcome-offer-clean.png" 
                alt="Gym"
                className="absolute inset-0 w-full h-full object-cover filter brightness-75 group-hover:scale-110 group-hover:brightness-100 transition-all duration-[3s] ease-out"
              />
              <div className="absolute top-5 left-5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-primary/20">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest drop-shadow-md">
                  Beneficio Único
                </span>
              </div>
            </div>

            {/* Content Section (Bottom) */}
            <div className="relative px-8 pb-10 text-center -mt-8 z-20">
              <motion.h2 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-3xl font-display font-extrabold tracking-tight text-white mb-3"
              >
                EL FUTURO DEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">FITNESS</span>
              </motion.h2>

              <motion.p 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-sm text-white/60 mb-6 font-light leading-relaxed max-w-[280px] mx-auto"
              >
                Inicia tu transformación hoy. Regístrate y obtén un <span className="text-white font-semibold">10% OFF</span> en tu primera mensualidad.
              </motion.p>

              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex items-end justify-center gap-3 mb-8"
              >
                <span className="text-lg text-white/30 line-through decoration-white/20 mb-1">{priceBefore}</span>
                <span className="text-5xl font-display font-bold text-white drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">{priceAfter}</span>
                <span className="text-xs text-white/40 uppercase tracking-widest mb-2">/mes</span>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-4"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <button
                    onClick={handleSignup}
                    className="relative w-full group overflow-hidden rounded-full bg-gradient-to-r from-primary to-[#ffdf70] px-6 py-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <span className="relative z-10 text-black font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                      Crear cuenta y reclamar <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                  </button>
                </motion.div>

                <button
                  onClick={handleLogin}
                  className="text-xs text-white/40 hover:text-white uppercase tracking-widest transition-colors pt-2"
                >
                  Ya tengo cuenta
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
