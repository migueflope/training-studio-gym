"use client";

import { useMemo, useState, useTransition } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Plus, Loader2, AlertCircle, Trash2, Scale } from "lucide-react";
import { addBodyMetric, deleteBodyMetric } from "./actions";

export interface BodyMetricRow {
  id: string;
  measuredOn: string;
  weightKg: number | null;
  bodyFatPct: number | null;
  waistCm: number | null;
  chestCm: number | null;
  hipCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  notes: string | null;
}

interface BodyMetricsSectionProps {
  metrics: BodyMetricRow[];
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
}

export function BodyMetricsSection({ metrics }: BodyMetricsSectionProps) {
  const [showForm, setShowForm] = useState(false);

  const chartData = useMemo(
    () =>
      [...metrics]
        .filter((m) => m.weightKg !== null)
        .reverse()
        .map((m) => ({
          date: fmtDate(m.measuredOn),
          weight: m.weightKg,
        })),
    [metrics],
  );

  const latest = metrics[0];

  return (
    <section className="glass-panel rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg">Peso y medidas</h2>
            <p className="text-xs text-muted-foreground">
              Seguí tu evolución corporal con mediciones manuales.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Cargar medición
        </button>
      </div>

      {chartData.length >= 2 && (
        <div className="mb-4 h-48 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "rgb(150 150 150)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "rgb(150 150 150)" }}
                axisLine={false}
                tickLine={false}
                width={36}
                domain={["dataMin - 1", "dataMax + 1"]}
              />
              <Tooltip
                contentStyle={{
                  background: "rgb(20 20 20)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  borderRadius: "0.5rem",
                  fontSize: "0.75rem",
                }}
                labelStyle={{ color: "rgb(212,175,55)", fontWeight: 700 }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="rgb(212,175,55)"
                strokeWidth={2}
                dot={{ r: 3, fill: "rgb(212,175,55)" }}
                activeDot={{ r: 5 }}
                name="Peso (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Stat label="Peso" value={latest.weightKg} unit="kg" />
          <Stat label="% grasa" value={latest.bodyFatPct} unit="%" />
          <Stat label="Cintura" value={latest.waistCm} unit="cm" />
          <Stat label="Pecho" value={latest.chestCm} unit="cm" />
          <Stat label="Cadera" value={latest.hipCm} unit="cm" />
          <Stat label="Brazo" value={latest.armCm} unit="cm" />
          <Stat label="Muslo" value={latest.thighCm} unit="cm" />
        </div>
      )}

      {metrics.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Cargá tu primera medición para empezar a ver tu evolución.
        </p>
      ) : (
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-primary hover:underline list-none flex items-center gap-1">
            <span className="group-open:hidden">Ver historial completo</span>
            <span className="hidden group-open:inline">Ocultar historial</span>
          </summary>
          <ul className="mt-3 divide-y divide-border border-t border-border">
            {metrics.map((m) => (
              <MetricRow key={m.id} metric={m} />
            ))}
          </ul>
        </details>
      )}

      {showForm && (
        <AddMetricDialog onClose={() => setShowForm(false)} />
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  if (value === null) {
    return (
      <div className="rounded-lg bg-secondary/30 border border-border px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm text-muted-foreground/60">—</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-secondary/30 border border-border px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-bold font-mono">
        {value} <span className="text-muted-foreground font-normal">{unit}</span>
      </p>
    </div>
  );
}

function MetricRow({ metric }: { metric: BodyMetricRow }) {
  const [pending, startTransition] = useTransition();
  const handleDelete = () => {
    if (!confirm("¿Borrar esta medición?")) return;
    startTransition(async () => {
      await deleteBodyMetric(metric.id);
    });
  };
  const parts: string[] = [];
  if (metric.weightKg !== null) parts.push(`${metric.weightKg} kg`);
  if (metric.bodyFatPct !== null) parts.push(`${metric.bodyFatPct}% grasa`);
  if (metric.waistCm !== null) parts.push(`Cint ${metric.waistCm} cm`);
  if (metric.chestCm !== null) parts.push(`Pec ${metric.chestCm} cm`);
  if (metric.armCm !== null) parts.push(`Brz ${metric.armCm} cm`);
  if (metric.thighCm !== null) parts.push(`Mus ${metric.thighCm} cm`);

  return (
    <li className="py-2.5 flex items-center justify-between gap-3">
      <div className="min-w-0 text-sm">
        <p className="font-mono text-xs text-muted-foreground">
          {fmtDate(metric.measuredOn)}{" "}
          {new Date(metric.measuredOn).getFullYear()}
        </p>
        <p className="truncate">{parts.join(" · ") || "—"}</p>
        {metric.notes && (
          <p className="text-xs text-muted-foreground italic">
            {metric.notes}
          </p>
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

function AddMetricDialog({ onClose }: { onClose: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [waist, setWaist] = useState("");
  const [chest, setChest] = useState("");
  const [hip, setHip] = useState("");
  const [arm, setArm] = useState("");
  const [thigh, setThigh] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const numOrNull = (v: string): number | null => {
    if (!v.trim()) return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await addBodyMetric({
        measuredOn: date,
        weightKg: numOrNull(weight),
        bodyFatPct: numOrNull(bodyFat),
        waistCm: numOrNull(waist),
        chestCm: numOrNull(chest),
        hipCm: numOrNull(hip),
        armCm: numOrNull(arm),
        thighCm: numOrNull(thigh),
        notes: notes || null,
      });
      if (!res.ok) return setError(res.error);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <h3 className="font-display font-bold text-lg">Cargar medición</h3>
        <p className="text-xs text-muted-foreground">
          Llená sólo los campos que tengas a mano. Podés volver a cargar lo que falte después.
        </p>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NumField label="Peso (kg)" value={weight} setValue={setWeight} step="0.1" />
          <NumField label="% Grasa" value={bodyFat} setValue={setBodyFat} step="0.1" />
          <NumField label="Cintura (cm)" value={waist} setValue={setWaist} step="0.5" />
          <NumField label="Pecho (cm)" value={chest} setValue={setChest} step="0.5" />
          <NumField label="Cadera (cm)" value={hip} setValue={setHip} step="0.5" />
          <NumField label="Brazo (cm)" value={arm} setValue={setArm} step="0.5" />
          <NumField label="Muslo (cm)" value={thigh} setValue={setThigh} step="0.5" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm resize-none"
            placeholder="Cómo te sentís, contexto, etc"
          />
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
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

function NumField({
  label,
  value,
  setValue,
  step,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  step: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        step={step}
        min="0"
        className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
      />
    </div>
  );
}
