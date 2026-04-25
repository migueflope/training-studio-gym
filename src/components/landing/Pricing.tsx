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
          <span className="text-destructive font-bold uppercase tracking-wider text-sm mb-2 block">Oferta por tiempo limitado</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Invierte en tu <span className="text-primary">Transformación</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus metas. Precios con descuento especial solo por esta semana.
          </p>
        </div>

        {/* Custom Packages (Highlighted) */}
        <div className="mb-16">
          <h3 className="text-2xl font-display font-bold text-center mb-10">Entrenamiento Personalizado</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {customPackages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative glass-panel rounded-2xl p-8 flex flex-col ${pkg.isPopular ? 'border-primary shadow-[0_0_30px_rgba(212,175,55,0.15)] transform md:-translate-y-4' : ''}`}
              >
                {pkg.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Más Popular
                  </div>
                )}
                <div className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full rotate-12 shadow-lg">
                  {pkg.discount}
                </div>
                
                <h4 className="text-2xl font-bold font-display mb-1">{pkg.name}</h4>
                <p className="text-muted-foreground mb-6">{pkg.subtitle}</p>
                
                <div className="mb-6">
                  <span className="text-muted-foreground line-through text-lg block">{pkg.originalPrice}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground font-mono">{pkg.price}</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/planes"
                  className={`w-full py-4 rounded-lg font-bold text-center transition-all ${pkg.isPopular ? 'bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
                >
                  Seleccionar Plan
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Basic Services */}
        <div>
          <h3 className="text-2xl font-display font-bold text-center mb-10">Servicios Básicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {mainServices.map((service, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {service.discount}
                </div>
                <h4 className="text-lg font-bold font-display mb-4">{service.name}</h4>
                <div className="mb-4">
                  <span className="text-muted-foreground line-through text-sm mr-2">{service.originalPrice}</span>
                  <span className="text-2xl font-bold text-primary font-mono">{service.price}</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
