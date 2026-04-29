"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { approvePayment, rejectPayment } from "./actions";

export type PaymentStatus = "pending" | "confirmed" | "rejected";

export interface AdminPaymentRow {
  id: string;
  status: PaymentStatus;
  amountCop: number;
  method: string;
  transactionRef: string | null;
  rejectionReason: string | null;
  proofUrl: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
  plan: {
    id: string;
    name: string;
    priceCop: number;
  };
}

interface PaymentsAdminTableProps {
  payments: AdminPaymentRow[];
}

const METHOD_LABELS: Record<string, string> = {
  bancolombia: "Bancolombia",
  nequi: "Nequi",
  daviplata: "Daviplata",
  efectivo: "Efectivo",
};

function fmtCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PaymentsAdminTable({ payments }: PaymentsAdminTableProps) {
  const [filter, setFilter] = useState<PaymentStatus>("pending");
  const [rejectFor, setRejectFor] = useState<AdminPaymentRow | null>(null);

  const filtered = payments.filter((p) => p.status === filter);
  const pendingCount = payments.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 bg-secondary/40 rounded-xl border border-border w-fit">
        <FilterTab
          label="Pendientes"
          count={pendingCount}
          active={filter === "pending"}
          onClick={() => setFilter("pending")}
        />
        <FilterTab
          label="Confirmados"
          count={payments.filter((p) => p.status === "confirmed").length}
          active={filter === "confirmed"}
          onClick={() => setFilter("confirmed")}
        />
        <FilterTab
          label="Rechazados"
          count={payments.filter((p) => p.status === "rejected").length}
          active={filter === "rejected"}
          onClick={() => setFilter("rejected")}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No hay pagos en este estado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <PaymentCard
              key={p.id}
              payment={p}
              onReject={() => setRejectFor(p)}
            />
          ))}
        </div>
      )}

      {rejectFor && (
        <RejectModal
          payment={rejectFor}
          onClose={() => setRejectFor(null)}
        />
      )}
    </div>
  );
}

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
            active ? "bg-primary/15 text-primary" : "bg-secondary"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function PaymentCard({
  payment,
  onReject,
}: {
  payment: AdminPaymentRow;
  onReject: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const amountMatches = payment.amountCop >= payment.plan.priceCop;

  const handleApprove = () => {
    if (
      !confirm(
        `¿Confirmar este pago de ${fmtCop(payment.amountCop)} de ${payment.user.fullName}? Se va a activar la membresía del plan "${payment.plan.name}".`,
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      const res = await approvePayment(payment.id);
      if (!res.ok) setError(res.error);
    });
  };

  return (
    <div className="glass-panel rounded-2xl border border-border p-5">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {payment.user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={payment.user.avatarUrl}
              alt={payment.user.fullName}
              className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
              {payment.user.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold truncate">{payment.user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {payment.user.email}
            </p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="text-right">
          <p className="text-xl font-bold font-mono">
            {fmtCop(payment.amountCop)}
          </p>
          <p className="text-xs text-muted-foreground">
            {fmtDateTime(payment.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <Field label="Plan" value={payment.plan.name} />
        <Field label="Esperado" value={fmtCop(payment.plan.priceCop)} />
        <Field
          label="Método"
          value={METHOD_LABELS[payment.method] ?? payment.method}
        />
        <Field
          label="Referencia"
          value={payment.transactionRef ?? "—"}
          mono
        />
      </div>

      {!amountMatches && payment.status === "pending" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            El monto pagado es menor al precio del plan ({fmtCop(payment.plan.priceCop)}).
            Verificá antes de confirmar.
          </span>
        </div>
      )}

      {payment.status === "rejected" && payment.rejectionReason && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
          <span className="font-bold">Motivo del rechazo: </span>
          {payment.rejectionReason}
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        {payment.proofUrl ? (
          <a
            href={payment.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Ver comprobante
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">
            Sin comprobante adjunto
          </span>
        )}

        {payment.status === "pending" && (
          <div className="flex gap-2">
            <button
              onClick={onReject}
              disabled={pending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Rechazar
            </button>
            <button
              onClick={handleApprove}
              disabled={pending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-success text-white rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Confirmar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className={mono ? "font-mono" : ""}>{value}</p>
    </div>
  );
}

function RejectModal({
  payment,
  onClose,
}: {
  payment: AdminPaymentRow;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await rejectPayment(payment.id, reason);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
      >
        <h3 className="font-display font-bold text-lg">
          Rechazar pago — {payment.user.fullName}
        </h3>
        <p className="text-sm text-muted-foreground">
          El user va a recibir el motivo en su panel. Sé claro para que pueda
          corregir y volver a subir el comprobante.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej: el comprobante no corresponde a un pago a nuestra cuenta, o el monto no coincide…"
          rows={4}
          required
          minLength={4}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm resize-none"
        />
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
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
            disabled={pending || reason.trim().length < 4}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Rechazar pago
          </button>
        </div>
      </form>
    </div>
  );
}
