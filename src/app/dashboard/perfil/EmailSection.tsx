"use client";

import { useState, useTransition } from "react";
import { Loader2, AlertCircle, Mail, MailCheck, X } from "lucide-react";
import { requestEmailChange } from "./actions";

interface EmailSectionProps {
  currentEmail: string;
}

export function EmailSection({ currentEmail }: EmailSectionProps) {
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const closeModal = () => {
    setOpen(false);
    setNewEmail("");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await requestEmailChange(newEmail);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSentTo(res.sentTo);
      setOpen(false);
      setNewEmail("");
    });
  };

  return (
    <div className="glass-panel rounded-2xl border border-border p-6 space-y-4">
      <h3 className="font-display font-bold text-lg">Cuenta</h3>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Email
          </p>
          <p className="text-sm font-mono truncate">{currentEmail}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-colors shrink-0"
        >
          <Mail className="w-4 h-4" />
          Cambiar email
        </button>
      </div>

      {sentTo && (
        <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
          <MailCheck className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
          <div>
            <p className="font-bold mb-1">Confirmá el cambio en tu nuevo email</p>
            <p className="text-muted-foreground">
              Te mandamos un correo a{" "}
              <span className="font-mono text-foreground">{sentTo}</span>. Hacé
              clic en el link para activar el cambio. Mientras tanto seguís
              ingresando con tu email actual.
            </p>
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">Cambiar email</h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              Te enviaremos un link de confirmación al email nuevo. El cambio
              se aplica recién cuando hagas clic en ese link.
            </p>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nuevo email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                autoFocus
                className="mt-1 w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="nuevo@email.com"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={pending}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending || !newEmail.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar confirmación
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
