"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  Clock,
  Flame,
  ChevronDown,
  ArrowRight,
  Dumbbell,
} from "lucide-react";

type Routine = {
  id: string;
  title: string;
  focus: string;
  level: "Principiante" | "Intermedio" | "Avanzado";
  duration: string;
  description: string;
  isFree: boolean;
  exercises?: { name: string; sets: string; rest: string }[];
};

const routines: Routine[] = [
  {
    id: "fullbody-principiante",
    title: "Full Body para Principiantes",
    focus: "Cuerpo Completo",
    level: "Principiante",
    duration: "45 min",
    description:
      "Tu primera rutina. Aprende los movimientos básicos con técnica antes de subir peso.",
    isFree: true,
    exercises: [
      { name: "Sentadilla con peso corporal", sets: "3 x 12", rest: "60s" },
      { name: "Press en máquina", sets: "3 x 10", rest: "60s" },
      { name: "Remo en polea baja", sets: "3 x 10", rest: "60s" },
      { name: "Plancha frontal", sets: "3 x 30s", rest: "45s" },
      { name: "Caminata inclinada", sets: "10 min", rest: "—" },
    ],
  },
  {
    id: "hiit-quema",
    title: "HIIT Quema-Grasa Express",
    focus: "Cardio Metabólico",
    level: "Intermedio",
    duration: "25 min",
    description:
      "Circuito de alta intensidad pensado para esos días en que tienes media hora y querés sudar.",
    isFree: true,
    exercises: [
      { name: "Burpees", sets: "4 x 30s", rest: "20s" },
      { name: "Mountain climbers", sets: "4 x 30s", rest: "20s" },
      { name: "Jumping jacks", sets: "4 x 30s", rest: "20s" },
      { name: "Sentadilla con salto", sets: "4 x 20s", rest: "20s" },
      { name: "Plancha lateral alternada", sets: "3 x 30s", rest: "30s" },
    ],
  },
  {
    id: "core-anywhere",
    title: "Core en Cualquier Lugar",
    focus: "Abdomen y Estabilidad",
    level: "Principiante",
    duration: "20 min",
    description:
      "Sin equipo. Para casa, hotel, o cuando no podés ir al gym. Pura estabilidad de core.",
    isFree: true,
    exercises: [
      { name: "Plancha frontal", sets: "3 x 45s", rest: "30s" },
      { name: "Abdominales tipo bicicleta", sets: "3 x 20", rest: "30s" },
      { name: "Hollow hold", sets: "3 x 30s", rest: "30s" },
      { name: "Russian twists", sets: "3 x 20", rest: "30s" },
      { name: "Dead bug", sets: "3 x 12 / lado", rest: "30s" },
    ],
  },
  {
    id: "hipertrofia-pecho",
    title: "Hipertrofia de Pecho Avanzada",
    focus: "Pecho y Tríceps",
    level: "Avanzado",
    duration: "60 min",
    description:
      "Volumen serio: 5 ejercicios, técnicas de intensidad y series gigantes para ganancia muscular.",
    isFree: false,
  },
  {
    id: "fuerza-piernas",
    title: "Fuerza Pura para Piernas",
    focus: "Piernas y Glúteos",
    level: "Avanzado",
    duration: "75 min",
    description:
      "Sentadilla pesada, peso muerto, accesorios. Periodización 4 semanas para subir tu 1RM.",
    isFree: false,
  },
  {
    id: "espalda-volumen",
    title: "Espalda en Volumen",
    focus: "Espalda y Bíceps",
    level: "Intermedio",
    duration: "55 min",
    description:
      "Construcción de espalda en V. Incluye dominadas progresivas para llegar a hacerlas sin asistencia.",
    isFree: false,
  },
  {
    id: "movilidad-recovery",
    title: "Movilidad y Recovery",
    focus: "Flexibilidad y Recuperación",
    level: "Principiante",
    duration: "30 min",
    description:
      "Día activo de descanso. Movilidad articular, foam roller y estiramientos guiados.",
    isFree: false,
  },
  {
    id: "funcional-explosivo",
    title: "Funcional Explosivo",
    focus: "Potencia y Atletismo",
    level: "Avanzado",
    duration: "50 min",
    description:
      "Pliometría, kettlebells y movimientos compuestos para atletas que buscan rendimiento.",
    isFree: false,
  },
];

const levelColor: Record<Routine["level"], string> = {
  Principiante: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  Intermedio: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  Avanzado: "text-rose-400 bg-rose-400/10 border-rose-400/30",
};

function RoutineCard({ routine }: { routine: Routine }) {
  const [expanded, setExpanded] = useState(false);

  if (!routine.isFree) {
    return (
      <Link
        href="/planes"
        className="group relative rounded-2xl bg-secondary/30 border border-border overflow-hidden flex flex-col cursor-pointer hover:border-primary/40 transition-all"
      >
        {/* Locked overlay */}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-background/40 z-10 flex flex-col items-center justify-center gap-3 opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <p className="text-xs font-bold text-primary uppercase tracking-wider">
            Exclusivo Miembros
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary transition-colors">
            Únete para acceder{" "}
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>

        {/* Blurred content underneath */}
        <div className="p-6 flex-1 select-none pointer-events-none">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                levelColor[routine.level]
              }`}
            >
              {routine.level}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {routine.focus}
            </span>
          </div>
          <h3 className="text-lg font-display font-bold mb-2">
            {routine.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {routine.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {routine.duration}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-2xl bg-secondary/30 border border-primary/20 overflow-hidden flex flex-col hover:border-primary/40 transition-all">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                levelColor[routine.level]
              }`}
            >
              {routine.level}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {routine.focus}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Demo Gratis
          </span>
        </div>

        <h3 className="text-lg font-display font-bold mb-2">{routine.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {routine.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {routine.duration}
          </span>
          <span className="inline-flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" /> {routine.exercises?.length ?? 0}{" "}
            ejercicios
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary/15 border border-primary/40 text-primary font-bold text-sm hover:bg-primary/25 transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? "Ocultar" : "Ver Ejercicios"}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {expanded && routine.exercises && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-5 mt-5 border-t border-border">
                <ul className="space-y-2.5">
                  {routine.exercises.map((ex, i) => (
                    <li
                      key={ex.name}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ex.sets} · descanso {ex.rest}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function RutinasPage() {
  const freeRoutines = routines.filter((r) => r.isFree);
  const lockedRoutines = routines.filter((r) => !r.isFree);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md mb-6">
              <span className="text-primary font-medium text-sm">
                Biblioteca curada por nuestros entrenadores
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight uppercase mb-6">
              Rutinas para cada{" "}
              <span className="text-gradient-gold">objetivo</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Empieza gratis con nuestras rutinas demo. Desbloquea la biblioteca
              completa al unirte como miembro de Training Studio Gym.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Free Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl md:text-2xl font-display font-bold">
                Demos gratis para arrancar
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeRoutines.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <RoutineCard routine={r} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Locked Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-xl md:text-2xl font-display font-bold">
                Exclusivas para miembros
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedRoutines.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <RoutineCard routine={r} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/30 p-8 md:p-12"
          >
            <Dumbbell className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Desbloquea toda la biblioteca
            </h2>
            <p className="text-muted-foreground mb-6">
              Como miembro accedes a todas las rutinas, planes personalizados y
              seguimiento con tus entrenadores.
            </p>
            <Link
              href="/planes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:-translate-y-0.5 transition-all"
            >
              Ver Planes <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
