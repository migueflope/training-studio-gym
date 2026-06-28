"use client";

import { useState } from "react";
import {
  AlertTriangle,
  X,
  Clock,
  MessageCircle,
  Mail,
  CheckCircle2,
} from "lucide-react";
import type { ExpiringMember } from "@/lib/admin/dashboardStats";

function whatsappLink(phone: string, message: string): string {
  let digits = phone.replace(/\D/g, "");
  // Celulares colombianos de 10 dígitos (empiezan por 3): anteponer indicativo 57.
  if (digits.length === 10 && digits.startsWith("3")) digits = `57${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function whenText(daysLeft: number): string {
  if (daysLeft <= 0) return "hoy";
  if (daysLeft === 1) return "mañana";
  return `en ${daysLeft} días`;
}

function reminderMessage(member: ExpiringMember): string {
  const firstName = member.fullName.split(" ")[0] || member.fullName;
  return `Hola ${firstName} 👋 Te recordamos que tu membresía ${member.planName} en Training Studio vence ${whenText(member.daysLeft)}. ¿Quieres renovarla para no perder tu progreso? 💪`;
}

function fmtDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

export function ExpiringSoonCard({
  count,
  members,
}: {
  count: number;
  members: ExpiringMember[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass-panel p-6 rounded-2xl border border-border text-left w-full hover:border-destructive/40 hover:bg-destructive/[0.03] transition-colors group cursor-pointer"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          {count > 0 && (
            <span className="text-xs font-bold text-muted-foreground group-hover:text-destructive transition-colors">
              Ver lista →
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-1">
          Vencen en &lt; 7 días
        </p>
        <h3
          className={`text-3xl font-bold font-display ${
            count > 0 ? "text-destructive" : ""
          }`}
        >
          {count}
        </h3>
      </button>

      {open && (
        <ExpiringModal members={members} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function ExpiringModal({
  members,
  onClose,
}: {
  members: ExpiringMember[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[85vh]"
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-display font-bold">
              Membresías por vencer
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {members.length === 0
                ? "Nadie por vencer esta semana"
                : `${members.length} ${
                    members.length === 1 ? "socio está" : "socios están"
                  } por vencer en los próximos 7 días`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3">
          {members.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 text-success" />
              <p className="text-sm">Todas las membresías están al día 🎉</p>
            </div>
          ) : (
            members.map((m) => <ExpiringRow key={m.userId} member={m} />)
          )}
        </div>
      </div>
    </div>
  );
}

function ExpiringRow({ member }: { member: ExpiringMember }) {
  const urgent = member.daysLeft <= 1;
  const soon = member.daysLeft <= 3;
  const badgeCls = urgent
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : soon
      ? "bg-primary/15 text-primary border-primary/30"
      : "bg-secondary text-muted-foreground border-border";

  const initials =
    member.fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold border border-primary/30 shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm truncate">{member.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {member.planName} · vence {fmtDate(member.endDate)}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border whitespace-nowrap ${badgeCls}`}
        >
          <Clock className="w-3 h-3" />
          {member.daysLeft <= 0
            ? "Vence hoy"
            : member.daysLeft === 1
              ? "Vence mañana"
              : `${member.daysLeft} días`}
        </span>
      </div>

      <div className="flex gap-2 mt-3">
        {member.phone ? (
          <a
            href={whatsappLink(member.phone, reminderMessage(member))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-success/15 text-success border border-success/30 hover:bg-success/25 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        ) : (
          <span className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border/50 text-muted-foreground">
            <MessageCircle className="w-3.5 h-3.5" />
            Sin WhatsApp
          </span>
        )}
        {member.email ? (
          <a
            href={`mailto:${member.email}?subject=${encodeURIComponent(
              "Tu membresía en Training Studio está por vencer",
            )}&body=${encodeURIComponent(reminderMessage(member))}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </a>
        ) : (
          <span className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border/50 text-muted-foreground">
            <Mail className="w-3.5 h-3.5" />
            Sin email
          </span>
        )}
      </div>
    </div>
  );
}
