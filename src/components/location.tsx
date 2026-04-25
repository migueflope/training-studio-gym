"use client";

export function Location() {
  return (
    <section id="horarios" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-white mb-8">Horarios y Ubicación</h2>
            
            <div className="mb-10">
              <h3 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Horarios</h3>
              <ul className="space-y-4 text-sm text-zinc-300">
                <li className="flex justify-between border-b border-white/5 pb-3">
                  <span>Lunes a Viernes</span>
                  <span className="text-right text-zinc-500">5am - 11am<br/>2:30pm - 9pm</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-3">
                  <span>Sábado</span>
                  <span className="text-right text-zinc-500">6:30am - 11am<br/>2:30pm - 6pm</span>
                </li>
                <li className="flex justify-between">
                  <span>Domingos y Festivos</span>
                  <span className="text-zinc-500">7am - 12pm</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Dirección</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Urb. Villa Sol 2 Mz. E22<br />
                Variante Mamonal Calle Principal<br />
                Cartagena, Colombia
              </p>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 rounded-2xl flex items-center justify-center p-8 text-zinc-500 text-sm border border-white/5 min-h-[300px]">
            [Mapa de Google Maps irá aquí]
          </div>
        </div>
      </div>
    </section>
  );
}
