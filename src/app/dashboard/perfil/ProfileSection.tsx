"use client";

import { useState, useTransition } from "react";
import { Loader2, AlertCircle, Check, User, Phone } from "lucide-react";
import { updateProfile } from "./actions";
import type { UserRole } from "@/lib/auth/roles";

interface ProfileSectionProps {
  fullName: string;
  phone: string | null;
  role: UserRole;
}

const ROLE_LABEL: Record<UserRole, string> = {
  owner: "Propietario",
  partner: "Partner",
  member: "Socio",
};

export function ProfileSection({ fullName, phone, role }: ProfileSectionProps) {
  const [name, setName] = useState(fullName);
  const [tel, setTel] = useState(phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const dirty = name.trim() !== fullName || (tel.trim() || null) !== phone;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await updateProfile({ fullName: name, phone: tel });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel rounded-2xl border border-border p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg">Datos personales</h3>
        <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          Tipo de cuenta: {ROLE_LABEL[role]}
        </span>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Nombre completo
        </label>
        <div className="relative mt-1">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            placeholder="Tu nombre"
            maxLength={80}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Teléfono
        </label>
        <div className="relative mt-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="tel"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            placeholder="+57 300 123 4567"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
          <Check className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Listo, guardamos los cambios.</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!dirty || pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar cambios
        </button>
      </div>
    </form>
  );
}
