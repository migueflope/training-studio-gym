"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteRoutine } from "./actions";

export function DeleteRoutineButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm(`¿Borrar "${title}"? Esta acción no se puede deshacer.`)) return;
        startTransition(async () => {
          const result = await deleteRoutine(id);
          if (!result.ok) alert(result.error);
          else router.refresh();
        });
      }}
      disabled={isPending}
      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
      aria-label="Borrar rutina"
    >
      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}
