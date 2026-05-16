"use client";

import { useEffect, useState, useCallback } from "react";
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

  // Pricing calculation
  const finalPrice = Math.round(mensualidad.price * (1 - mensualidad.discount_percentage / 100));
  const priceBefore = formatCop(mensualidad.price);
  const priceAfter = formatCop(finalPrice);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-[24px]"
          onClick={dismiss}
        >
          {/* Main Card */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0, rotateX: 10 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.9, y: 30, opacity: 0, rotateX: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl bg-black rounded-[2rem] md:rounded-[3rem] border border-primary/30 shadow-[0_0_100px_-10px_rgba(212,175,55,0.3)] overflow-hidden perspective-1000 flex flex-col md:flex-row"
          >
            {/* Animated Glow behind everything */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/10 blur-[120px] pointer-events-none z-0" />
            
            {/* Glowing borders */}
            <div className="absolute inset-0 pointer-events-none rounded-[2rem] md:rounded-[3rem] border border-white/5 z-20" />

            {/* Close Button */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/80 hover:scale-110 hover:border-primary/50 transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Futuristic Image Hero Area (Left Side) */}
            <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-[300px] md:min-h-[600px] overflow-hidden z-10 group">
              {/* Fade to black gradient for smooth blending on mobile, and right gradient for desktop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent md:bg-none md:bg-gradient-to-r md:from-transparent md:via-black/20 md:to-black z-10" />
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
              
              <img 
                src="/welcome-offer.png" 
                alt="Welcome to Training Studio Gym"
                className="absolute inset-0 w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-[3s] ease-out"
              />
              
              {/* Floating Badge */}
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-primary/40 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest drop-shadow-md">
                  Oferta Exclusiva
                </span>
              </div>
            </div>

            {/* Content Area (Right Side) */}
            <div className="relative w-full md:w-1/2 px-6 md:px-12 py-10 md:py-16 flex flex-col justify-center text-center md:text-left z-20">
              <h2 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-white mb-4 leading-[1.1] drop-shadow-lg">
                EL FUTURO DEL <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary">
                  FITNESS
                </span>
              </h2>

              <p className="text-base md:text-lg text-muted-foreground max-w-sm mx-auto md:mx-0 mb-10 leading-relaxed">
                Desbloquea tu potencial. Regístrate ahora y llévate un <span className="text-white font-bold">10% OFF</span> en tu primera mensualidad. Sin caducidad.
              </p>

              {/* Pricing Display */}
              <div className="relative flex items-center justify-center md:justify-start gap-6 mb-10 bg-white/5 border border-white/10 py-5 px-8 rounded-3xl backdrop-blur-md">
                <div className="flex flex-col items-end md:items-start">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Precio Regular</span>
                  <span className="text-xl md:text-2xl text-muted-foreground line-through decoration-primary/50 decoration-2">
                    {priceBefore}
                  </span>
                </div>
                
                <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
                
                <div className="flex flex-col items-start relative">
                  <span className="absolute -top-4 left-0 flex items-center gap-1 text-[10px] md:text-xs font-bold text-black bg-primary px-2.5 py-0.5 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)]">
                    <Zap className="w-3 h-3 fill-black" />
                    ¡HOY!
                  </span>
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold mb-1 opacity-0">.</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl md:text-5xl font-display font-bold text-white drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                      {priceAfter}
                    </span>
                    <span className="text-sm md:text-base text-muted-foreground">/mes</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 md:space-y-5">
                <button
                  onClick={handleSignup}
                  className="group relative w-full overflow-hidden rounded-2xl bg-primary px-8 py-5 transition-all hover:scale-[1.02] hover:shadow-[0_0_50px_-10px_rgba(212,175,55,0.8)] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                  <div className="relative flex items-center justify-center gap-3">
                    <span className="text-lg font-bold text-black uppercase tracking-wide">Crear cuenta y reclamar</span>
                    <ChevronRight className="w-6 h-6 text-black transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                <div className="flex items-center justify-between px-2 pt-2">
                  <button
                    onClick={handleLogin}
                    className="text-base font-medium text-white/70 hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    Ya tengo cuenta
                  </button>
                  <button
                    onClick={dismiss}
                    className="text-base font-medium text-white/40 hover:text-white transition-colors"
                  >
                    Seguir mirando
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
