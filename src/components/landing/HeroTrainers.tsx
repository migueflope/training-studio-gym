"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

export function HeroTrainers({
  badge = "Tu mejor versión empieza hoy",
  subtitle = "El primer estudio de entrenamiento en Cartagena donde la tecnología se une al músculo para darte resultados medibles.",
}: {
  badge?: string;
  subtitle?: string;
} = {}) {
  // Each title word animates in independently for that "techy" reveal feel.
  const titleWords = [
    { text: "Entrena", gradient: false },
    { text: "la", gradient: false },
    { text: "mente.", gradient: true },
  ];
  const titleWords2 = [
    { text: "Transforma", gradient: false },
    { text: "el", gradient: false },
    { text: "cuerpo.", gradient: true },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Subtle base lighting that lets the particles breathe */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="container relative z-20 px-4 md:px-6 mt-16 md:mt-20">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">
          {/* LEFT — Slogan + CTAs */}
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

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight uppercase leading-[1.05]">
              <span className="block">
                {titleWords.map((w, i) => (
                  <motion.span
                    key={`a-${i}`}
                    initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.35 + i * 0.1, duration: 0.6 }}
                    className={`inline-block mr-3 ${w.gradient ? "text-gradient-gold" : ""}`}
                  >
                    {w.text}
                  </motion.span>
                ))}
              </span>
              <span className="block">
                {titleWords2.map((w, i) => (
                  <motion.span
                    key={`b-${i}`}
                    initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.65 + i * 0.1, duration: 0.6 }}
                    className={`inline-block mr-3 ${w.gradient ? "text-gradient-gold" : ""}`}
                  >
                    {w.text}
                  </motion.span>
                ))}
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              {subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.6 }}
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

          {/* RIGHT — Trainers photo with glow + float */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
            className="relative flex items-center justify-center order-1 lg:order-2"
          >
            <div className="relative w-full max-w-[560px] aspect-[1280/859]">
              {/* Pulsing radial glow behind subjects */}
              <motion.div
                aria-hidden
                animate={{
                  opacity: [0.55, 0.85, 0.55],
                  scale: [0.95, 1.05, 0.95],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 55%, rgba(212,175,55,0.45) 0%, rgba(212,175,55,0.15) 40%, transparent 70%)",
                }}
              />
              {/* Secondary cool accent for tech feel */}
              <motion.div
                aria-hidden
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -inset-6 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.18) 0%, transparent 60%)",
                }}
              />

              {/* Floating image */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full h-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/entrenadores-juntos.png"
                  alt="Entrenadores Training Studio Gym"
                  className="w-full h-full object-contain drop-shadow-[0_25px_45px_rgba(212,175,55,0.35)]"
                  draggable={false}
                />
              </motion.div>

              {/* Decorative corner brackets, subtle tech-feel */}
              <span aria-hidden className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-primary/60 rounded-tl-md" />
              <span aria-hidden className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-primary/60 rounded-tr-md" />
              <span aria-hidden className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-primary/60 rounded-bl-md" />
              <span aria-hidden className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-primary/60 rounded-br-md" />
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
