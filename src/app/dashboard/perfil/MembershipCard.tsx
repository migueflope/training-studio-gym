import Link from "next/link";
import { Calendar, AlertTriangle, Crown } from "lucide-react";
import type { ActiveMembership } from "@/lib/auth/getActiveMembership";

interface MembershipCardProps {
  membership: ActiveMembership | null;
  isAdmin: boolean;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function MembershipCard({ membership, isAdmin }: MembershipCardProps) {
  if (isAdmin) {
    return (
      <div className="glass-panel rounded-2xl border border-primary/30 p-6 bg-primary/5">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-primary/15 rounded-lg shrink-0">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg mb-1">
              Acceso de administrador
            </h3>
            <p className="text-sm text-muted-foreground">
              Tu cuenta tiene acceso completo al panel sin necesidad de
              membresía.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="glass-panel rounded-2xl border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-muted/30 rounded-lg shrink-0">
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg mb-1">
              Sin membresía activa
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Activá un plan para desbloquear tus rutinas y reservas.
            </p>
            <Link
              href="/planes"
              className="inline-flex items-center px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ver planes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const daysLeft = membership.daysRemaining;
  const expiringSoon = daysLeft <= 7;

  return (
    <div
      className={`glass-panel rounded-2xl border p-6 ${
        expiringSoon ? "border-destructive/40 bg-destructive/5" : "border-primary/20"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-2.5 rounded-lg shrink-0 ${
            expiringSoon ? "bg-destructive/15" : "bg-primary/15"
          }`}
        >
          {expiringSoon ? (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          ) : (
            <Calendar className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Tu membresía
          </p>
          <h3 className="font-display font-bold text-xl mb-2">
            {membership.planName}
          </h3>
          <div className="text-sm text-muted-foreground space-y-0.5">
            <p>
              Vence el{" "}
              <span className="font-mono text-foreground">
                {fmtDate(membership.endDate)}
              </span>
            </p>
            <p
              className={
                expiringSoon ? "text-destructive font-bold" : ""
              }
            >
              {daysLeft === 0
                ? "Vence hoy"
                : daysLeft === 1
                ? "Vence mañana"
                : `${daysLeft} días restantes`}
            </p>
          </div>
          {expiringSoon && (
            <Link
              href="/planes"
              className="inline-flex items-center mt-4 px-4 py-2 text-sm font-bold bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
            >
              Renovar ahora
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
