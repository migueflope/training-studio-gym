"use client";

export function Features() {
  const features = [
    {
      title: "Entrenamiento Personalizado",
      description: "Entrenadores certificados dedicados a corregir tu técnica y maximizar tus resultados.",
    },
    {
      title: "Tecnología Inteligente",
      description: "Rutinas asistidas por IA y seguimiento preciso de tu progreso desde tu celular.",
    },
    {
      title: "Resultados Medibles",
      description: "Valoraciones físicas periódicas para ajustar tu plan y garantizar tus metas.",
    },
    {
      title: "Comunidad",
      description: "Un ambiente donde todos se apoyan, con horarios amplios y flexibles.",
    },
  ];

  return (
    <section id="servicios" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-medium text-white mb-4">No somos un gimnasio tradicional.</h2>
          <p className="text-zinc-400 max-w-2xl text-base leading-relaxed">
            Un estudio especializado donde la tecnología y el entrenamiento se unen. Herramientas de primer nivel para superar tus límites.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col border-t border-white/5 pt-6">
              <h3 className="text-lg font-medium text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
