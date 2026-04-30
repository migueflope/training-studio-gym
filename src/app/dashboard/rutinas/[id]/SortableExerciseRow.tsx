"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Trash2, Loader2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { removeRoutineExercise, updateRoutineExercise } from "../actions";
import type { EditorExercise } from "./types";

export function SortableExerciseRow({ exercise }: { exercise: EditorExercise }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sets, setSets] = useState(exercise.sets);
  const [reps, setReps] = useState(exercise.reps ?? 12);
  const [rest, setRest] = useState(exercise.rest_seconds ?? 60);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exercise.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const persist = (patch: Parameters<typeof updateRoutineExercise>[1]) => {
    startTransition(async () => {
      const r = await updateRoutineExercise(exercise.id, patch);
      if (!r.ok) alert(r.error);
      router.refresh();
    });
  };

  const handleRemove = () => {
    if (!confirm(`¿Quitar ${exercise.exercise.name} de este día?`)) return;
    startTransition(async () => {
      const r = await removeRoutineExercise(exercise.id);
      if (!r.ok) alert(r.error);
      router.refresh();
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-secondary/40 border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center group relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

      <div className="flex items-center gap-3 sm:w-auto">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing touch-none"
          aria-label="Arrastrar para reordenar"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
          {exercise.exercise.muscle_group.slice(0, 3)}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-sm leading-tight truncate">{exercise.exercise.name}</h4>
          <p className="text-[11px] text-muted-foreground truncate">
            {exercise.exercise.muscle_group}
            {exercise.exercise.equipment ? ` · ${exercise.exercise.equipment}` : ""}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-start sm:justify-end gap-4 sm:gap-6">
        <NumField
          label="SERIES"
          value={sets}
          min={1}
          max={20}
          onChange={(v) => setSets(v)}
          onCommit={(v) => v !== exercise.sets && persist({ sets: v })}
        />
        <NumField
          label="REPS"
          value={reps}
          min={1}
          max={100}
          onChange={(v) => setReps(v)}
          onCommit={(v) => v !== exercise.reps && persist({ reps: v })}
        />
        <NumField
          label="DESCANSO"
          value={rest}
          step={15}
          min={0}
          max={600}
          unit="seg"
          width="w-16"
          onChange={(v) => setRest(v)}
          onCommit={(v) => v !== exercise.rest_seconds && persist({ rest_seconds: v })}
        />
      </div>

      <button
        onClick={handleRemove}
        disabled={isPending}
        className="sm:ml-2 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 self-end sm:self-auto"
        aria-label="Quitar ejercicio"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

function NumField({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  width = "w-12",
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  width?: string;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
}) {
  return (
    <div className="text-center">
      <label className="text-[10px] text-muted-foreground block mb-1 tracking-wider font-medium">
        {label}
      </label>
      <div className="flex items-center">
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const n = parseInt(e.target.value);
            if (!isNaN(n)) onChange(n);
          }}
          onBlur={() => onCommit(value)}
          className={`${width} bg-background border border-border ${unit ? "rounded-l" : "rounded"} p-1.5 text-center font-mono text-sm focus:border-primary outline-none`}
        />
        {unit && (
          <span className="bg-secondary border border-l-0 border-border rounded-r p-1.5 text-[10px] text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
