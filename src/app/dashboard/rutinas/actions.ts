"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

function refresh(routineId?: string) {
  revalidatePath("/dashboard/rutinas");
  if (routineId) revalidatePath(`/dashboard/rutinas/${routineId}`);
}

type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

// ──────────────── Routines ────────────────

export async function createRoutine(): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await requireUser();

  const { data: routine, error } = await supabase
    .from("routines")
    .insert({
      owner_user_id: user.id,
      title: "Nueva rutina",
      source: "user",
    })
    .select("id")
    .single();
  if (error || !routine) return { ok: false, error: error?.message ?? "Error" };

  const { error: dayErr } = await supabase.from("routine_days").insert({
    routine_id: routine.id,
    day_number: 1,
    title: "Día 1",
  });
  if (dayErr) return { ok: false, error: dayErr.message };

  refresh(routine.id);
  return { ok: true, data: { id: routine.id } };
}

export async function updateRoutineMeta(
  id: string,
  patch: { title?: string; description?: string | null },
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (typeof patch.title === "string") update.title = patch.title.trim() || "Sin título";
  if (patch.description !== undefined) update.description = patch.description?.trim() || null;

  const { error } = await supabase
    .from("routines")
    .update(update)
    .eq("id", id)
    .eq("owner_user_id", user.id);
  if (error) return { ok: false, error: error.message };

  refresh(id);
  return { ok: true };
}

export async function deleteRoutine(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("routines")
    .delete()
    .eq("id", id)
    .eq("owner_user_id", user.id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

// ──────────────── Days ────────────────

export async function addDay(routineId: string): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await requireUser();

  // Confirm ownership and get next day number.
  const { data: routine, error: ownErr } = await supabase
    .from("routines")
    .select("id")
    .eq("id", routineId)
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (ownErr || !routine) return { ok: false, error: "Rutina no encontrada" };

  const { data: existing } = await supabase
    .from("routine_days")
    .select("day_number")
    .eq("routine_id", routineId)
    .order("day_number", { ascending: false })
    .limit(1);
  const nextNumber = (existing?.[0]?.day_number ?? 0) + 1;

  const { data: day, error } = await supabase
    .from("routine_days")
    .insert({
      routine_id: routineId,
      day_number: nextNumber,
      title: `Día ${nextNumber}`,
    })
    .select("id")
    .single();
  if (error || !day) return { ok: false, error: error?.message ?? "Error" };

  refresh(routineId);
  return { ok: true, data: { id: day.id } };
}

export async function updateDayTitle(
  dayId: string,
  title: string,
): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("routine_days")
    .update({ title: title.trim() || null })
    .eq("id", dayId);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function deleteDay(dayId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { data: day, error: fetchErr } = await supabase
    .from("routine_days")
    .select("id, routine_id, day_number")
    .eq("id", dayId)
    .maybeSingle();
  if (fetchErr || !day) return { ok: false, error: "Día no encontrado" };

  const { error: delErr } = await supabase.from("routine_days").delete().eq("id", dayId);
  if (delErr) return { ok: false, error: delErr.message };

  // Renumber remaining days so day_number stays contiguous (1..N).
  const { data: remaining } = await supabase
    .from("routine_days")
    .select("id, day_number")
    .eq("routine_id", day.routine_id)
    .order("day_number", { ascending: true });

  if (remaining && remaining.length > 0) {
    // Two-step renumber to avoid the UNIQUE(routine_id, day_number) collision:
    // first push everyone to a negative-temp range, then settle into 1..N.
    await Promise.all(
      remaining.map((d, i) =>
        supabase
          .from("routine_days")
          .update({ day_number: -(i + 1) })
          .eq("id", d.id),
      ),
    );
    await Promise.all(
      remaining.map((d, i) =>
        supabase
          .from("routine_days")
          .update({ day_number: i + 1 })
          .eq("id", d.id),
      ),
    );
  }

  refresh(day.routine_id);
  return { ok: true };
}

// ──────────────── Routine exercises ────────────────

export async function addExerciseToDay(
  dayId: string,
  exerciseId: string,
): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { data: existing } = await supabase
    .from("routine_exercises")
    .select("position")
    .eq("routine_day_id", dayId)
    .order("position", { ascending: false })
    .limit(1);
  const nextPos = (existing?.[0]?.position ?? -1) + 1;

  const { error } = await supabase.from("routine_exercises").insert({
    routine_day_id: dayId,
    exercise_id: exerciseId,
    position: nextPos,
    sets: 3,
    reps: 12,
    rest_seconds: 60,
  });
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function updateRoutineExercise(
  id: string,
  patch: {
    sets?: number;
    reps?: number | null;
    rest_seconds?: number | null;
    notes?: string | null;
  },
): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const update: Record<string, unknown> = {};
  if (typeof patch.sets === "number") update.sets = Math.max(1, Math.min(20, patch.sets));
  if (patch.reps !== undefined) update.reps = patch.reps;
  if (patch.rest_seconds !== undefined) update.rest_seconds = patch.rest_seconds;
  if (patch.notes !== undefined) update.notes = patch.notes?.trim() || null;
  if (Object.keys(update).length === 0) return { ok: true };

  const { error } = await supabase
    .from("routine_exercises")
    .update(update)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function removeRoutineExercise(id: string): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("routine_exercises").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function reorderRoutineExercises(
  dayId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  const { supabase } = await requireUser();

  // Same two-step trick as deleteDay to dodge any potential unique conflicts
  // and to keep the writes atomic from the user's perspective.
  await Promise.all(
    orderedIds.map((id, i) =>
      supabase
        .from("routine_exercises")
        .update({ position: -(i + 1) })
        .eq("id", id)
        .eq("routine_day_id", dayId),
    ),
  );
  const results = await Promise.all(
    orderedIds.map((id, i) =>
      supabase
        .from("routine_exercises")
        .update({ position: i })
        .eq("id", id)
        .eq("routine_day_id", dayId),
    ),
  );
  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) return { ok: false, error: firstErr.message };

  refresh();
  return { ok: true };
}
