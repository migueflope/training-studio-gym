"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

const mainServices = [
  {
    name: "Mensualidad del Gym",
    originalPrice: "$90.000",
    price: "$60.000",
    discount: "-33% OFF",
    features: ["Acceso ilimitado a las instalaciones", "Uso de todas las máquinas", "Horarios flexibles"]
  },
  {
    name: "Sesión de Entrenamiento",
    originalPrice: "$10.000",
    price: "$5.000",
    discount: "-50% OFF",
    features: ["Pase por 1 día", "Acceso a máquinas", "Ideal para probar"]
  },
  {
    name: "Valoración Física",
    originalPrice: "$60.000",
    price: "$30.000",
    discount: "-50% OFF",
    features: ["Análisis de composición corporal", "Medidas y peso", "Definición de objetivos"]
  }
];

const customPackages = [
  {
    name: "Paquete 12 Clases",
    subtitle: "3 días a la semana",
    originalPrice: "$240.000",
    price: "$150.000",
    discount: "AHORRA $90.000",
    features: ["12 sesiones personalizadas", "Rutina adaptada por IA", "Valoración incluida", "Soporte de entrenadores"]
  },
  {
    name: "Paquete 15 Clases",
    subtitle: "4 días a la semana",
    originalPrice: "$320.000",
    price: "$200.000",
    discount: "AHORRA $120.000",
    isPopular: true,
    features: ["15 sesiones personalizadas", "Rutina premium adaptada", "Valoración física mensual", "Prioridad en reservas"]
  },
  {
    name: "Paquete 20 Clases",
    subtitle: "5 días a la semana",
    originalPrice: "$400.000",
    price: "$250.000",
    discount: "AHORRA $150.000",
    features: ["20 sesiones personalizadas", "Resultados acelerados", "Valoración física quincenal", "Acceso total a la app"]
  }
];

export function Pricing() {
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {mainServices.map((service, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-panel rounded-2xl p-8 border border-border flex flex-col justify-center items-center text-center group hover:border-primary/50 transition-all"
              >
                <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {service.discount}
                </div>
                <h3 className="text-xl font-bold font-display mb-4 text-foreground/90">{service.name}</h3>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-muted-foreground line-through text-sm font-medium">{service.originalPrice}</span>
                  <span className="text-4xl font-bold text-primary tracking-tighter">{service.price}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/planes"
              className="inline-flex items-center justify-center px-10 py-5 bg-primary text-primary-foreground text-lg font-bold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:-translate-y-1 transition-all"
            >
              Ver Paquetes Completos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
