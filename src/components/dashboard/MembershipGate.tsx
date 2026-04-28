import Link from "next/link";
import { Lock, Sparkles, ArrowRight, MessageCircle } from "lucide-react";

interface MembershipGateProps {
  fullName: string;
}

export function MembershipGate({ fullName }: MembershipGateProps) {
  const firstName = fullName.split(" ")[0];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-16 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(212,175,55,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(212,175,55,0.08),transparent_50%)]" />

      <div className="relative w-full max-w-xl">
        <div className="glass-panel rounded-3xl border border-primary/20 bg-background/80 backdrop-blur-xl p-8 md:p-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5),0_0_60px_-20px_rgba(212,175,55,0.25)] text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 border border-primary/30 shadow-[0_0_30px_-4px_rgba(212,175,55,0.5)]">
            <Lock className="w-9 h-9 text-primary" />
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
            Bienvenido, {firstName}
          </h1>
          <p className="text-muted-foreground text-[15px] md:text-base leading-relaxed mb-8 max-w-md mx-auto">
            Tu cuenta está lista, pero todavía no tenés una membresía activa.
            Elegí un plan para desbloquear tus rutinas, progreso, reservas y
            todo lo que el club tiene para vos.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href="/planes"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-bold bg-primary text-primary-foreground rounded-full shadow-[0_0_24px_rgba(212,175,55,0.45)] hover:shadow-[0_0_32px_rgba(212,175,55,0.7)] hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Ver planes disponibles
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-medium border border-border rounded-full hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Hablar con un asesor
            </Link>
          </div>

          <div className="pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              ¿Ya pagaste tu plan? Tu membresía se activa apenas el equipo
              confirme el pago. Si pasaron más de 24 h,{" "}
              <Link
                href="/contacto"
                className="text-primary hover:underline font-medium"
              >
                escribinos
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
