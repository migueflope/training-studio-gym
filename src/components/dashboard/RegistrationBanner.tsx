import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface RegistrationBannerProps {
  missingPhone: boolean;
  missingMembership: boolean;
}

export function RegistrationBanner({
  missingPhone,
  missingMembership,
}: RegistrationBannerProps) {
  if (!missingPhone && !missingMembership) return null;

  const title = missingMembership
    ? "Termina de registrarte"
    : "Completá tu perfil";

  const message = missingPhone && missingMembership
    ? "Falta tu teléfono y activar tu plan para acceder al club."
    : missingPhone
      ? "Necesitamos tu número de WhatsApp para que el equipo pueda contactarte."
      : "Activá un plan para acceder al club y desbloquear tu panel completo.";

  const primary = missingPhone
    ? { href: "/dashboard/perfil", label: "Completar perfil" }
    : { href: "/planes", label: "Ver planes" };

  const secondary =
    missingPhone && missingMembership
      ? { href: "/planes", label: "Ver planes" }
      : null;

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 bg-primary/15 rounded-lg shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-base text-primary mb-1">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Link
            href={primary.href}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all"
          >
            {primary.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
          {secondary && (
            <Link
              href={secondary.href}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-primary/40 text-sm font-medium text-foreground rounded-lg hover:bg-primary/5 transition-colors"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
