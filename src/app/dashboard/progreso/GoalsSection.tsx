"use client";

import { useState, useTransition } from "react";
import {
  Target,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit3,
  Check,
} from "lucide-react";
import {
  createGoal,
  updateGoalProgress,
  setGoalStatus,
  deleteGoal,
} from "./actions";

export type GoalStatus = "active" | "achieved" | "cancelled";

export interface GoalRow {
  id: string;
  title: string;
  startValue: number | null;
  currentValue: number | null;
  targetValue: number | null;
  unit: string | null;
  targetDate: string | null;
  status: GoalStatus;
  createdAt: string;
}

interface GoalsSectionProps {
  goals: GoalRow[];
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function progressPct(goal: GoalRow): number | null {
  const { startValue, currentValue, targetValue } = goal;
  if (
    startValue === null ||
    currentValue === null ||
    targetValue === null ||
    startValue === targetValue
  )
    return null;
  const pct = ((currentValue - startValue) / (targetValue - startValue)) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function GoalsSection({ goals }: GoalsSectionProps) {
  const [showForm, setShowForm] = useState(false);

  const active = goals.filter((g) => g.status === "active");
  const archived = goals.filter((g) => g.status !== "active");

  return (
    <section className="glass-panel rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-success/10 rounded-lg">
            <Target className="w-5 h-5 text-success" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg">Mis metas</h2>
            <p className="text-xs text-muted-foreground">
              Lo que querés lograr y cómo vas.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva meta
        </button>
      </div>

      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Definí tu primer objetivo. Bajar peso, ganar masa muscular, correr 5K…
        </p>
      ) : (
        <div className="space-y-3">
          {active.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
          {archived.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground list-none">
                Ver archivadas ({archived.length})
              </summary>
              <div className="mt-3 space-y-3 opacity-70">
                {archived.map((g) => (
                  <GoalCard key={g.id} goal={g} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {showForm && <CreateGoalDialog onClose={() => setShowForm(false)} />}
    </section>
  );
}

function GoalCard({ goal }: { goal: GoalRow }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const pct = progressPct(goal);

  const handleArchive = (next: GoalStatus) => {
    startTransition(async () => {
      await setGoalStatus(goal.id, next);
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Borrar la meta "${goal.title}"?`)) return;
    startTransition(async () => {
      await deleteGoal(goal.id);
    });
  };

  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-sm truncate">{goal.title}</p>
            <StatusBadge status={goal.status} />
          </div>
          {(goal.startValue !== null || goal.targetValue !== null) && (
            <p className="text-xs text-muted-foreground font-mono">
              {goal.startValue ?? "?"} → {goal.targetValue ?? "?"}
              {goal.unit ? ` ${goal.unit}` : ""}
              {goal.currentValue !== null && (
                <span className="text-foreground font-bold">
                  {" · ahora "}
                  {goal.currentValue}
                  {goal.unit ? ` ${goal.unit}` : ""}
                </span>
              )}
            </p>
          )}
          {goal.targetDate && (
            <p className="text-xs text-muted-foreground">
              Fecha objetivo: {fmtDate(goal.targetDate)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {goal.status === "active" && (
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Editar progreso"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {goal.status === "active" && (
            <button
              onClick={() => handleArchive("achieved")}
              disabled={pending}
              className="p-1.5 rounded-md text-success hover:bg-success/10 transition-colors disabled:opacity-50"
              aria-label="Marcar lograda"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {goal.status === "active" && (
            <button
              onClick={() => handleArchive("cancelled")}
              disabled={pending}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              aria-label="Cancelar"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={pending}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            aria-label="Borrar"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {pct !== null && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-bold">{Math.round(pct)}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${pct >= 100 ? "bg-success" : "bg-primary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {editing && (
        <UpdateProgressForm
          goal={goal}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: GoalStatus }) {
  if (status === "achieved")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
        <CheckCircle2 className="w-3 h-3" /> Lograda
      </span>
    );
  if (status === "cancelled")
    return (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted/30 text-muted-foreground border border-border">
        Cancelada
      </span>
    );
  return null;
}

function UpdateProgressForm({
  goal,
  onClose,
}: {
  goal: GoalRow;
  onClose: () => void;
}) {
  const [value, setValue] = useState(
    goal.currentValue !== null ? String(goal.currentValue) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const n = Number(value);
    if (!Number.isFinite(n)) return setError("Valor inválido");
    startTransition(async () => {
      const res = await updateGoalProgress(goal.id, n);
      if (!res.ok) return setError(res.error);
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-border flex items-end gap-2">
      <div className="flex-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Valor actual {goal.unit && `(${goal.unit})`}
        </label>
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
        />
      </div>
      <button type="submit" disabled={pending} className="inline-flex items-center gap-1 px-3 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
        {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        Guardar
      </button>
      <button type="button" onClick={onClose} className="px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
        Cancelar
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}

function CreateGoalDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [startValue, setStartValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("kg");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numOr = (s: string): number | null => {
      if (!s.trim()) return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };
    startTransition(async () => {
      const res = await createGoal({
        title,
        startValue: numOr(startValue),
        currentValue: numOr(startValue),
        targetValue: numOr(targetValue),
        unit: unit || null,
        targetDate: targetDate || null,
      });
      if (!res.ok) return setError(res.error);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <h3 className="font-display font-bold text-lg">Nueva meta</h3>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Objetivo
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Bajar 5kg, Press de banca 100kg, Correr 5K"
            required
            minLength={3}
            maxLength={120}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Inicio
            </label>
            <input type="number" step="any" value={startValue} onChange={(e) => setStartValue(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Objetivo
            </label>
            <input type="number" step="any" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Unidad
            </label>
            <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg" maxLength={10} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Fecha objetivo (opcional)
          </label>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" />
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
            Crear meta
          </button>
        </div>
      </form>
    </div>
  );
}
