import { createClient } from "@/lib/supabase/server";
import { requireActiveMembership } from "@/lib/auth/requireActiveMembership";
import { BodyMetricsSection, type BodyMetricRow } from "./BodyMetricsSection";
import { AttendanceSection } from "./AttendanceSection";
import {
  PersonalRecordsSection,
  type PersonalRecordRow,
  type ExerciseOption,
} from "./PersonalRecordsSection";
import {
  ProgressPhotosSection,
  type ProgressPhotoRow,
} from "./ProgressPhotosSection";
import { GoalsSection, type GoalRow } from "./GoalsSection";
import { computeAttendanceStreak } from "./streak";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const { profile } = await requireActiveMembership();
  const supabase = await createClient();

  const [
    { data: rawMetrics },
    { data: rawPrs },
    { data: rawAttendances },
    { data: rawPhotos },
    { data: rawGoals },
    { data: rawExercises },
  ] = await Promise.all([
    supabase
      .from("body_metrics")
      .select(
        "id, measured_on, weight_kg, body_fat_pct, waist_cm, chest_cm, hip_cm, arm_cm, thigh_cm, notes",
      )
      .eq("user_id", profile.id)
      .order("measured_on", { ascending: false })
      .limit(120),
    supabase
      .from("personal_records")
      .select("id, weight_kg, reps, achieved_on, notes, exercises(id, name)")
      .eq("user_id", profile.id)
      .order("achieved_on", { ascending: false })
      .limit(50),
    supabase
      .from("attendances")
      .select("attended_on")
      .eq("user_id", profile.id)
      .order("attended_on", { ascending: false })
      .limit(180),
    supabase
      .from("progress_photos")
      .select("id, taken_on, photo_path, label, notes")
      .eq("user_id", profile.id)
      .order("taken_on", { ascending: false })
      .limit(60),
    supabase
      .from("goals")
      .select(
        "id, title, target_value, start_value, current_value, unit, target_date, status, created_at",
      )
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("exercises")
      .select("id, name, muscle_group")
      .order("name", { ascending: true }),
  ]);

  const metrics: BodyMetricRow[] = (rawMetrics ?? []).map((m) => ({
    id: m.id,
    measuredOn: m.measured_on,
    weightKg: m.weight_kg !== null ? Number(m.weight_kg) : null,
    bodyFatPct: m.body_fat_pct !== null ? Number(m.body_fat_pct) : null,
    waistCm: m.waist_cm !== null ? Number(m.waist_cm) : null,
    chestCm: m.chest_cm !== null ? Number(m.chest_cm) : null,
    hipCm: m.hip_cm !== null ? Number(m.hip_cm) : null,
    armCm: m.arm_cm !== null ? Number(m.arm_cm) : null,
    thighCm: m.thigh_cm !== null ? Number(m.thigh_cm) : null,
    notes: m.notes,
  }));

  const prs: PersonalRecordRow[] = (rawPrs ?? []).map((r) => {
    const ex = Array.isArray(r.exercises) ? r.exercises[0] : r.exercises;
    return {
      id: r.id,
      exerciseId: ex?.id ?? "",
      exerciseName: ex?.name ?? "Ejercicio",
      weightKg: Number(r.weight_kg),
      reps: r.reps,
      achievedOn: r.achieved_on,
      notes: r.notes,
    };
  });

  const attendanceDates: string[] = (rawAttendances ?? []).map(
    (a) => a.attended_on,
  );
  const streak = computeAttendanceStreak(attendanceDates);

  const photos: ProgressPhotoRow[] = await Promise.all(
    (rawPhotos ?? []).map(async (p) => {
      const { data: signed } = await supabase.storage
        .from("progress-photos")
        .createSignedUrl(p.photo_path, 60 * 60);
      return {
        id: p.id,
        takenOn: p.taken_on,
        path: p.photo_path,
        url: signed?.signedUrl ?? null,
        label: p.label,
        notes: p.notes,
      };
    }),
  );

  const goals: GoalRow[] = (rawGoals ?? []).map((g) => ({
    id: g.id,
    title: g.title,
    startValue: g.start_value !== null ? Number(g.start_value) : null,
    currentValue: g.current_value !== null ? Number(g.current_value) : null,
    targetValue: g.target_value !== null ? Number(g.target_value) : null,
    unit: g.unit,
    targetDate: g.target_date,
    status: g.status,
    createdAt: g.created_at,
  }));

  const exercises: ExerciseOption[] = (rawExercises ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    muscleGroup: e.muscle_group,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Progreso y metas</h1>
        <p className="text-muted-foreground">
          Cargá tus mediciones, tu asistencia, tus récords y los objetivos que
          querés cumplir. Todo manualmente — vos elegís cada cuánto.
        </p>
      </div>

      <BodyMetricsSection metrics={metrics} />
      <AttendanceSection
        userId={profile.id}
        attendanceDates={attendanceDates}
        streak={streak}
      />
      <PersonalRecordsSection records={prs} exercises={exercises} />
      <ProgressPhotosSection userId={profile.id} photos={photos} />
      <GoalsSection goals={goals} />
    </div>
  );
}
