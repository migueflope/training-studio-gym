"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Loader2 } from "lucide-react";
import { addExerciseToDay } from "../actions";
import type { ExerciseLibItem } from "./types";

interface Props {
  library: ExerciseLibItem[];
  activeDayId: string | null;
  disabled: boolean;
}

export function ExercisePicker({ library, activeDayId, disabled }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const muscleGroups = useMemo(() => {
    const set = new Set(library.map((e) => e.muscle_group));
    return Array.from(set).sort();
  }, [library]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return library.filter((ex) => {
      if (muscleFilter && ex.muscle_group !== muscleFilter) return false;
      if (!q) return true;
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.muscle_group.toLowerCase().includes(q) ||
        (ex.equipment ?? "").toLowerCase().includes(q)
      );
    });
  }, [library, query, muscleFilter]);

  const handleAdd = (exerciseId: string) => {
    if (!activeDayId) return;
    setPendingId(exerciseId);
    startTransition(async () => {
      const r = await addExerciseToDay(activeDayId, exerciseId);
      if (!r.ok) alert(r.error);
      router.refresh();
      setPendingId(null);
    });
  };

  return (
    <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col h-[80vh]">
      <h3 className="font-display font-bold text-lg mb-3">Biblioteca</h3>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ejercicio..."
          className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <FilterChip label="Todos" active={muscleFilter === null} onClick={() => setMuscleFilter(null)} />
        {muscleGroups.map((m) => (
          <FilterChip
            key={m}
            label={m}
            active={muscleFilter === m}
            onClick={() => setMuscleFilter(muscleFilter === m ? null : m)}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sin resultados</p>
        ) : (
          filtered.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center gap-3 p-3 bg-secondary/30 border border-border rounded-xl hover:border-primary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                {ex.muscle_group.slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-tight truncate">{ex.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {ex.muscle_group}
                  {ex.equipment ? ` · ${ex.equipment}` : ""}
                </p>
              </div>
              <button
                onClick={() => handleAdd(ex.id)}
                disabled={disabled || pendingId === ex.id}
                className="shrink-0 p-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={`Añadir ${ex.name}`}
                title={disabled ? "Seleccioná un día primero" : `Añadir a la rutina`}
              >
                {pendingId === ex.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] px-2 py-1 rounded-full border font-medium transition-colors ${
        active
          ? "bg-primary/15 text-primary border-primary/40"
          : "bg-transparent text-muted-foreground border-border hover:border-primary/30"
      }`}
    >
      {label}
    </button>
  );
}
