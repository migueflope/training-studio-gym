"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useHeroOpacity } from "./HeroOpacityContext";
import { VerPlanesCTA } from "./VerPlanesCTA";
import type { PlanPricingConfig } from "@/lib/cms";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Time between each element appearing
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 1,
    },
  },
};

export function Hero({
  badge = "Tu mejor versión empieza hoy",
  subtitle = "El primer estudio de entrenamiento en Cartagena donde la tecnología se une al músculo para darte resultados medibles.",
  isAdmin = false,
  hasActiveMembership = false,
  isLoggedIn = false,
  mensualidadPricing,
}: {
  badge?: string;
  subtitle?: string;
  isAdmin?: boolean;
  hasActiveMembership?: boolean;
  isLoggedIn?: boolean;
  mensualidadPricing?: PlanPricingConfig["mensualidad"];
} = {}) {
  const ctaHref = isAdmin ? "/admin" : hasActiveMembership ? "/dashboard" : "/contacto";
  const ctaLabel = isAdmin
    ? "Ir a panel de admin"
    : hasActiveMembership
      ? "Ir a mi panel"
      : "Agendar Valoración";
  const { mobile: opacityMobile, desktop: opacityDesktop } = useHeroOpacity();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* ======================= BACKGROUND IMAGE ======================= */}
      <div className="absolute inset-0 z-0 bg-black">
        <img
          src="/hero-bg.png"
          alt="Training Studio Gym"
          style={{
            objectPosition: "center 35%",
            opacity: (isMobile ? opacityMobile : opacityDesktop) / 100,
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-50 md:opacity-80"
        />
        {/* Futuristic Overlay / Glow for Video — toned down so the video
            can actually shine when the admin sets a high opacity. */}
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/85 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/30 to-background/85 z-10" />
        {/* Mobile spotlight: subtle dark radial behind the text block for legibility without ahogando el video */}
        <div className="md:hidden absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_45%,_rgba(0,0,0,0.4)_0%,_rgba(0,0,0,0.15)_55%,_transparent_100%)] z-10" />
      </div>

      {/* ======================= FOREGROUND CONTENT ======================= */}
      <div className="container relative z-20 px-2 md:px-6 flex flex-col items-center text-center pointer-events-none">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-5 md:space-y-8 pointer-events-auto"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-block"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="px-4 py-1.5 md:px-5 md:py-2 rounded-full border border-primary/40 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            >
              <span className="text-primary font-medium text-xs md:text-sm tracking-widest uppercase drop-shadow-md">{badge}</span>
            </motion.div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            style={{ letterSpacing: "-0.05em" }}
            className="text-[2.35rem] leading-[1.05] md:text-7xl md:leading-tight font-display font-black text-foreground uppercase"
          >
            Entrena la <span className="text-gradient-gold">mente</span>.<br />
            Transforma el <span className="text-gradient-gold">cuerpo</span>.
          </motion.h1>

          <motion.div
            variants={itemVariants}
            className="flex justify-center"
          >
            <p
              style={{
                backdropFilter: "blur(40px) saturate(140%)",
                WebkitBackdropFilter: "blur(40px) saturate(140%)",
              }}
              className="text-balance text-sm md:text-base text-foreground/95 font-body max-w-[17rem] md:max-w-sm leading-snug px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-black/45 border border-white/10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.5)]"
            >
              {subtitle}
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-6 pt-2 md:pt-8"
          >
            <VerPlanesCTA
              href="/planes"
              isLoggedIn={isLoggedIn}
              mensualidad={mensualidadPricing ?? { price: 90000, discount_percentage: 33 }}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:shadow-[0_0_40px_rgba(212,175,55,0.8)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {/* Technological hover shine effect */}
              <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12" />
              Ver Planes <ArrowRight className="w-5 h-5 relative z-10" />
            </VerPlanesCTA>
            <Link
              href={ctaHref}
              className="w-full sm:w-auto px-8 py-4 bg-black/60 backdrop-blur-md border-2 border-primary text-primary text-lg font-bold rounded-lg hover:bg-primary/20 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)]"
            >
              {ctaLabel}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown className="w-8 h-8 text-primary/70 drop-shadow-md" />
      </motion.div>
    </section>
  );
}
