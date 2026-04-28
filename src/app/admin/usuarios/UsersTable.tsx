"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, Loader2, AlertCircle, Crown, Shield } from "lucide-react";
import { activateMembership, cancelMembership } from "./actions";
import type { UserRole } from "@/lib/auth/roles";

export interface PlanOption {
  id: string;
  name: string;
  durationDays: number;
  priceCop: number;
}

export interface ActiveMembershipRow {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
}

export interface AdminUserRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  activeMembership: ActiveMembershipRow | null;
}

interface UsersTableProps {
  rows: AdminUserRow[];
  plans: PlanOption[];
}

function fmtCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export function UsersTable({ rows, plans }: UsersTableProps) {
  const [activatingFor, setActivatingFor] = useState<AdminUserRow | null>(null);
  const [cancellingFor, setCancellingFor] = useState<AdminUserRow | null>(null);

  return (
    <div className="glass-panel rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 border-b border-border">
            <tr className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Membresía</th>
              <th className="px-4 py-3">Registro</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Todavía no hay usuarios registrados.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {row.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.avatarUrl}
                        alt={row.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold border border-primary/30">
                        {row.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold truncate">{row.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{row.email}</p>
                      {row.phone && (
                        <p className="text-xs text-muted-foreground truncate">{row.phone}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={row.role} />
                </td>
                <td className="px-4 py-3">
                  {row.activeMembership ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {row.activeMembership.planName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Vence {fmtDate(row.activeMembership.endDate)}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <XCircle className="w-3.5 h-3.5" />
                      Sin membresía
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                  {fmtDate(row.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  {row.activeMembership ? (
                    <button
                      onClick={() => setCancellingFor(row)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Cancelar
                    </button>
                  ) : (
                    <button
                      onClick={() => setActivatingFor(row)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Activar membresía
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activatingFor && (
        <ActivateModal
          user={activatingFor}
          plans={plans}
          onClose={() => setActivatingFor(null)}
        />
      )}
      {cancellingFor && cancellingFor.activeMembership && (
        <CancelModal
          user={cancellingFor}
          membershipId={cancellingFor.activeMembership.id}
          onClose={() => setCancellingFor(null)}
        />
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === "owner") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-primary/15 border border-primary/40 text-primary">
        <Crown className="w-3 h-3" /> Owner
      </span>
    );
  }
  if (role === "partner") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
        <Shield className="w-3 h-3" /> Partner
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-secondary text-muted-foreground">
      Member
    </span>
  );
}

function ActivateModal({
  user,
  plans,
  onClose,
}: {
  user: AdminUserRow;
  plans: PlanOption[];
  onClose: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [startDate, setStartDate] = useState(today);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedPlan = plans.find((p) => p.id === planId);
  const computedEnd = selectedPlan
    ? (() => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + selectedPlan.durationDays);
        return d.toISOString().slice(0, 10);
      })()
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!planId) return setError("Elegí un plan");
    startTransition(async () => {
      const res = await activateMembership({ userId: user.id, planId, startDate });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
    });
  };

  return (
    <ModalShell title={`Activar membresía — ${user.fullName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Plan
          </label>
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {fmtCop(p.priceCop)} ({p.durationDays} días)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Fecha de inicio
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
          />
        </div>

        {computedEnd && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
            <span className="text-muted-foreground">La membresía vencerá el </span>
            <span className="font-bold text-primary">{fmtDate(computedEnd)}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-secondary transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Activar membresía
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function CancelModal({
  user,
  membershipId,
  onClose,
}: {
  user: AdminUserRow;
  membershipId: string;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await cancelMembership(membershipId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
    });
  };

  return (
    <ModalShell title={`Cancelar membresía — ${user.fullName}`} onClose={onClose}>
      <p className="text-sm text-muted-foreground mb-4">
        El usuario perderá acceso al panel inmediatamente. Esta acción se puede
        revertir activando un nuevo plan.
      </p>
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <button
          onClick={onClose}
          disabled={pending}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-secondary transition-colors disabled:opacity-50"
        >
          Volver
        </button>
        <button
          onClick={handleConfirm}
          disabled={pending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          Sí, cancelar
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <h3 className="text-lg font-display font-bold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
