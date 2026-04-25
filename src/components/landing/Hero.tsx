"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Video Background Placeholder */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
        <img
          src="/assets/hero-bg.jpg" // We'll add a script to generate this or use a placeholder
          alt="Atletas entrenando"
          className="w-full h-full object-cover opacity-50"
        />
        {/* Placeholder if image is missing */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
      </div>

      <div className="container relative z-20 px-4 md:px-6 flex flex-col items-center text-center mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md mb-4">
            <span className="text-primary font-medium text-sm">Tu mejor versión empieza hoy</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground uppercase">
            Entrena la <span className="text-gradient-gold">mente</span>.<br />
            Transforma el <span className="text-gradient-gold">cuerpo</span>.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed">
            El primer estudio de entrenamiento en Cartagena donde la tecnología se une al músculo para darte resultados medibles.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              href="/planes"
              className="btn-smooth w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] flex items-center justify-center gap-2"
            >
              Ver Planes <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contacto"
              className="btn-smooth w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-primary text-primary text-lg font-bold rounded-full hover:bg-primary/10 flex items-center justify-center"
            >
              Agendar Valoración
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown className="w-8 h-8 text-muted-foreground" />
      </motion.div>
    </section>
  );
}
