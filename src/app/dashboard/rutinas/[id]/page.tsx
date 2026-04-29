import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireActiveMembership } from "@/lib/auth/requireActiveMembership";
import { createClient } from "@/lib/supabase/server";
import { RoutineEditor } from "./RoutineEditor";
import type { EditorRoutine, ExerciseLibItem } from "./types";

export const dynamic = "force-dynamic";

export default async function RoutineEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireActiveMembership();
  const supabase = await createClient();

  const { data: routine, error } = await supabase
    .from("routines")
    .select(
      `id, title, description, source, owner_user_id,
        routine_days(id, day_number, title,
          routine_exercises(id, position, sets, reps, rest_seconds, notes,
            exercises(id, name, muscle_group, equipment, difficulty)))`,
    )
    .eq("id", id)
    .eq("owner_user_id", profile.id)
    .maybeSingle();

  if (error || !routine) notFound();

  const { data: library } = await supabase
    .from("exercises")
    .select("id, name, muscle_group, equipment, difficulty")
    .order("muscle_group", { ascending: true })
    .order("name", { ascending: true });

  // Sort nested rows client-safely (server-side too, before sending to client).
  const days = (routine.routine_days ?? [])
    .slice()
    .sort((a, b) => a.day_number - b.day_number)
    .map((d) => ({
      id: d.id,
      day_number: d.day_number,
      title: d.title,
      exercises: (d.routine_exercises ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((re) => ({
          id: re.id,
          position: re.position,
          sets: re.sets,
          reps: re.reps,
          rest_seconds: re.rest_seconds,
          notes: re.notes,
          exercise: re.exercises as unknown as EditorRoutine["days"][number]["exercises"][number]["exercise"],
        })),
    }));

  const editorRoutine: EditorRoutine = {
    id: routine.id,
    title: routine.title,
    description: routine.description,
    source: routine.source,
    days,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Link
        href="/dashboard/rutinas"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Mis Rutinas
      </Link>

      <RoutineEditor routine={editorRoutine} library={(library ?? []) as ExerciseLibItem[]} />
    </div>
  );
}
