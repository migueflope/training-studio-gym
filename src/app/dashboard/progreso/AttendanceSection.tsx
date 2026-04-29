"use client";

import { useState, useTransition } from "react";
import { Flame, Calendar, Check, Loader2 } from "lucide-react";
import { recordAttendance, deleteAttendance } from "./actions";

interface AttendanceSectionProps {
  userId: string;
  attendanceDates: string[];
  streak: { current: number; longest: number; thisMonth: number };
}

export function AttendanceSection({
  attendanceDates,
  streak,
}: AttendanceSectionProps) {
  const [pending, startTransition] = useTransition();
  const todayStr = new Date().toISOString().slice(0, 10);
  const attendedToday = attendanceDates.includes(todayStr);

  const handleToggle = () => {
    startTransition(async () => {
      if (attendedToday) {
        await deleteAttendance(todayStr);
      } else {
        await recordAttendance(todayStr);
      }
    });
  };

  return (
    <section className="glass-panel rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Flame className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg">Asistencia</h2>
            <p className="text-xs text-muted-foreground">
              Registrá cada día que viniste al club.
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={pending}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors disabled:opacity-50 ${
            attendedToday
              ? "border border-success/30 text-success hover:bg-success/10"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : attendedToday ? (
            <>
              <Check className="w-4 h-4" />
              Vine hoy
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              Registrar entreno de hoy
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <StreakStat
          label="Racha actual"
          value={streak.current}
          unit={streak.current === 1 ? "día" : "días"}
          highlight
        />
        <StreakStat
          label="Mejor racha"
          value={streak.longest}
          unit={streak.longest === 1 ? "día" : "días"}
        />
        <StreakStat
          label="Este mes"
          value={streak.thisMonth}
          unit={streak.thisMonth === 1 ? "visita" : "visitas"}
        />
      </div>

      <AttendanceGrid dates={attendanceDates} />
    </section>
  );
}

function StreakStat({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-3 text-center ${
        highlight
          ? "border-accent/30 bg-accent/5"
          : "border-border bg-secondary/30"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-2xl font-display font-bold">
        {value}
        <span className="text-xs font-normal text-muted-foreground ml-1">
          {unit}
        </span>
      </p>
    </div>
  );
}

/** 8-week heatmap of attendance days. */
function AttendanceGrid({ dates }: { dates: string[] }) {
  const set = new Set(dates);
  const weeks = 8;
  const today = new Date();
  // Start: 8 weeks ago, snapped back to Monday so columns align by week.
  const start = new Date(today);
  start.setDate(start.getDate() - weeks * 7 + 1);

  const cells: { iso: string; attended: boolean; isFuture: boolean }[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    cells.push({
      iso,
      attended: set.has(iso),
      isFuture: d > today,
    });
  }

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
        Últimas 8 semanas
      </p>
      <div className="grid grid-flow-col grid-rows-7 gap-1 w-fit">
        {cells.map((c) => (
          <div
            key={c.iso}
            title={c.attended ? `Entrenaste el ${c.iso}` : c.iso}
            className={`w-3.5 h-3.5 rounded-sm ${
              c.isFuture
                ? "bg-secondary/20"
                : c.attended
                ? "bg-primary"
                : "bg-secondary/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
