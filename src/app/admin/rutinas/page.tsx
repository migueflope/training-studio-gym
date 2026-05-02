import { Dumbbell, Sparkles } from "lucide-react";

export default function AdminRutinasPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Rutinas IA</h1>
        <p className="text-muted-foreground">
          Generación y gestión de rutinas asistidas por inteligencia artificial.
        </p>
      </div>

      <div className="glass-panel p-10 rounded-2xl border border-border text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <Dumbbell className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-3">Próximamente</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Estamos preparando esta sección para que puedas generar, revisar y
          asignar rutinas con IA directamente desde el panel.
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-medium">En desarrollo</span>
        </div>
      </div>
    </div>
  );
}
