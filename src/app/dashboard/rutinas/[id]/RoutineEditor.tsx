"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Library, Loader2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  addDay,
  deleteDay,
  reorderRoutineExercises,
  updateDayTitle,
  updateRoutineMeta,
} from "../actions";
import type { EditorRoutine, ExerciseLibItem } from "./types";
import { ExercisePicker } from "./ExercisePicker";
import { SortableExerciseRow } from "./SortableExerciseRow";

interface Props {
  routine: EditorRoutine;
  library: ExerciseLibItem[];
}

export function RoutineEditor({ routine, library }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialDayId = routine.days[0]?.id ?? null;
  const [activeDayId, setActiveDayId] = useState<string | null>(initialDayId);
  const [titleDraft, setTitleDraft] = useState(routine.title);

  // Local optimistic copy of the exercise order, keyed by day id. Falls back
  // to server-provided order on every render where the day hasn't been touched.
  const [orderOverride, setOrderOverride] = useState<Record<string, string[]>>({});

  const activeDay = routine.days.find((d) => d.id === activeDayId) ?? routine.days[0];
  const orderedExercises = useMemo(() => {
    if (!activeDay) return [];
    const override = orderOverride[activeDay.id];
    if (!override) return activeDay.exercises;
    const map = new Map(activeDay.exercises.map((e) => [e.id, e]));
    return override.map((id) => map.get(id)).filter(Boolean) as typeof activeDay.exercises;
  }, [activeDay, orderOverride]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleTitleSave = () => {
    if (titleDraft === routine.title) return;
    startTransition(async () => {
      const r = await updateRoutineMeta(routine.id, { title: titleDraft });
      if (!r.ok) alert(r.error);
      router.refresh();
    });
  };

  const handleAddDay = () => {
    startTransition(async () => {
      const r = await addDay(routine.id);
      if (r.ok && r.data) setActiveDayId(r.data.id);
      else if (!r.ok) alert(r.error);
      router.refresh();
    });
  };

  const handleDeleteDay = (dayId: string) => {
    if (routine.days.length <= 1) {
      alert("La rutina necesita al menos un día.");
      return;
    }
    if (!confirm("¿Borrar este día y todos sus ejercicios?")) return;
    startTransition(async () => {
      const r = await deleteDay(dayId);
      if (!r.ok) alert(r.error);
      else {
        const remaining = routine.days.filter((d) => d.id !== dayId);
        setActiveDayId(remaining[0]?.id ?? null);
      }
      router.refresh();
    });
  };

  const handleDayTitleSave = (dayId: string, newTitle: string) => {
    startTransition(async () => {
      const r = await updateDayTitle(dayId, newTitle);
      if (!r.ok) alert(r.error);
      router.refresh();
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !activeDay) return;

    const ids = orderedExercises.map((e) => e.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(ids, oldIndex, newIndex);
    setOrderOverride((prev) => ({ ...prev, [activeDay.id]: next }));

    startTransition(async () => {
      const r = await reorderRoutineExercises(activeDay.id, next);
      if (!r.ok) {
        alert(r.error);
        // Revert on failure
        setOrderOverride((prev) => {
          const copy = { ...prev };
          delete copy[activeDay.id];
          return copy;
        });
      }
      router.refresh();
    });
  };

  const totalExercises = routine.days.reduce((acc, d) => acc + d.exercises.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="w-full bg-transparent text-3xl font-display font-bold focus:outline-none border-b border-transparent hover:border-border focus:border-primary pb-2 transition-colors"
            placeholder="Título de la rutina"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {routine.days.length} {routine.days.length === 1 ? "día" : "días"} · {totalExercises} ejercicios
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {isPending && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Guardando…
            </span>
          )}
          <button
            disabled
            title="Próximamente"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-secondary/50 text-muted-foreground rounded-lg font-medium opacity-60 cursor-not-allowed"
          >
            <Library className="w-4 h-4" /> Plantillas IA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Exercise picker */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ExercisePicker
            library={library}
            activeDayId={activeDay?.id ?? null}
            disabled={!activeDay}
          />
        </div>

        {/* Day editor */}
        <div className="glass-panel rounded-2xl border border-border p-6 min-h-[500px] flex flex-col">
          {/* Day tabs */}
          <DayTabs
            days={routine.days}
            activeDayId={activeDay?.id ?? null}
            onSelect={setActiveDayId}
            onAdd={handleAddDay}
            onDelete={handleDeleteDay}
            onRename={handleDayTitleSave}
            isPending={isPending}
          />

          {/* Day content */}
          {!activeDay ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Esta rutina no tiene días. Agregá uno arriba.</p>
            </div>
          ) : orderedExercises.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl mt-4 p-8">
              <Library className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">Día vacío</p>
              <p className="text-sm">Añadí ejercicios desde el panel izquierdo</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={orderedExercises.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 mt-4">
                  {orderedExercises.map((ex) => (
                    <SortableExerciseRow key={ex.id} exercise={ex} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}

interface DayTabsProps {
  days: EditorRoutine["days"];
  activeDayId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  isPending: boolean;
}

function DayTabs({ days, activeDayId, onSelect, onAdd, onDelete, onRename, isPending }: DayTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  return (
    <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-thin">
      {days.map((d) => {
        const isActive = d.id === activeDayId;
        const isEditing = editingId === d.id;
        const display = d.title ?? `Día ${d.day_number}`;
        return (
          <div key={d.id} className="shrink-0 group relative">
            {isEditing ? (
              <input
                autoFocus
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={() => {
                  if (draftTitle.trim() && draftTitle !== display) {
                    onRename(d.id, draftTitle);
                  }
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="px-3 py-2 bg-background border border-primary rounded-lg text-sm font-medium focus:outline-none w-36"
              />
            ) : (
              <button
                onClick={() => onSelect(d.id)}
                onDoubleClick={() => {
                  setDraftTitle(display);
                  setEditingId(d.id);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"
                }`}
                title="Doble click para renombrar"
              >
                {display}
              </button>
            )}
            {isActive && days.length > 1 && !isEditing && (
              <button
                onClick={() => onDelete(d.id)}
                disabled={isPending}
                className="ml-1 text-xs text-muted-foreground hover:text-destructive p-1 disabled:opacity-50"
                aria-label="Borrar día"
                title="Borrar día"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
      <button
        onClick={onAdd}
        disabled={isPending}
        className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors border border-dashed border-border disabled:opacity-50"
      >
        <Plus className="w-3.5 h-3.5" /> Día
      </button>
    </div>
  );
}
