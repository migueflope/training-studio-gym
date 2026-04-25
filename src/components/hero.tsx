"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-white mb-6 leading-[1.1]">
            Entrena la mente.<br />
            <span className="text-zinc-500">Transforma el cuerpo.</span>
          </h1>
          <p className="text-base md:text-lg text-zinc-400 mb-10 leading-relaxed max-w-xl">
            Training Studio Gym no es un gimnasio más. Es tu centro de entrenamiento personalizado en la Variante Mamonal. Resultados medibles, tecnología y comunidad en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="#precios" className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors text-sm">
              Ver Planes
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#horarios" className="inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/20 px-6 py-3 rounded-lg font-medium hover:bg-white/5 transition-colors text-sm">
              Conocer Horarios
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
