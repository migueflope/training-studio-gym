"use client";

import { motion } from "framer-motion";
import { Award, Dumbbell, Heart, Trophy, MessageCircle } from "lucide-react";
import { whatsappUrlFor } from "@/lib/whatsapp";
import { FALLBACK_TRAINERS, type Trainer } from "./trainers-data";

export type { Trainer };

export default function EntrenadoresClient({
  whatsappNumber,
  trainers = FALLBACK_TRAINERS,
}: {
  whatsappNumber: string;
  trainers?: Trainer[];
}) {
  const visibleTrainers = trainers.filter((t) => t.enabled !== false);
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
                El equipo que te lleva al siguiente nivel
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight uppercase mb-6">
              Nuestros{" "}
              <span className="text-gradient-gold">Entrenadores</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Profesionales certificados con años de experiencia transformando
              cuerpos y vidas. Cada uno con un enfoque único para ayudarte a
              alcanzar tus metas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trainers */}
      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-6 space-y-16 md:space-y-24 max-w-6xl">
          {visibleTrainers.map((trainer, index) => {
            const reversed = index % 2 === 1;
            const message = `¡Hola! Quiero agendar una sesión con ${trainer.name} en Training Studio Gym 💪`;
            return (
              <motion.div
                key={trainer.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center ${
                  reversed ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* Image */}
                <div className="lg:col-span-2">
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary/30 aspect-[4/5] group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-primary font-bold text-sm">
                      <Award className="w-4 h-4" />
                      <span>{trainer.experience}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 space-y-6">
                  <div>
                    <p className="text-primary font-medium text-sm uppercase tracking-wider mb-2">
                      {trainer.specialty}
                    </p>
                    <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
                      {trainer.name}
                    </h2>
                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                      {trainer.intro}
                    </p>
                  </div>

                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    {trainer.bio.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-secondary/40 border border-border p-5">
                      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-primary" /> Método
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {trainer.methods.map((m) => (
                          <li key={m} className="flex gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-secondary/40 border border-border p-5">
                      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />{" "}
                        Certificaciones
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {trainer.certifications.map((c) => (
                          <li key={c} className="flex gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <a
                    href={whatsappUrlFor(whatsappNumber, message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:-translate-y-0.5 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Agendar sesión con {trainer.name.split(" ")[0]}
                  </a>
                </div>
              </motion.div>
            );
          })}
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
            <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              ¿No sabes con cuál empezar?
            </h2>
            <p className="text-muted-foreground mb-6">
              Agenda tu valoración física y te recomendamos el entrenador
              ideal según tu objetivo.
            </p>
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:-translate-y-0.5 transition-all"
            >
              Agendar Valoración
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
