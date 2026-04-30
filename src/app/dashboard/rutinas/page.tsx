import Link from "next/link";
import { Dumbbell, Sparkles, UserCheck, User } from "lucide-react";
import { requireActiveMembership } from "@/lib/auth/requireActiveMembership";
import { createClient } from "@/lib/supabase/server";
import { NewRoutineButton } from "./NewRoutineButton";
import { DeleteRoutineButton } from "./DeleteRoutineButton";

export const dynamic = "force-dynamic";

type RoutineSource = "user" | "trainer" | "ai";

type RoutineRow = {
  id: string;
  title: string;
  description: string | null;
  source: RoutineSource;
  updated_at: string;
  routine_days: { id: string; routine_exercises: { id: string }[] }[];
};

const sourceMeta: Record<RoutineSource, { label: string; icon: typeof User; className: string }> = {
  user: { label: "Tuya", icon: User, className: "bg-secondary/60 text-muted-foreground border-border" },
  trainer: { label: "Entrenador", icon: UserCheck, className: "bg-primary/15 text-primary border-primary/30" },
  ai: { label: "IA", icon: Sparkles, className: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
};

export default async function RoutinesListPage() {
  const { profile } = await requireActiveMembership();
  const supabase = await createClient();

  const { data: routines } = await supabase
    .from("routines")
    .select(
      "id, title, description, source, updated_at, routine_days(id, routine_exercises(id))",
    )
    .eq("owner_user_id", profile.id)
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  const list = (routines ?? []) as RoutineRow[];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Mis Rutinas</h1>
          <p className="text-muted-foreground">
            Armá tu plan o entrená con la rutina que te asignó tu entrenador.
          </p>
        </div>
        <NewRoutineButton />
      </div>

      {list.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-dashed border-border p-12 text-center">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <h3 className="font-display font-bold text-lg mb-2">Todavía no tenés rutinas</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Creá una desde cero o esperá a que tu entrenador te asigne un plan.
          </p>
          <NewRoutineButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((r) => {
            const meta = sourceMeta[r.source];
            const Icon = meta.icon;
            const dayCount = r.routine_days.length;
            const exerciseCount = r.routine_days.reduce(
              (acc, d) => acc + d.routine_exercises.length,
              0,
            );
            return (
              <div
                key={r.id}
                className="glass-panel rounded-2xl border border-border p-5 hover:border-primary/40 transition-colors group relative"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Link href={`/dashboard/rutinas/${r.id}`} className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors truncate">
                      {r.title}
                    </h3>
                    {r.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {r.description}
                      </p>
                    )}
                  </Link>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${meta.className}`}
                  >
                    <Icon className="w-3 h-3" />
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {dayCount} {dayCount === 1 ? "día" : "días"} · {exerciseCount} ejercicios
                  </span>
                  <DeleteRoutineButton id={r.id} title={r.title} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
