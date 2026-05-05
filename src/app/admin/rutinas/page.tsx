import { Dumbbell, Sparkles, User, Calendar, Target } from "lucide-react";

export default function AdminRutinasPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Rutinas IA</h1>
          <p className="text-muted-foreground">
            Generá rutinas personalizadas para cada socio con asistencia de IA.
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-bold px-2 py-1 bg-primary/15 text-primary rounded-full uppercase tracking-wider border border-primary/30">
          Preview
        </span>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-primary/30 bg-primary/5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-primary/15 rounded-lg text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-lg">Generar rutina nueva</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5" /> Socio
            </label>
            <select
              disabled
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm opacity-70 cursor-not-allowed"
            >
              <option>Elegí un socio…</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5" /> Objetivo
            </label>
            <select
              disabled
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm opacity-70 cursor-not-allowed"
            >
              <option>Hipertrofia</option>
              <option>Pérdida de peso</option>
              <option>Resistencia</option>
              <option>Fuerza</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5" /> Frecuencia semanal
            </label>
            <select
              disabled
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm opacity-70 cursor-not-allowed"
            >
              <option>3 días</option>
              <option>4 días</option>
              <option>5 días</option>
              <option>6 días</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
              <Dumbbell className="w-3.5 h-3.5" /> Nivel
            </label>
            <select
              disabled
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm opacity-70 cursor-not-allowed"
            >
              <option>Principiante</option>
              <option>Intermedio</option>
              <option>Avanzado</option>
            </select>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl opacity-60 cursor-not-allowed"
            title="En desarrollo"
          >
            <Sparkles className="w-4 h-4" /> Generar con IA
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-display font-bold text-lg mb-4">Rutinas generadas</h3>
        <div className="glass-panel p-10 rounded-2xl border border-dashed border-border text-center">
          <Dumbbell className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Todavía no generaste ninguna rutina. Cuando esté disponible, las rutinas
            aparecen acá ordenadas por fecha.
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-border p-5 flex items-start gap-3">
        <div className="p-2 bg-muted/30 rounded-lg shrink-0 text-muted-foreground">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-xs text-muted-foreground">
          Esta vista es una <strong className="text-foreground">preview</strong> de cómo va a verse la sección.
          La generación con IA todavía no está conectada — los selects y botones están deshabilitados a propósito.
        </p>
      </div>
    </div>
  );
}
