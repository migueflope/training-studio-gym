"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createRoutine } from "./actions";

export function NewRoutineButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const result = await createRoutine();
          if (result.ok && result.data) {
            router.push(`/dashboard/rutinas/${result.data.id}`);
          } else if (!result.ok) {
            alert(result.error);
          }
        })
      }
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all disabled:opacity-60 disabled:cursor-wait"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
      Nueva rutina
    </button>
  );
}
