"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
}: {
  badge?: string;
  subtitle?: string;
} = {}) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Unmute on first interaction anywhere in the Hero
  const handleHeroClick = () => {
    if (isMuted) setIsMuted(false);
  };

  // Mute when scrolled out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting && videoRef.current) {
          setIsMuted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <section 
      ref={heroRef}
      onClick={handleHeroClick}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black cursor-pointer"
    >
      {/* ======================= BACKGROUND VIDEO ======================= */}
      <div className="absolute inset-0 z-0 bg-black">
        <video
          ref={videoRef}
          src="https://jigwpntqxywjwruftwix.supabase.co/storage/v1/object/public/gym-media/v14044g50000d7v6jpnog65lrihdsc9g.MP4"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 md:opacity-80"
        />
        {/* Futuristic Overlay / Glow for Video */}
        <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/40 to-background z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/85 to-background md:via-background/70 z-10" />
        {/* Mobile spotlight: subtle gold-dark radial behind the text block for legibility without breaking the futuristic feel */}
        <div className="md:hidden absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,_rgba(0,0,0,0.55)_0%,_rgba(0,0,0,0.25)_55%,_transparent_100%)] z-10" />
      </div>

      {/* ======================= FOREGROUND CONTENT ======================= */}
      <div className="container relative z-20 px-4 md:px-6 flex flex-col items-center text-center -mt-16 md:mt-0 pointer-events-none">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8 pointer-events-auto"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-block"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="px-5 py-2 rounded-full border border-primary/40 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            >
              <span className="text-primary font-medium text-sm tracking-widest uppercase drop-shadow-md">{badge}</span>
            </motion.div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground uppercase"
          >
            Entrena la <span className="text-gradient-gold">mente</span>.<br />
            Transforma el <span className="text-gradient-gold">cuerpo</span>.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
          >
            <Link
              href="/planes"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:shadow-[0_0_40px_rgba(212,175,55,0.8)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {/* Technological hover shine effect */}
              <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12" />
              Ver Planes <ArrowRight className="w-5 h-5 relative z-10" />
            </Link>
            <Link
              href="/contacto"
              className="w-full sm:w-auto px-8 py-4 bg-black/60 backdrop-blur-md border-2 border-primary text-primary text-lg font-bold rounded-lg hover:bg-primary/20 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)]"
            >
              Agendar Valoración
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ======================= AUDIO CONTROL ======================= */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: [
            "0 0 0px rgba(212,175,55,0.0)",
            "0 0 18px rgba(212,175,55,0.45)",
            "0 0 0px rgba(212,175,55,0.0)",
          ],
        }}
        transition={{
          delay: 1.5,
          boxShadow: { repeat: Infinity, duration: 2.4, ease: "easeInOut" },
        }}
        onClick={(e) => {
          e.stopPropagation();
          setIsMuted(!isMuted);
        }}
        aria-label={isMuted ? "Activar sonido" : "Silenciar"}
        className="absolute bottom-24 right-4 md:bottom-12 md:right-12 z-30 flex items-center justify-center gap-0 md:gap-2 w-12 h-12 md:w-auto md:h-auto p-0 md:px-5 md:py-3 bg-black/70 backdrop-blur-md border border-primary/50 rounded-full text-white hover:bg-primary/30 transition-colors hover:shadow-[0_0_25px_rgba(212,175,55,0.55)] group pointer-events-auto"
      >
        {isMuted ? (
          <>
            <VolumeX className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-sm font-medium">Activar sonido</span>
          </>
        ) : (
          <>
            <Volume2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-sm font-medium">Silenciar</span>
          </>
        )}
      </motion.button>

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
