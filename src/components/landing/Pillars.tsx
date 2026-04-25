"use client";

import { motion } from "framer-motion";
import { User, Cpu, LineChart, Users } from "lucide-react";

const pillars = [
  {
    icon: <User className="w-8 h-8 text-primary" />,
    title: "Entrenamiento Personalizado",
    description: "2 entrenadores certificados dedicados a guiar tu técnica y maximizar tus resultados."
  },
  {
    icon: <Cpu className="w-8 h-8 text-primary" />,
    title: "Tecnología Aplicada",
    description: "App con IA, rutinas digitales y seguimiento detallado desde tu celular."
  },
  {
    icon: <LineChart className="w-8 h-8 text-primary" />,
    title: "Resultados Medibles",
    description: "Valoración física constante para ajustar metas y asegurar el progreso."
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Comunidad",
    description: "Horarios amplios y un ambiente familiar que te empuja a superarte cada día."
  }
];

export function Pillars() {
  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#222222_1px,transparent_1px),linear-gradient(to_bottom,#222222_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      
      <div className="container px-4 md:px-6 relative z-10 mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            ¿Por qué <span className="text-primary">Training Studio?</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            No somos un gimnasio convencional. Somos un estudio donde fusionamos el entrenamiento duro con las herramientas tecnológicas necesarias para alcanzar tu meta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                {pillar.icon}
              </div>
              <h3 className="text-xl font-bold font-display mb-3">{pillar.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
