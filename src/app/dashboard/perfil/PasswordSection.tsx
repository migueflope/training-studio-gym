"use client";

import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PasswordField } from "@/components/auth/PasswordField";

interface Props {
  email: string;
}

export function PasswordSection({ email }: Props) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (next !== confirm) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (next === current) {
      setError("La nueva contraseña debe ser distinta de la actual.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Validate current password by trying to sign in.
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password: current,
    });
    if (signInErr) {
      setLoading(false);
      setError("Contraseña actual incorrecta.");
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({
      password: next,
    });
    setLoading(false);

    if (updateErr) {
      setError(updateErr.message);
      return;
    }

    setSuccess(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <section className="glass-panel rounded-2xl border border-border p-6">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <KeyRound className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Contraseña</h3>
            <p className="text-sm text-muted-foreground">
              Cambiá tu contraseña cuando quieras.
            </p>
          </div>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => {
              reset();
              setOpen(true);
            }}
            className="text-sm font-bold text-primary hover:underline shrink-0"
          >
            Cambiar
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {success && (
            <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Contraseña actualizada.</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground pl-1">
              Contraseña actual
            </label>
            <PasswordField
              value={current}
              onChange={setCurrent}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground pl-1">
              Nueva contraseña
            </label>
            <PasswordField
              value={next}
              onChange={setNext}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground pl-1">
              Confirmar nueva contraseña
            </label>
            <PasswordField
              value={confirm}
              onChange={setConfirm}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
