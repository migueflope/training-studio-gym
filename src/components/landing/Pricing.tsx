"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { PlanPricingConfig } from "@/lib/cms";
import { VerPlanesCTA } from "./VerPlanesCTA";

const MAIN_SERVICES = [
  {
    id: "mensualidad" as const,
    name: "Mensualidad del Gym",
    period: null,
    features: [
      "Acceso ilimitado a las instalaciones",
      "Uso de todas las máquinas",
      "Horarios flexibles",
    ],
  },
  {
    id: "quincenal" as const,
    name: "Quincena del Gym",
    period: "Pago cada 15 días",
    features: [
      "Acceso ilimitado por 15 días",
      "Uso de todas las máquinas",
      "Pagá tu rutina por quincenas",
    ],
  },
  {
    id: "sesion" as const,
    name: "Sesión de Entrenamiento",
    period: null,
    features: ["Pase por 1 día", "Acceso a máquinas", "Ideal para probar"],
  },
  {
    id: "valoracion" as const,
    name: "Valoración Física",
    period: null,
    features: [
      "Análisis de composición corporal",
      "Medidas y peso",
      "Definición de objetivos",
    ],
  },
];

function formatCop(n: number) {
  return `$${n.toLocaleString("es-CO")}`;
}

function computeFinal(price: number, discount: number) {
  return Math.max(0, Math.round(price * (1 - discount / 100)));
}

export function Pricing({
  planPricing,
  isLoggedIn = false,
}: {
  planPricing: PlanPricingConfig;
  isLoggedIn?: boolean;
}) {
  return (
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary font-bold uppercase tracking-wider text-sm mb-2 block">Lo Esencial</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Nuestros <span className="text-primary">Servicios Principales</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-16">
            Todo lo que necesitas para comenzar tu transformación.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {MAIN_SERVICES.map((service, index) => {
              const pricing = planPricing[service.id];
              const price = pricing.price;
              const discount = pricing.discount_percentage;
              const final = computeFinal(price, discount);
              const hasDiscount = discount > 0;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-panel rounded-2xl p-8 border border-border flex flex-col justify-between text-center group hover:border-primary/50 transition-all h-full"
                >
                  <div>
                    {hasDiscount && (
                      <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        Ahorro
                      </div>
                    )}
                    {/* Fixed-height rows (title / discount / price / note) so the
                        four cards stay perfectly aligned even when one title
                        wraps or a card has no discount or period note. */}
                    <h3 className="text-xl font-bold font-display mb-6 text-foreground/90 min-h-14 flex items-center justify-center">
                      {service.name}
                    </h3>
                    <div className="flex flex-col items-center gap-1 mb-8">
                      <div
                        className={`flex items-center gap-2 ${hasDiscount ? "" : "invisible"}`}
                      >
                        <span className="text-muted-foreground line-through text-sm font-medium">
                          {formatCop(price)}
                        </span>
                        <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full">
                          -{discount}% OFF
                        </span>
                      </div>
                      <span className="text-4xl font-bold text-primary tracking-tighter">
                        {formatCop(final)}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold mt-1 ${
                          service.period
                            ? "text-muted-foreground"
                            : hasDiscount
                              ? "text-primary/80"
                              : "invisible"
                        }`}
                      >
                        {service.period ??
                          (hasDiscount ? "Pagando en la página" : " ")}
                      </span>
                    </div>

                    <ul className="space-y-4 mb-8 text-left">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary shrink-0" />
                          <span className="text-muted-foreground text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <VerPlanesCTA
                    href={`/planes?plan=${service.id}&step=2`}
                    isLoggedIn={isLoggedIn}
                    mensualidad={planPricing.mensualidad}
                    className="w-full py-4 rounded-lg font-bold text-center border border-primary/30 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all mt-auto"
                  >
                    Seleccionar Plan
                  </VerPlanesCTA>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <VerPlanesCTA
              href="/planes"
              isLoggedIn={isLoggedIn}
              mensualidad={planPricing.mensualidad}
              className="inline-flex items-center justify-center px-10 py-5 bg-primary text-primary-foreground text-lg font-bold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:-translate-y-1 transition-all"
            >
              Ver Paquetes Completos
            </VerPlanesCTA>
          </div>
        </div>
      </div>
    </section>
  );
}
