"use client";

import { useState, useTransition } from "react";
import { Trophy, Plus, Trash2, Loader2, AlertCircle, Award } from "lucide-react";
import { addPersonalRecord, deletePersonalRecord } from "./actions";

export interface PersonalRecordRow {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  achievedOn: string;
  notes: string | null;
}

export interface ExerciseOption {
  id: string;
  name: string;
  muscleGroup: string | null;
}

interface PersonalRecordsSectionProps {
  records: PersonalRecordRow[];
  exercises: ExerciseOption[];
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PersonalRecordsSection({
  records,
  exercises,
}: PersonalRecordsSectionProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="glass-panel rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-success/10 rounded-lg">
            <Trophy className="w-5 h-5 text-success" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg">Récords personales</h2>
            <p className="text-xs text-muted-foreground">
              El mayor peso que levantaste en cada ejercicio.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Cargar récord
        </button>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Cargá tu primer récord para empezar a trackear tu fuerza.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {records.map((r) => (
            <PRRow key={r.id} record={r} />
          ))}
        </ul>
      )}

      {showForm && (
        <AddPRDialog exercises={exercises} onClose={() => setShowForm(false)} />
      )}
    </section>
  );
}

function PRRow({ record }: { record: PersonalRecordRow }) {
  const [pending, startTransition] = useTransition();
  const handleDelete = () => {
    if (!confirm("¿Borrar este récord?")) return;
    startTransition(async () => {
      await deletePersonalRecord(record.id);
    });
  };

  return (
    <li className="py-3 flex items-center gap-4">
      <div className="p-2 bg-success/10 rounded-lg shrink-0">
        <Award className="w-4 h-4 text-success" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{record.exerciseName}</p>
        <p className="text-xs text-muted-foreground font-mono">
          {record.weightKg} kg × {record.reps} reps · {fmtDate(record.achievedOn)}
        </p>
        {record.notes && (
          <p className="text-xs text-muted-foreground italic">{record.notes}</p>
        )}
      </div>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
        aria-label="Borrar"
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </li>
  );
}

function AddPRDialog({
  exercises,
  onClose,
}: {
  exercises: ExerciseOption[];
  onClose: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("1");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await addPersonalRecord({
        exerciseId,
        weightKg: Number(weight),
        reps: Number.parseInt(reps, 10),
        achievedOn: date,
        notes: notes || null,
      });
      if (!res.ok) return setError(res.error);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <h3 className="font-display font-bold text-lg">Nuevo récord personal</h3>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Ejercicio
          </label>
          <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm">
            {exercises.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
                {e.muscleGroup ? ` — ${e.muscleGroup}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Peso (kg)
            </label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} step="0.5" min="0" required className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Reps
            </label>
            <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} step="1" min="1" required className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Fecha
            </label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={today} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Notas (opcional)
          </label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: técnica buena, RPE 9…" className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={pending} className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-secondary transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" disabled={pending} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar récord
          </button>
        </div>
      </form>
    </div>
  );
}
