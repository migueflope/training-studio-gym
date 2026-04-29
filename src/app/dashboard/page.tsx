import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  Flame,
  Trophy,
  Sparkles,
  Dumbbell,
  CreditCard,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";
import { requireActiveMembership } from "@/lib/auth/requireActiveMembership";

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const { profile, isAdmin, membership } = await requireActiveMembership();

  let timeProgress = 0;
  if (membership) {
    const start = new Date(membership.startDate).getTime();
    const end = new Date(membership.endDate).getTime();
    const now = Date.now();
    const total = end - start;
    timeProgress = total > 0 ? Math.min(100, Math.max(0, ((now - start) / total) * 100)) : 0;
  }

  const expiringSoon = !!membership && membership.daysRemaining <= 7;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {expiringSoon && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm">
              {membership!.daysRemaining === 0
                ? "Tu membresía vence hoy"
                : membership!.daysRemaining === 1
                ? "Tu membresía vence mañana"
                : `Tu membresía vence en ${membership!.daysRemaining} días`}
            </h4>
            <p className="text-xs opacity-90 mt-1">
              Renová ahora para no perder el acceso al club ni tu rutina personalizada.
            </p>
          </div>
          <Link
            href="/planes"
            className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1.5 rounded hover:bg-destructive/90 transition-colors shrink-0"
          >
            Renovar
          </Link>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-display font-bold mb-2">
          Hola, {profile.firstName} 👋
        </h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Tenés acceso completo al club. Acá tu vista de socio."
            : membership
            ? "Acá está tu resumen del club."
            : "Bienvenido a Training Studio."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            {isAdmin ? (
              <span className="text-xs font-bold px-2 py-1 bg-primary/20 text-primary rounded-full">
                Admin
              </span>
            ) : membership ? (
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  expiringSoon
                    ? "bg-destructive/20 text-destructive"
                    : "bg-success/20 text-success"
                }`}
              >
                Activa
              </span>
            ) : (
              <span className="text-xs font-bold px-2 py-1 bg-muted/30 text-muted-foreground rounded-full">
                Inactiva
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Membresía</p>
          {isAdmin ? (
            <>
              <h3 className="text-xl font-bold font-display mb-1">
                Acceso de administrador
              </h3>
              <p className="text-sm text-muted-foreground">Sin fecha de vencimiento</p>
            </>
          ) : membership ? (
            <>
              <h3 className="text-xl font-bold font-display mb-1">
                {membership.planName}
              </h3>
              <p className="text-sm font-mono text-muted-foreground">
                Vence: {fmtDate(membership.endDate)}
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-xs mb-1">
                  <span>Días restantes</span>
                  <span className="font-bold">{membership.daysRemaining}</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${expiringSoon ? "bg-destructive" : "bg-primary"}`}
                    style={{ width: `${100 - timeProgress}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold font-display mb-1">Sin plan activo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Activá un plan para empezar.
              </p>
              <Link
                href="/planes"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              >
                Ver planes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border opacity-80">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Flame className="w-5 h-5 text-accent" />
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-muted/40 text-muted-foreground rounded-full uppercase tracking-wider">
              Próximamente
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Racha de asistencias</p>
          <h3 className="text-xl font-bold font-display mb-1">Activá tu racha</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Pronto vas a poder ver cuántos días seguidos venís entrenando.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border opacity-80">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <Trophy className="w-5 h-5 text-success" />
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-muted/40 text-muted-foreground rounded-full uppercase tracking-wider">
              Próximamente
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Tu meta principal</p>
          <h3 className="text-xl font-bold font-display mb-1">Ponete un objetivo</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Definí qué querés lograr y seguí tu progreso semana a semana.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-display font-bold mb-4">Atajos</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ShortcutCard
            href="/dashboard/membresia"
            icon={<CreditCard className="w-5 h-5" />}
            title="Mi membresía"
            description="Plan, fechas, pagos"
          />
          <ShortcutCard
            href="/dashboard/rutinas"
            icon={<Dumbbell className="w-5 h-5" />}
            title="Rutinas"
            description="Tu plan de entrenamiento"
          />
          <ShortcutCard
            href="/dashboard/progreso"
            icon={<TrendingUp className="w-5 h-5" />}
            title="Progreso y Metas"
            description="Pesos, medidas, objetivos"
          />
          <ShortcutCard
            href="/dashboard/referidos"
            icon={<Users className="w-5 h-5" />}
            title="Referidos"
            description="Invitá amigos al club"
            comingSoon
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/15 rounded-lg shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg mb-1">
              Estamos construyendo más cosas
            </h3>
            <p className="text-sm text-muted-foreground">
              Pronto vas a poder armar rutinas, registrar tu progreso y trackear
              metas dentro del panel. Por ahora explorá las secciones disponibles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShortcutCard({
  href,
  icon,
  title,
  description,
  comingSoon = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  comingSoon?: boolean;
}) {
  if (comingSoon) {
    return (
      <div
        aria-disabled
        className="glass-panel p-5 rounded-2xl border border-border opacity-60 cursor-not-allowed relative overflow-hidden"
      >
        <span className="absolute top-2 right-2 text-[9px] font-bold tracking-wider uppercase bg-primary/15 text-primary px-2 py-0.5 rounded-full border border-primary/30">
          Próximamente
        </span>
        <div className="p-2 bg-primary/10 rounded-lg w-fit mb-3 text-primary">
          {icon}
        </div>
        <h4 className="font-bold text-sm mb-0.5">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    );
  }
  return (
    <Link
      href={href}
      className="glass-panel p-5 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors group"
    >
      <div className="p-2 bg-primary/10 rounded-lg w-fit mb-3 text-primary">
        {icon}
      </div>
      <h4 className="font-bold text-sm mb-0.5 group-hover:text-primary transition-colors">
        {title}
      </h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}
