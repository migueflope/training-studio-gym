"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

const IMAGE_URL = "/hero-bg.png";

export function HeroVideo({
  badge = "Tu mejor versión empieza hoy",
  subtitle = "El primer estudio de entrenamiento en Cartagena donde la tecnología se une al músculo para darte resultados medibles.",
}: {
  badge?: string;
  subtitle?: string;
} = {}) {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="container relative z-20 px-4 md:px-6 mt-16 md:mt-20">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-center">
          {/* LEFT — Slogan */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-7 text-center lg:text-left order-2 lg:order-1"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md"
            >
              <span className="text-primary font-medium text-sm">{badge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight uppercase leading-[1.05]"
            >
              Entrena la <span className="text-gradient-gold">mente</span>.
              <br />
              Transforma el <span className="text-gradient-gold">cuerpo</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              {subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                href="/planes"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Ver Planes <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contacto"
                className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-primary text-primary text-lg font-bold rounded-lg hover:bg-primary/10 transition-all flex items-center justify-center"
              >
                Agendar Valoración
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT — Video with glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative w-full max-w-[640px] mx-auto aspect-[9/16] sm:aspect-video lg:aspect-[4/5]">
              {/* Pulsing glow behind video */}
              <motion.div
                aria-hidden
                animate={{ opacity: [0.5, 0.85, 0.5], scale: [0.97, 1.03, 0.97] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-4 rounded-3xl blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.5) 0%, rgba(212,175,55,0.15) 50%, transparent 75%)",
                }}
              />

              {/* Frame */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_50px_rgba(212,175,55,0.25)]">
                <img
                  src={IMAGE_URL}
                  alt="Training Studio Gym"
                  className="w-full h-full object-cover"
                />

                {/* Subtle scanline / vignette overlay for "tech" feel */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.35) 100%), radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.45) 100%)",
                  }}
                />
              </div>

              {/* Tech corner brackets */}
              <span aria-hidden className="absolute -top-1 -left-1 w-6 h-6 border-l-2 border-t-2 border-primary/70 rounded-tl-md" />
              <span aria-hidden className="absolute -top-1 -right-1 w-6 h-6 border-r-2 border-t-2 border-primary/70 rounded-tr-md" />
              <span aria-hidden className="absolute -bottom-1 -left-1 w-6 h-6 border-l-2 border-b-2 border-primary/70 rounded-bl-md" />
              <span aria-hidden className="absolute -bottom-1 -right-1 w-6 h-6 border-r-2 border-b-2 border-primary/70 rounded-br-md" />
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown className="w-8 h-8 text-muted-foreground" />
      </motion.div>
    </section>
  );
}
