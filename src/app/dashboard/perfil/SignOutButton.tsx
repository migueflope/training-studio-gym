"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "./actions";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handle = () => {
    startTransition(async () => {
      await signOut();
      router.push("/");
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      Cerrar sesión
    </button>
  );
}
