"use client";

export function Pricing() {
  return (
    <section id="precios" className="py-24 px-6 border-t border-white/5 bg-zinc-950/50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-medium text-white mb-4">Planes de Entrenamiento</h2>
          <p className="text-zinc-400 text-base">Opciones flexibles diseñadas para tus objetivos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl border border-white/10 bg-black flex flex-col">
            <h3 className="text-lg font-medium text-white mb-2">Mensualidad Gym</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-medium text-white">$60.000</span>
              <span className="text-sm text-zinc-500 line-through">$90.000</span>
            </div>
            <ul className="text-sm text-zinc-400 space-y-3 mb-8 flex-1">
              <li>Acceso total a instalaciones</li>
              <li>Uso de máquinas</li>
              <li>Sin límite de tiempo</li>
            </ul>
            <button className="w-full py-2.5 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors text-sm">
              Seleccionar
            </button>
          </div>

          {/* Card 2 - Destacada */}
          <div className="p-8 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col relative">
            <div className="absolute top-0 right-6 transform -translate-y-1/2">
              <span className="bg-primary text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                Recomendado
              </span>
            </div>
            <h3 className="text-lg font-medium text-white mb-1">Paquete 20 Clases</h3>
            <p className="text-xs text-primary mb-2">5 días a la semana</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-medium text-white">$250.000</span>
              <span className="text-sm text-zinc-500 line-through">$400.000</span>
            </div>
            <ul className="text-sm text-zinc-400 space-y-3 mb-8 flex-1">
              <li>Entrenador personal asignado</li>
              <li>Seguimiento diario</li>
              <li>Resultados acelerados</li>
            </ul>
            <button className="w-full py-2.5 rounded-lg bg-primary text-black font-medium hover:bg-primary/90 transition-colors text-sm">
              Seleccionar
            </button>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl border border-white/10 bg-black flex flex-col">
            <h3 className="text-lg font-medium text-white mb-2">Valoración Física</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-medium text-white">$30.000</span>
              <span className="text-sm text-zinc-500 line-through">$60.000</span>
            </div>
            <ul className="text-sm text-zinc-400 space-y-3 mb-8 flex-1">
              <li>Medición de grasa</li>
              <li>Análisis muscular</li>
              <li>Plan de metas inicial</li>
            </ul>
            <button className="w-full py-2.5 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors text-sm">
              Seleccionar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
