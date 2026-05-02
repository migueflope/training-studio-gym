import Link from "next/link";
import { Users, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";
import {
  getDashboardStats,
  formatCop,
  formatDeltaPct,
} from "@/lib/admin/dashboardStats";
import { GrowthChart } from "./GrowthChart";

export const dynamic = "force-dynamic";

function DeltaBadge({
  pct,
  tone = "success",
}: {
  pct: number | null;
  tone?: "success" | "destructive";
}) {
  if (pct === null) {
    return (
      <span className="text-xs font-bold px-2 py-1 bg-secondary text-muted-foreground rounded-full">
        Sin datos
      </span>
    );
  }
  const positive = pct >= 0;
  const cls = positive
    ? "bg-success/20 text-success"
    : tone === "destructive"
      ? "bg-destructive/20 text-destructive"
      : "bg-secondary text-muted-foreground";
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${cls}`}>
      {formatDeltaPct(pct)}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">
          Resumen Financiero
        </h1>
        <p className="text-muted-foreground">
          Métricas clave del rendimiento del gimnasio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <DeltaBadge pct={stats.activeMembersDeltaPct} />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Miembros Activos</p>
          <h3 className="text-3xl font-bold font-display">
            {stats.activeMembers}
          </h3>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <DeltaBadge pct={stats.monthlyRevenueDeltaPct} />
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Ingresos (Mensual)
          </p>
          <h3 className="text-3xl font-bold font-display">
            {formatCop(stats.monthlyRevenueCop)}
          </h3>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-accent" />
            </div>
            {stats.pendingPayments > 0 ? (
              <span className="text-xs font-bold px-2 py-1 bg-destructive/20 text-destructive rounded-full">
                {stats.pendingPayments} Pendiente
                {stats.pendingPayments === 1 ? "" : "s"}
              </span>
            ) : (
              <span className="text-xs font-bold px-2 py-1 bg-success/20 text-success rounded-full">
                Al día
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Pagos por Validar</p>
          <h3 className="text-3xl font-bold font-display">
            {stats.pendingPayments}
          </h3>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Vencen en &lt; 7 días
          </p>
          <h3
            className={`text-3xl font-bold font-display ${
              stats.expiringSoon > 0 ? "text-destructive" : ""
            }`}
          >
            {stats.expiringSoon}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-border">
          <h3 className="text-xl font-display font-bold mb-6">
            Crecimiento de Usuarios
          </h3>
          <GrowthChart data={stats.growth} />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border flex flex-col">
          <h3 className="text-xl font-display font-bold mb-6">
            Acciones Rápidas
          </h3>
          <div className="space-y-4 flex-1">
            <Link
              href="/admin/pagos"
              className="w-full p-4 bg-secondary rounded-xl text-left hover:bg-secondary/80 transition-colors border border-border flex items-center justify-between group"
            >
              <div>
                <h4 className="font-bold text-sm">Validar Transferencias</h4>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingPayments === 0
                    ? "Sin comprobantes pendientes"
                    : `${stats.pendingPayments} comprobante${
                        stats.pendingPayments === 1 ? "" : "s"
                      } nuevo${stats.pendingPayments === 1 ? "" : "s"}`}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-4 h-4" />
              </div>
            </Link>
            <Link
              href="/admin/usuarios"
              className="w-full p-4 bg-secondary rounded-xl text-left hover:bg-secondary/80 transition-colors border border-border flex items-center justify-between group"
            >
              <div>
                <h4 className="font-bold text-sm">Enviar Recordatorios</h4>
                <p className="text-xs text-muted-foreground">
                  {stats.expiringSoon === 0
                    ? "Nadie por vencer esta semana"
                    : `${stats.expiringSoon} usuario${
                        stats.expiringSoon === 1 ? "" : "s"
                      } por vencer`}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
