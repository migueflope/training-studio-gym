"use client";

import { motion } from "framer-motion";
import { Award, ChevronRight } from "lucide-react";
import Link from "next/link";

export type TrainerCardData = {
  name: string;
  specialty: string;
  experience: string;
  bio: string;
  image: string;
  enabled: boolean;
};

const FALLBACK_TRAINERS: TrainerCardData[] = [
  {
    name: "Camilo Ortiz",
    specialty: "Hipertrofia y Fuerza",
    experience: "8 años de experiencia",
    bio: "Especialista en biomecánica y desarrollo muscular. Si tu objetivo es ganar masa muscular de forma efectiva y segura, Camilo diseñará la estrategia perfecta para tu cuerpo.",
    image: "/images/camilo-ortiz.png",
    enabled: true,
  },
  {
    name: "Juan Carlos Bork",
    specialty: "Funcional y Pérdida de Peso",
    experience: "10 años de experiencia",
    bio: "Experto en acondicionamiento físico integral. Transforma tu metabolismo con rutinas dinámicas que combinan fuerza y resistencia cardiovascular.",
    image: "/images/juan-carlos-bork.png",
    enabled: true,
  },
];

export function Trainers({
  trainers = FALLBACK_TRAINERS,
}: {
  trainers?: TrainerCardData[];
} = {}) {
  const visible = trainers.filter((t) => t.enabled);
  return (
    <section className="py-24 bg-card relative">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Conoce a tus <span className="text-primary">Entrenadores</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Profesionales certificados dedicados a guiarte en cada repetición para asegurar que alcances tus metas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {visible.map((trainer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative overflow-hidden rounded-2xl bg-secondary/30 border border-border flex flex-col md:flex-row"
            >
              <div className="md:w-2/5 h-64 md:h-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-background/20 z-10" />
                <img
                  src={trainer.image}
                  alt={trainer.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Fallback pattern if image is missing */}
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary to-primary/20 opacity-50 mix-blend-overlay" />
              </div>
              
              <div className="p-8 md:w-3/5 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                  <Award className="w-4 h-4" />
                  <span>{trainer.experience}</span>
                </div>
                <h3 className="text-2xl font-display font-bold mb-1">{trainer.name}</h3>
                <p className="text-muted-foreground font-medium mb-4">{trainer.specialty}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                  {trainer.bio}
                </p>
                
                <Link href="/entrenadores" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                  Ver Perfil Completo <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
