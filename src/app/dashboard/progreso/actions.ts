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

function refresh() {
  revalidatePath("/dashboard/progreso");
  revalidatePath("/dashboard");
}

// ──────────────── Body metrics ────────────────

export interface BodyMetricInput {
  measuredOn: string; // yyyy-mm-dd
  weightKg?: number | null;
  bodyFatPct?: number | null;
  waistCm?: number | null;
  chestCm?: number | null;
  hipCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  notes?: string | null;
}

export async function addBodyMetric(input: BodyMetricInput) {
  const { supabase, user } = await requireUser();

  const numericFields: Array<keyof BodyMetricInput> = [
    "weightKg",
    "bodyFatPct",
    "waistCm",
    "chestCm",
    "hipCm",
    "armCm",
    "thighCm",
  ];
  const hasAny = numericFields.some(
    (k) => typeof input[k] === "number" && (input[k] as number) > 0,
  );
  if (!hasAny) {
    return { ok: false as const, error: "Cargá al menos una medida" };
  }

  const { error } = await supabase.from("body_metrics").insert({
    user_id: user.id,
    measured_on: input.measuredOn,
    weight_kg: input.weightKg ?? null,
    body_fat_pct: input.bodyFatPct ?? null,
    waist_cm: input.waistCm ?? null,
    chest_cm: input.chestCm ?? null,
    hip_cm: input.hipCm ?? null,
    arm_cm: input.armCm ?? null,
    thigh_cm: input.thighCm ?? null,
    notes: input.notes?.trim() || null,
  });
  if (error) return { ok: false as const, error: error.message };

  refresh();
  return { ok: true as const };
}

export async function deleteBodyMetric(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("body_metrics")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false as const, error: error.message };
  refresh();
  return { ok: true as const };
}

// ──────────────── Personal records ────────────────

export interface PersonalRecordInput {
  exerciseId: string;
  weightKg: number;
  reps: number;
  achievedOn: string;
  notes?: string | null;
}

export async function addPersonalRecord(input: PersonalRecordInput) {
  const { supabase, user } = await requireUser();
  if (!input.exerciseId) return { ok: false as const, error: "Elegí un ejercicio" };
  if (!Number.isFinite(input.weightKg) || input.weightKg <= 0)
    return { ok: false as const, error: "Peso inválido" };
  if (!Number.isInteger(input.reps) || input.reps < 1)
    return { ok: false as const, error: "Reps inválidas" };

  const { error } = await supabase.from("personal_records").insert({
    user_id: user.id,
    exercise_id: input.exerciseId,
    weight_kg: input.weightKg,
    reps: input.reps,
    achieved_on: input.achievedOn,
    notes: input.notes?.trim() || null,
  });
  if (error) return { ok: false as const, error: error.message };
  refresh();
  return { ok: true as const };
}

export async function deletePersonalRecord(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("personal_records")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false as const, error: error.message };
  refresh();
  return { ok: true as const };
}

// ──────────────── Attendance ────────────────

export async function recordAttendance(date: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("attendances")
    .insert({ user_id: user.id, attended_on: date });
  // Duplicate is fine (unique constraint), just refresh and report success.
  if (error && !error.message.toLowerCase().includes("duplicate")) {
    return { ok: false as const, error: error.message };
  }
  refresh();
  return { ok: true as const };
}

export async function deleteAttendance(date: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("attendances")
    .delete()
    .eq("user_id", user.id)
    .eq("attended_on", date);
  if (error) return { ok: false as const, error: error.message };
  refresh();
  return { ok: true as const };
}

// ──────────────── Progress photos ────────────────

export interface ProgressPhotoInput {
  takenOn: string;
  photoPath: string;
  label?: string | null;
  notes?: string | null;
}

export async function addProgressPhoto(input: ProgressPhotoInput) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("progress_photos").insert({
    user_id: user.id,
    taken_on: input.takenOn,
    photo_path: input.photoPath,
    label: input.label?.trim() || null,
    notes: input.notes?.trim() || null,
  });
  if (error) return { ok: false as const, error: error.message };
  refresh();
  return { ok: true as const };
}

export async function deleteProgressPhoto(id: string) {
  const { supabase, user } = await requireUser();
  const { data: photo } = await supabase
    .from("progress_photos")
    .select("photo_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (photo?.photo_path) {
    await supabase.storage.from("progress-photos").remove([photo.photo_path]);
  }
  const { error } = await supabase
    .from("progress_photos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false as const, error: error.message };
  refresh();
  return { ok: true as const };
}

// ──────────────── Goals ────────────────

export interface GoalInput {
  title: string;
  startValue?: number | null;
  currentValue?: number | null;
  targetValue?: number | null;
  unit?: string | null;
  targetDate?: string | null;
}

export async function createGoal(input: GoalInput) {
  const { supabase, user } = await requireUser();
  const title = input.title.trim();
  if (title.length < 3) return { ok: false as const, error: "Título demasiado corto" };

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title,
    start_value: input.startValue ?? null,
    current_value: input.currentValue ?? input.startValue ?? null,
    target_value: input.targetValue ?? null,
    unit: input.unit?.trim() || null,
    target_date: input.targetDate || null,
    status: "active",
  });
  if (error) return { ok: false as const, error: error.message };
  refresh();
  return { ok: true as const };
}

export async function updateGoalProgress(id: string, currentValue: number) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("goals")
    .update({ current_value: currentValue })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false as const, error: error.message };
  refresh();
  return { ok: true as const };
}

export async function setGoalStatus(
  id: string,
  status: "active" | "achieved" | "cancelled",
) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("goals")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false as const, error: error.message };
  refresh();
  return { ok: true as const };
}

export async function deleteGoal(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false as const, error: error.message };
  refresh();
  return { ok: true as const };
}
