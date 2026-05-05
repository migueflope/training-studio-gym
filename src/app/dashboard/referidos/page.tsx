import { Users, Gift, Share2, Copy, Lock } from "lucide-react";
import { requireActiveMembership } from "@/lib/auth/requireActiveMembership";

export const dynamic = "force-dynamic";

export default async function ReferidosPage() {
  const { profile, isAdmin } = await requireActiveMembership();

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-panel rounded-2xl border border-border p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Próximamente</h2>
          <p className="text-sm text-muted-foreground">
            Estamos trabajando en el sistema de referidos. Pronto vas a poder
            invitar amigos y ganar beneficios por cada uno que se sume al club.
          </p>
        </div>
      </div>
    );
  }

  const referralCode = profile.firstName.toUpperCase().slice(0, 8).replace(/\s/g, "") + "10";
  const referralLink = `https://training-studio-gym-ten.vercel.app/?ref=${referralCode}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Referidos</h1>
          <p className="text-muted-foreground">
            Invitá amigos al club y ganá beneficios por cada uno que active su membresía.
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-bold px-2 py-1 bg-primary/15 text-primary rounded-full uppercase tracking-wider border border-primary/30">
          Preview
        </span>
      </div>

      <div className="glass-panel rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/15 rounded-lg text-primary">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-lg">Tu link de referido</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm font-mono"
          />
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold opacity-60 cursor-not-allowed"
          >
            <Copy className="w-4 h-4" /> Copiar
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Tu código: <span className="font-mono font-bold text-foreground">{referralCode}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-border">
          <div className="p-2 bg-success/10 rounded-lg w-fit mb-3 text-success">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Tus referidos
          </p>
          <h3 className="text-3xl font-bold font-display">0</h3>
          <p className="text-xs text-muted-foreground mt-1">amigos invitados</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-border">
          <div className="p-2 bg-accent/10 rounded-lg w-fit mb-3 text-accent">
            <Gift className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Beneficios ganados
          </p>
          <h3 className="text-3xl font-bold font-display">$0</h3>
          <p className="text-xs text-muted-foreground mt-1">en descuentos acumulados</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-border">
          <div className="p-2 bg-primary/10 rounded-lg w-fit mb-3 text-primary">
            <Share2 className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Veces compartido
          </p>
          <h3 className="text-3xl font-bold font-display">0</h3>
          <p className="text-xs text-muted-foreground mt-1">click en tu link</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Cómo funciona</h3>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center">
              1
            </span>
            <div>
              <h4 className="font-bold text-sm mb-1">Compartí tu link</h4>
              <p className="text-sm text-muted-foreground">
                Mandalo por WhatsApp, redes o copialo y pegalo donde quieras.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center">
              2
            </span>
            <div>
              <h4 className="font-bold text-sm mb-1">Tu amigo se suma</h4>
              <p className="text-sm text-muted-foreground">
                Cuando active su primer plan, queda registrado como tu referido.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center">
              3
            </span>
            <div>
              <h4 className="font-bold text-sm mb-1">Ganás recompensa</h4>
              <p className="text-sm text-muted-foreground">
                Recibís un beneficio en tu próxima renovación (descuento, días extra
                o sesión gratis).
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
